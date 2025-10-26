import { useState, useEffect, useRef } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { 
  Search, 
  X, 
  Download, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Filter,
  Grid,
  List,
  Heart,
  Check
} from 'lucide-react';
// Image search now handled by backend API at /api/images/search
import toast from 'react-hot-toast';

const ImageSearchModal = ({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  productName = '', 
  category = '',
  initialQuery = ''
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery || productName);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    collection: 'PRODUCTS', // Search within PRODUCTS collection by default
    provider: 'unsplash' // Backend supports 'unsplash' and 'pexels'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load favorites and recent searches from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('imageSearchFavorites');
    const savedRecent = localStorage.getItem('imageSearchRecent');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Generate search suggestions from product name and category
  useEffect(() => {
    const suggestions = [];
    if (productName) {
      suggestions.push(productName);
    }
    if (category) {
      suggestions.push(category);
      if (productName) {
        suggestions.push(`${productName} ${category}`);
        suggestions.push(`${category} ${productName}`);
      }
    }
    if (suggestions.length > 0) {
      setSuggestions(suggestions.slice(0, 5));
    }
  }, [productName, category]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle search using backend API
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedImage(null);

    try {
      const response = await fetch('/api/images/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          collection: filters.collection,
          provider: filters.provider,
          limit: 24
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const results = data.data?.downloaded || [];

      // Transform backend response to match expected image format
      const formattedResults = results.map(item => ({
        id: item.id,
        source: filters.provider,
        sourceName: filters.provider.toUpperCase(),
        url: item.responsiveData?.src || item.url,
        thumbnail: item.responsiveData?.picture?.img?.src || item.url,
        alt: item.alt || item.originalName,
        photographer: 'Ölföng Library',
        photographerUrl: null,
        width: item.width,
        height: item.height
      }));

      setImages(formattedResults);

      // Add to recent searches
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('imageSearchRecent', JSON.stringify(newRecent));

    } catch (err) {
      setError(err.message || 'Search failed');
      toast.error(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Handle image selection
  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  // Handle image selection - image is already in media library from search
  const handleDownloadAndSelect = async (image) => {
    try {
      // Image from backend search is already processed and in media library
      // Pass the responsive image data to parent
      onSelectImage(image, {
        originalUrl: image.url,
        source: image.source,
        photographer: image.photographer,
        photographerUrl: image.photographerUrl,
        responsiveData: image.responsiveData
      });

      toast.success('Image selected successfully');
      onClose();

    } catch (err) {
      toast.error(`Failed to select image: ${err.message}`);
    }
  };

  // Toggle favorite
  const toggleFavorite = (image) => {
    const isFavorited = favorites.some(fav => fav.id === image.id);
    let newFavorites;
    
    if (isFavorited) {
      newFavorites = favorites.filter(fav => fav.id !== image.id);
    } else {
      newFavorites = [...favorites, image];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('imageSearchFavorites', JSON.stringify(newFavorites));
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for Product Images
            </h2>
            <div className="relative" ref={suggestionsRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyPress={handleKeyPress}
                  placeholder={t('adminPlaceholders.searchForImages')}
                  className="input pl-10 pr-4 w-full"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                )}
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 mt-1">
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('imageSearchModal.suggestions')}</div>
                      {suggestions.slice(0, 5).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  {recentSearches.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('imageSearchModal.recentSearches')}</div>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
            </div>

            <select
              value={filters.provider}
              onChange={(e) => setFilters({...filters, provider: e.target.value})}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value="unsplash">Unsplash</option>
              <option value="pexels">Pexels</option>
            </select>

            <button
              onClick={() => handleSearch()}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Searching for images...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No images found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Try a different search term or adjust your filters</p>
              </div>
            </div>
          ) : (
            <div className="p-4 overflow-y-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={`${image.source}-${image.id}`}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage?.id === image.id && selectedImage?.source === image.source
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                        <img
                          src={image.thumbnail}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAndSelect(image);
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            title={t('adminLabels.selectImage')}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(image.url, '_blank');
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            title={t('adminLabels.viewOriginal')}
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(image);
                            }}
                            className={`p-2 rounded-full shadow-lg ${
                              favorites.some(fav => fav.id === image.id && fav.source === image.source)
                                ? 'bg-red-500 text-white'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                            title={t('adminLabels.addToFavorites')}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Source Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-75 text-white rounded">
                          {image.sourceName}
                        </span>
                      </div>
                      
                      {/* Photographer Credit */}
                      {image.photographer && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded truncate">
                            by {image.photographer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {images.map((image) => (
                    <div
                      key={`${image.source}-${image.id}`}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedImage?.id === image.id && selectedImage?.source === image.source
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.thumbnail}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {image.alt}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {image.sourceName}
                          </span>
                        </div>
                        {image.photographer && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {image.photographer}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {image.width} × {image.height}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAndSelect(image);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Select
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image.url, '_blank');
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedImage && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage.thumbnail}
                    alt={selectedImage.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedImage.alt}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImage.sourceName} • {selectedImage.width} × {selectedImage.height}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadAndSelect(selectedImage)}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Download & Select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSearchModal;
