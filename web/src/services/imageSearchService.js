/**
 * Image Search Service
 * Provides multiple image search sources with fallback options
 */

class ImageSearchService {
  constructor() {
    this.sources = {
      unsplash: {
        name: 'Unsplash',
        apiKey: null,
        baseUrl: 'https://api.unsplash.com',
        enabled: false
      },
      pexels: {
        name: 'Pexels',
        apiKey: null,
        baseUrl: 'https://api.pexels.com/v1',
        enabled: false
      },
      pixabay: {
        name: 'Pixabay',
        apiKey: null,
        baseUrl: 'https://pixabay.com/api',
        enabled: false
      },
      google: {
        name: 'Google Custom Search',
        apiKey: null,
        searchEngineId: null,
        baseUrl: 'https://www.googleapis.com/customsearch/v1',
        enabled: false
      }
    };
    this.apiKeysLoaded = false;
  }

  /**
   * Load API keys from the backend
   */
  async loadApiKeys() {
    if (this.apiKeysLoaded) return;

    try {
      const response = await fetch('/api/settings/public');
      if (response.ok) {
        const data = await response.json();
        const settings = data.data.settings;

        // Update API keys
        this.sources.unsplash.apiKey = settings.UNSPLASH_ACCESS_KEY || '';
        this.sources.pexels.apiKey = settings.PEXELS_API_KEY || '';
        this.sources.pixabay.apiKey = settings.PIXABAY_API_KEY || '';
        this.sources.google.apiKey = settings.GOOGLE_API_KEY || '';
        this.sources.google.searchEngineId = settings.GOOGLE_SEARCH_ENGINE_ID || '';

        // Update enabled status
        this.sources.unsplash.enabled = !!this.sources.unsplash.apiKey;
        this.sources.pexels.enabled = !!this.sources.pexels.apiKey;
        this.sources.pixabay.enabled = !!this.sources.pixabay.apiKey;
        this.sources.google.enabled = !!(this.sources.google.apiKey && this.sources.google.searchEngineId);

        this.apiKeysLoaded = true;
      }
    } catch (error) {
      console.warn('Failed to load API keys from settings:', error);
      // Fallback to environment variables if available
      this.sources.unsplash.apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
      this.sources.pexels.apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';
      this.sources.pixabay.apiKey = import.meta.env.VITE_PIXABAY_API_KEY || '';
      this.sources.google.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
      this.sources.google.searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '';

      this.sources.unsplash.enabled = !!this.sources.unsplash.apiKey;
      this.sources.pexels.enabled = !!this.sources.pexels.apiKey;
      this.sources.pixabay.enabled = !!this.sources.pixabay.apiKey;
      this.sources.google.enabled = !!(this.sources.google.apiKey && this.sources.google.searchEngineId);

      this.apiKeysLoaded = true;
    }
  }

  /**
   * Search for images across all enabled sources
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of image results
   */
  async searchImages(query, options = {}) {
    // Load API keys first
    await this.loadApiKeys();

    const {
      perPage = 20,
      orientation = 'all',
      color = 'all',
      sources = Object.keys(this.sources).filter(key => this.sources[key].enabled)
    } = options;

    // Check if any sources are enabled
    if (sources.length === 0) {
      return {
        images: [],
        errors: [{
          source: 'All Sources',
          error: 'No API keys configured. Please configure API keys in admin settings.'
        }],
        total: 0,
        sources: []
      };
    }

    const searchPromises = sources.map(source => 
      this.searchFromSource(source, query, { perPage, orientation, color })
        .catch(error => {
          console.warn(`Failed to search ${source}:`, error);
          return [];
        })
    );

    const results = await Promise.all(searchPromises);
    const allImages = results.flat();
    
    // Remove duplicates based on URL
    const uniqueImages = this.removeDuplicates(allImages);
    
    // Shuffle results for variety
    return this.shuffleArray(uniqueImages).slice(0, perPage);
  }

  /**
   * Search images from a specific source
   */
  async searchFromSource(source, query, options) {
    switch (source) {
      case 'unsplash':
        return this.searchUnsplash(query, options);
      case 'pexels':
        return this.searchPexels(query, options);
      case 'pixabay':
        return this.searchPixabay(query, options);
      case 'google':
        return this.searchGoogle(query, options);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  /**
   * Search Unsplash images
   */
  async searchUnsplash(query, options) {
    const { perPage, orientation, color } = options;
    const config = this.sources.unsplash;
    
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      query,
      per_page: Math.min(perPage, 30),
      orientation: orientation === 'all' ? undefined : orientation,
      color: color === 'all' ? undefined : color
    });

    const response = await fetch(`${config.baseUrl}/search/photos?${params}`, {
      headers: {
        'Authorization': `Client-ID ${config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map(image => ({
      id: image.id,
      url: image.urls.regular,
      thumbnail: image.urls.thumb,
      fullSize: image.urls.full,
      alt: image.alt_description || image.description || query,
      source: 'unsplash',
      sourceName: 'Unsplash',
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
      downloadUrl: image.links.download,
      width: image.width,
      height: image.height,
      color: image.color,
      tags: image.tags?.map(tag => tag.title) || []
    }));
  }

  /**
   * Search Pexels images
   */
  async searchPexels(query, options) {
    const { perPage, orientation, color } = options;
    const config = this.sources.pexels;
    
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      query,
      per_page: Math.min(perPage, 80),
      orientation: orientation === 'all' ? undefined : orientation,
      color: color === 'all' ? undefined : color
    });

    const response = await fetch(`${config.baseUrl}/search?${params}`, {
      headers: {
        'Authorization': config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.photos.map(image => ({
      id: image.id,
      url: image.src.medium,
      thumbnail: image.src.small,
      fullSize: image.src.large2x,
      alt: image.alt || query,
      source: 'pexels',
      sourceName: 'Pexels',
      photographer: image.photographer,
      photographerUrl: image.photographer_url,
      downloadUrl: image.src.original,
      width: image.width,
      height: image.height,
      color: image.avg_color,
      tags: []
    }));
  }

  /**
   * Search Pixabay images
   */
  async searchPixabay(query, options) {
    const { perPage, orientation, color } = options;
    const config = this.sources.pixabay;
    
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      key: config.apiKey,
      q: query,
      per_page: Math.min(perPage, 200),
      image_type: 'photo',
      orientation: orientation === 'all' ? 'all' : orientation,
      colors: color === 'all' ? undefined : color,
      safesearch: 'true'
    });

    const response = await fetch(`${config.baseUrl}/?${params}`);

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.hits.map(image => ({
      id: image.id,
      url: image.webformatURL,
      thumbnail: image.previewURL,
      fullSize: image.largeImageURL,
      alt: image.tags || query,
      source: 'pixabay',
      sourceName: 'Pixabay',
      photographer: image.user,
      photographerUrl: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
      downloadUrl: image.largeImageURL,
      width: image.imageWidth,
      height: image.imageHeight,
      color: image.color,
      tags: image.tags.split(', ').map(tag => tag.trim())
    }));
  }

  /**
   * Search Google Custom Search images
   */
  async searchGoogle(query, options) {
    const { perPage } = options;
    const config = this.sources.google;
    
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      key: config.apiKey,
      cx: config.searchEngineId,
      q: query,
      searchType: 'image',
      num: Math.min(perPage, 10),
      safe: 'active',
      imgSize: 'medium',
      imgType: 'photo'
    });

    const response = await fetch(`${config.baseUrl}?${params}`);

    if (!response.ok) {
      throw new Error(`Google Custom Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.items || []).map(image => ({
      id: image.link,
      url: image.link,
      thumbnail: image.image?.thumbnailLink || image.link,
      fullSize: image.link,
      alt: image.title || query,
      source: 'google',
      sourceName: 'Google Images',
      photographer: image.displayLink,
      photographerUrl: image.image?.contextLink || image.link,
      downloadUrl: image.link,
      width: image.image?.width || 0,
      height: image.image?.height || 0,
      color: null,
      tags: []
    }));
  }

  /**
   * Remove duplicate images based on URL
   */
  removeDuplicates(images) {
    const seen = new Set();
    return images.filter(image => {
      if (seen.has(image.url)) {
        return false;
      }
      seen.add(image.url);
      return true;
    });
  }

  /**
   * Shuffle array for variety
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get available sources
   */
  getAvailableSources() {
    return Object.entries(this.sources)
      .filter(([, config]) => config.enabled)
      .map(([key, config]) => ({ key, name: config.name }));
  }

  /**
   * Get search suggestions based on product name and category
   */
  getSearchSuggestions(productName, category) {
    const baseSuggestions = [productName];
    
    if (category && typeof category === 'string') {
      baseSuggestions.push(`${productName} ${category.toLowerCase()}`);
      baseSuggestions.push(`${category.toLowerCase()} ${productName}`);
    }

    // Add common product image keywords
    const commonKeywords = [
      'product photo',
      'professional',
      'white background',
      'isolated',
      'high quality',
      'commercial'
    ];

    commonKeywords.forEach(keyword => {
      baseSuggestions.push(`${productName} ${keyword}`);
    });

    return [...new Set(baseSuggestions)]; // Remove duplicates
  }
}

export default new ImageSearchService();
