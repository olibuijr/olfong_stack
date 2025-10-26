const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { successResponse, errorResponse } = require('../utils/response');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { generateMediaVariants } = require('../services/mediaService');

const prisma = new PrismaClient();
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';

// ATVR base URLs
const ATVR_BASE_URLS = {
  is: 'https://www.vinbudin.is',
  en: 'https://www.vinbudin.is/english'
};

// Food categories mapping
const FOOD_CATEGORIES = {
  'C': { is: 'Fiskur', en: 'Fish' },
  'D': { is: 'Alifuglar', en: 'Fowl' },
  'E': { is: 'Nautakjöt', en: 'Beef' },
  'F': { is: 'Lambakjöt', en: 'Lamb' },
  'G': { is: 'Svínakjöt', en: 'Pork' },
  'H': { is: 'Villibráð', en: 'Game' },
  'I': { is: 'Grænmetisréttir', en: 'Vegetables' },
  'J': { is: 'Grillmat', en: 'Barbeque food' },
  'M': { is: 'Pasta', en: 'Pasta' },
  'R': { is: 'Reykt kjöt', en: 'Smoked meat' },
  'S': { is: 'Pottréttir', en: 'Casserole' },
  '2': { is: 'Pylsur', en: 'Hot dogs' },
  '4': { is: 'Sushi', en: 'Sushi' },
  'B': { is: 'Skelfisk', en: 'Shellfish' },
  'Æ': { is: 'Hægt að panta', en: 'Can be reserved' }
};

// Product categories mapping
const PRODUCT_CATEGORIES = {
  'beer': { is: 'Bjór', en: 'Beer' },
  'red-wine': { is: 'Rauðvín', en: 'Red wine' },
  'white-wine': { is: 'Hvítvín', en: 'White wine' },
  'strong': { is: 'Sterkt áfengi', en: 'Spirits' },
  'cider': { is: 'Síder', en: 'Cider' },
  'liqueur': { is: 'Líkjör', en: 'Liqueur' },
  'rose-wine': { is: 'Rósavín', en: 'Rose wine' },
  'sparkling-wine': { is: 'Freyðivín', en: 'Sparkling wine' },
  'dessert-wine': { is: 'Eftirréttavín', en: 'Dessert wine' },
  'packaging': { is: 'Umbúðir', en: 'Packaging' }
};

/**
 * Normalize text by adding spaces after periods that are followed directly by letters
 * Fixes issues like ".TextMore" -> ". Text More"
 * Supports both ASCII and Unicode/Icelandic characters
 */
function normalizeTextSpacing(text) {
  if (!text || typeof text !== 'string') return text;
  // Add space after period if followed by a letter (including Unicode/Icelandic characters)
  // Using \p{L} for any Unicode letter requires Unicode flag
  return text.replace(/\.([A-Za-zÁáÉéÍíÓóÚúÝýÞþÐðÆæÖö])/g, '. $1');
}

// Helper function to generate file hash
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Helper function to ensure upload directories exist
const ensureDirectories = () => {
  const baseDir = path.join(__dirname, '../../uploads');
  const collectionDir = path.join(baseDir, 'products');
  const originalsDir = path.join(collectionDir, 'originals');
  const thumbnailsDir = path.join(collectionDir, 'thumbnails');
  const webpDir = path.join(collectionDir, 'webp');

  [collectionDir, originalsDir, thumbnailsDir, webpDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download and save ATVR product image
const downloadAndSaveImage = async (imageUrl, productName, atvrProductId, userId) => {
  try {
    console.log(`Downloading image from ${imageUrl}`);

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const imageBuffer = Buffer.from(response.data);
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    // Generate file hash for deduplication
    const fileHash = generateFileHash(imageBuffer);

    // Check for existing file with same hash
    const existingMedia = await prisma.media.findFirst({
      where: { hash: fileHash, collection: 'PRODUCTS' }
    });

    if (existingMedia) {
      console.log('Image already exists in media library, using existing media');
      return existingMedia;
    }

    // Generate unique filename
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${fileExtension}`;
    const collectionDir = 'products';

    // Create directory structure
    ensureDirectories();

    // Save original image
    const originalPath = path.join(__dirname, '../../uploads', collectionDir, 'originals', filename);
    fs.writeFileSync(originalPath, imageBuffer);

    // Get image dimensions
    let width = null;
    let height = null;
    try {
      const metadata = await sharp(originalPath).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch (error) {
      console.error('Error processing image metadata:', error);
      // Clean up the file if metadata extraction fails
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }
      throw new Error('Invalid image file or unsupported format');
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: `${productName}_${atvrProductId}.${fileExtension}`,
        mimeType,
        size: imageBuffer.length,
        width,
        height,
        alt: productName,
        caption: `${productName} - ATVR Product ${atvrProductId}`,
        description: `Product image imported from ATVR for ${productName}`,
        collection: 'PRODUCTS',
        hash: fileHash,
        url: `${MEDIA_BASE_URL}/uploads/${collectionDir}/originals/${filename}`,
        path: `${collectionDir}/originals/${filename}`,
        uploadedBy: userId
      }
    });

    console.log(`Successfully saved image to media library: ${media.id}`);

    // Process different formats and sizes asynchronously (don't wait for it)
    generateMediaVariants(media, originalPath, 'PRODUCTS')
      .then(async (results) => {
        const formats = [];
        const sizes = [];

        for (const result of results) {
          if (result.success) {
            if (result.type === 'format') {
              formats.push({
                mediaId: media.id,
                format: result.name,
                url: result.url,
                size: result.size
              });
            } else if (result.type === 'size') {
              sizes.push({
                mediaId: media.id,
                size: result.name,
                url: result.url,
                width: result.width,
                height: result.height
              });
            }
          }
        }

        if (formats.length > 0) {
          await prisma.mediaFormat.createMany({ data: formats });
        }
        if (sizes.length > 0) {
          await prisma.mediaSize.createMany({ data: sizes });
        }

        console.log(`Generated ${formats.length} formats and ${sizes.length} sizes for media ${media.id}`);
      })
      .catch(err => {
        console.error('Error generating media variants:', err);
      });

    return media;
  } catch (error) {
    console.error('Error downloading and saving image:', error.message);
    return null; // Return null if image download fails (non-critical error)
  }
};

// Parse product data from ATVR search results with enhanced information extraction
const parseProductFromSearchResult = async ($, productElement, language = 'is') => {
  try {
    const product = {};

    // Product name and ID - look for the text link (not the image link)
    // The first link is usually the image, the second is the product name
    const productLinks = productElement.find('a[href*="productID"]');
    if (!productLinks.length) {
      return null; // Skip if no product link found
    }

    // Find the link that has actual text (not just an image)
    let nameLink = null;
    for (let i = 0; i < productLinks.length; i++) {
      const link = productLinks.eq(i);
      const linkText = link.text().trim();
      // Skip links that only contain images or have no text
      if (linkText && linkText.length > 0 && !linkText.match(/^\(\d+\)$/)) {
        nameLink = link;
        break;
      }
    }

    if (!nameLink) {
      return null; // Skip if no text link found
    }

    const productName = nameLink.text().trim();
    product.name = productName;
    product.nameIs = productName; // For now, use same name for both languages
    product.id = nameLink.attr('href').match(/productID=(\d+)/)?.[1];
    product.atvrProductId = product.id;
    product.atvrUrl = `${ATVR_BASE_URLS[language]}${nameLink.attr('href')}`;

    // Product image - enhanced extraction
    const img = productElement.find('img').first();
    if (img.length) {
      let imageSrc = img.attr('src');
      if (imageSrc) {
        if (!imageSrc.startsWith('http')) {
          imageSrc = ATVR_BASE_URLS[language] + imageSrc;
        }
        product.image = imageSrc;
        product.atvrImageUrl = imageSrc;
      }
    }

    // Category - enhanced detection with more categories
    let categoryText = '';
    const allText = productElement.text();
    
    // Enhanced category detection
    const categoryPatterns = {
      'Rauðvín': ['Rauðvín', 'Red wine'],
      'Hvítvín': ['Hvítvín', 'White wine'],
      'Rósavín': ['Rósavín', 'Rosé wine', 'Rose wine'],
      'Freyðivín': ['Freyðivín', 'Sparkling wine'],
      'Bjór': ['Bjór', 'Beer'],
      'Sterkt áfengi': ['Sterkt áfengi', 'Spirits'],
      'Líkjör': ['Líkjör', 'Liqueur'],
      'Síder': ['Síder', 'Cider'],
      'Eftirréttavín': ['Eftirréttavín', 'Dessert wine'],
      'Umbúðir': ['Umbúðir', 'Packaging']
    };
    
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => allText.includes(pattern))) {
        categoryText = category;
        break;
      }
    }
    
    product.category = categoryText || 'Unknown';

    // Subcategories - enhanced extraction
    const subcategories = [];
    productElement.find('a[href*="style="]').each((i, el) => {
      const subcategoryText = $(el).text().trim();
      if (subcategoryText && subcategoryText !== categoryText && subcategoryText.length > 1) {
        subcategories.push(subcategoryText);
      }
    });
    product.subcategories = subcategories;

    // Price - enhanced extraction with better patterns
    let priceText = '';
    const pricePatterns = [
      /(\d+(?:\.\d+)?)\s*kr\.?/g,
      /(\d+(?:,\d+)?)\s*kr\.?/g,
      /(\d+)\s*kr/g
    ];
    
    for (const pattern of pricePatterns) {
      const match = allText.match(pattern);
      if (match) {
        priceText = match[0];
        break;
      }
    }
    
    if (priceText) {
      // Extract numeric value
      const priceMatch = priceText.match(/(\d+(?:\.\d+)?)/);
      if (priceMatch) {
        product.price = parseFloat(priceMatch[1]);
      }
    }

    // Volume and alcohol content - enhanced extraction
    const volumePatterns = [
      /(\d+(?:\.\d+)?)\s*ml\s*(\d+(?:\.\d+)?%)/,
      /(\d+(?:\.\d+)?)\s*ml\s*(\d+(?:\.\d+)?)\s*%/,
      /(\d+(?:\.\d+)?)\s*ml/
    ];

    for (const pattern of volumePatterns) {
      const match = allText.match(pattern);
      if (match) {
        product.volume = match[1] + ' ml';
        if (match[2]) {
          product.alcoholContent = match[2].replace('%', '');
        }
        break;
      }
    }

    // If alcohol content still not found, search for standalone percentage pattern
    if (!product.alcoholContent) {
      const alcoholPatterns = [
        /(?:Alcohol|Styrkleiki|Alkóhólprósenta|vol\.?\s*(?:alcohol|alkóhólinnihald)?)\s*(?:Content)?[\s:]+(\d+(?:\.\d+)?)\s*%/i,
        /(\d+(?:\.\d+)?)\s*%\s*(?:vol\.?|alcohol|alkóhólinnihald)/i,
        /(\d+(?:\.\d+)?)\s*%\s*vol/i,
        /(?:vol|alcohol|alkóhólinnihald)[\s:]+(\d+(?:\.\d+)?)\s*%/i
      ];

      for (const pattern of alcoholPatterns) {
        const match = allText.match(pattern);
        if (match && match[1]) {
          const percentage = match[1];
          // Only accept if it's a reasonable alcohol percentage (0-100)
          if (parseFloat(percentage) >= 0 && parseFloat(percentage) <= 100) {
            product.alcoholContent = percentage;
            break;
          }
        }
      }
    }

    // Enhanced food pairings extraction - use actual food names, not codes
    product.foodPairings = [];
    product.foodPairingsIs = [];
    productElement.find('a[href*="foodcategory"]').each((i, el) => {
      const href = $(el).attr('href');
      const code = href.match(/foodcategory([A-Z0-9]+)/)?.[1];
      if (code && FOOD_CATEGORIES[code]) {
        product.foodPairings.push(FOOD_CATEGORIES[code].en); // Use English name
        product.foodPairingsIs.push(FOOD_CATEGORIES[code].is); // Use Icelandic name
      }
    });

    // Enhanced special attributes detection
    product.specialAttributes = [];
    product.specialAttributesIs = [];
    
    // Look for special attribute indicators
    const specialAttributeIndicators = [
      'Lífrænt', 'Organic', 'Vegan', 'Glútenlaust', 'Gluten-free',
      'Kosher', 'Náttúruvín', 'Natural wine', 'Sjálfbært', 'Sustainable',
      'Án viðbætts súlfíts', 'No added sulfites', 'Bíódínamík', 'Biodynamic',
      'Sanngjarnt', 'Fair trade', 'Léttgler', 'Light glass'
    ];
    
    specialAttributeIndicators.forEach(indicator => {
      if (allText.includes(indicator)) {
        product.specialAttributes.push(indicator);
        product.specialAttributesIs.push(indicator);
      }
    });

    // Enhanced availability detection
    if (allText.includes('Sérpöntun') || allText.includes('Special order')) {
      product.availability = 'special-order';
      product.availabilityIs = 'Sérpöntun';
    } else if (allText.includes('Væntanlegt') || allText.includes('Coming soon')) {
      product.availability = 'coming-soon';
      product.availabilityIs = 'Væntanlegt';
    } else if (allText.includes('Vara hættir') || allText.includes('Discontinued')) {
      product.availability = 'discontinued';
      product.availabilityIs = 'Vara hættir';
    } else {
      product.availability = 'available';
      product.availabilityIs = 'Til ráðstöfunar';
    }

    // Set reasonable default values if extraction didn't find them
    if (!product.country && !product.countryIs) {
      product.country = 'Iceland';
      product.countryIs = 'Ísland';
    }

    if (!product.description && !product.descriptionIs) {
      const baseDescription = `A quality ${product.category?.toLowerCase() || 'beverage'} from ${product.country || 'Iceland'}.`;
      product.description = normalizeTextSpacing(baseDescription);
      product.descriptionIs = normalizeTextSpacing(`Gæðavara ${product.category?.toLowerCase() || 'drykkur'} frá ${product.countryIs || 'Íslandi'}.`);
    }

    return product;
  } catch (error) {
    console.error('Error parsing product:', error);
    return null;
  }
};

// Get detailed product information for both languages
const getProductDetails = async (productId, language = 'is') => {
  try {
    const product = {};
    
    // Get data from both language versions
    const [icelandicData, englishData] = await Promise.all([
      getProductDetailsForLanguage(productId, 'is'),
      getProductDetailsForLanguage(productId, 'en')
    ]);

    // Merge data with preference for the requested language
    // Start with icelandic data as base
    Object.assign(product, icelandicData);

    // Fill in English-specific fields from English data, with fallback to Icelandic if empty
    if (englishData.producer && !product.producer) {
      product.producer = englishData.producer;
    } else if (icelandicData.producerIs && !product.producer) {
      // Use Icelandic producer if English is empty
      product.producer = icelandicData.producerIs;
    }

    if (englishData.distributor && !product.distributor) {
      product.distributor = englishData.distributor;
    } else if (icelandicData.distributorIs && !product.distributor) {
      // Use Icelandic distributor if English is empty
      product.distributor = icelandicData.distributorIs;
    }

    if (englishData.packaging && !product.packaging) {
      product.packaging = englishData.packaging;
    } else if (icelandicData.packagingIs && !product.packaging) {
      // Use Icelandic packaging if English is empty
      product.packaging = icelandicData.packagingIs;
    }

    if (englishData.packagingWeight && !product.packagingWeight) {
      product.packagingWeight = englishData.packagingWeight;
    } else if (icelandicData.packagingWeightIs && !product.packagingWeight) {
      // Use Icelandic packaging weight if English is empty
      product.packagingWeight = icelandicData.packagingWeightIs;
    }

    if (englishData.country && !product.country) {
      product.country = englishData.country;
    } else if (icelandicData.countryIs && !product.country) {
      // Use Icelandic country if English is empty
      product.country = icelandicData.countryIs;
    }

    // Set language-specific fields
    if (language === 'is') {
      product.name = icelandicData.name;
      product.nameIs = icelandicData.name;
      product.description = normalizeTextSpacing(englishData.description || icelandicData.description);
      product.descriptionIs = normalizeTextSpacing(icelandicData.description);
    } else {
      product.name = englishData.name;
      product.nameIs = icelandicData.name;
      product.description = normalizeTextSpacing(englishData.description);
      product.descriptionIs = normalizeTextSpacing(icelandicData.description);
    }

    return product;
  } catch (error) {
    console.error('Error getting product details:', error);
    return null;
  }
};

// Get product details for a specific language with comprehensive data extraction
const getProductDetailsForLanguage = async (productId, lang) => {
  try {
    // Use the new /heim format for Icelandic and /english/home format for English
    let url;
    if (lang === 'is') {
      url = `https://www.vinbudin.is/heim/vorur/stoek-vara.aspx/?productid=${productId}/`;
    } else {
      url = `https://www.vinbudin.is/english/home/products/stoek-vara.aspx/?productid=${productId}/`;
    }
    
    // Try axios first, fallback to Playwright if needed
    let $;
    let response;
    
    try {
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': lang === 'is' ? 'is-IS,is;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000
      });
      $ = cheerio.load(response.data);
    } catch (axiosError) {
      console.log(`Axios failed for product ${productId}, trying Playwright...`);
      
      // Fallback to Playwright
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      
      const html = await page.content();
      $ = cheerio.load(html);
      
      await browser.close();
    }

    const product = {};

    // Enhanced product name extraction
    const nameSelectors = ['h1', 'h2', 'h3', '.product-title', '.product-name'];
    for (const selector of nameSelectors) {
      const nameElement = $(selector).first();
      if (nameElement.length && nameElement.text().trim()) {
        product.name = nameElement.text().trim().replace(/\s*\(\d+\)$/, '');
        break;
      }
    }

    // Enhanced description extraction - Target ATVR-specific description structure
    // ATVR uses: <div class="synishorn"> for short view, <div class="entire-text"> for full description
    let foundDescription = null;

    // Strategy 1: Try ATVR-specific selectors first (most reliable)
    const entireTextDiv = $('.entire-text');
    if (entireTextDiv.length > 0) {
      let descText = entireTextDiv.text().trim();
      // Remove "Sjá meira" / "See more" and "Sjá minna" / "Read less" links
      descText = descText.replace(/[\s\n]*(Sjá meira|See more|Sjá minna|Read less)[\s\n]*/gi, ' ').trim();
      // Remove extra whitespace
      descText = descText.replace(/\s+/g, ' ').trim();

      if (descText.length > 50) {
        foundDescription = descText;
      }
    }

    // Strategy 2: If entire-text not found, try synishorn (short description)
    if (!foundDescription) {
      const synishornDiv = $('.synishorn');
      if (synishornDiv.length > 0) {
        let descText = synishornDiv.text().trim();
        descText = descText.replace(/[\s\n]*(Sjá meira|See more|Sjá minna|Read less)[\s\n]*/gi, ' ').trim();
        descText = descText.replace(/\s+/g, ' ').trim();

        if (descText.length > 50) {
          foundDescription = descText;
        }
      }
    }

    // Strategy 3: Fallback - look for text that contains flavor/tasting notes or Icelandic beer style descriptions
    if (!foundDescription) {
      const flavorKeywords = ['color|taste|flavor|note|aroma|body|palate|finish|sweet|dry|crisp|fresh|smooth|fruity|citrus|berry|spice|wood|vanilla|oak|mineral|bjór|lager|ale|helles|pilsner|porter|stout|áfengis|smekk|beiskja|malt|humlar'];
      const allText = $.text();

      // Search for paragraphs with flavor keywords
      const allElements = $('p');
      let longDescription = null;

      for (let i = 0; i < allElements.length; i++) {
        const element = allElements.eq(i);
        let text = element.text().trim();

        // Skip empty or very short text
        if (!text || text.length < 50) continue;

        // Skip if it's contact info or navigation
        if (text.match(/@|vinbudin|navigation|instagram|facebook|twitter|email|contact/i)) continue;

        // Check if it contains flavor-related keywords
        if (text.match(new RegExp(flavorKeywords, 'i')) && !text.match(/^(Standard|VAT|Price|Stock|In|Ekki|Out)/i)) {
          // Clean up: remove "Sjá meira" or "See more" and everything after
          text = text.replace(/[\s\n]*(Sjá meira|See more|Sjá minna|Read less)[\s\n]*/gi, ' ').trim();
          // Additional cleaning: remove extra whitespace
          text = text.replace(/\s+/g, ' ').trim();

          // Prefer longer descriptions
          if (text.length > 300 && text.length < 2000) {
            longDescription = text;
            break;
          }

          // Otherwise store as fallback
          if (text.length > 50 && !foundDescription) {
            foundDescription = text;
          }
        }
      }

      // Use long description if found
      if (longDescription) {
        foundDescription = longDescription;
      }
    }

    if (foundDescription) {
      product.description = normalizeTextSpacing(foundDescription);
    }

    // Enhanced price extraction
    const pricePatterns = [
      /(\d+(?:\.\d+)?)\s*kr\.?/g,
      /(\d+(?:,\d+)?)\s*kr\.?/g,
      /(\d+)\s*kr/g
    ];
    
    const allText = $.text();
    for (const pattern of pricePatterns) {
      const match = allText.match(pattern);
      if (match) {
        const priceMatch = match[0].match(/(\d+(?:\.\d+)?)/);
        if (priceMatch) {
          product.price = parseFloat(priceMatch[1]);
        }
        break;
      }
    }

    // Enhanced category extraction
    const categorySelectors = [
      'a[href*="category="]',
      '.category',
      '.product-category',
      'span:contains("Bjór"), span:contains("Rauðvín"), span:contains("Hvítvín")'
    ];
    
    for (const selector of categorySelectors) {
      const categoryElement = $(selector).first();
      if (categoryElement.length) {
        product.category = categoryElement.text().trim();
        break;
      }
    }

    // Enhanced volume and alcohol content extraction
    // First try using ATVR-specific element IDs
    const volumeElement = $('#ctl00_ctl01_Label_ProductBottledVolume, #Label_ProductBottledVolume');
    if (volumeElement.length) {
      const volumeText = volumeElement.text().trim();
      const volumeMatch = volumeText.match(/(\d+(?:\.\d+)?)\s*(?:ml|L)/i);
      if (volumeMatch) {
        const volumeValue = volumeMatch[0].trim();
        product.volume = volumeValue;
        // Set volumeIs to same value (volume is language-neutral)
        product.volumeIs = volumeValue;
      }
    }

    // Fallback to regex pattern if specific selector didn't work
    if (!product.volume) {
      const volumePatterns = [
        /(\d+(?:\.\d+)?)\s*ml\s*(\d+(?:\.\d+)?%)/,
        /(\d+(?:\.\d+)?)\s*ml\s*(\d+(?:\.\d+)?)\s*%/,
        /(\d+(?:\.\d+)?)\s*ml/
      ];

      for (const pattern of volumePatterns) {
        const match = allText.match(pattern);
        if (match) {
          const volumeValue = match[1] + ' ml';
          product.volume = volumeValue;
          product.volumeIs = volumeValue;
          if (match[2]) {
            product.alcoholContent = match[2].replace('%', '');
          }
          break;
        }
      }
    }

    // If alcohol content still not found, search for standalone percentage pattern
    if (!product.alcoholContent) {
      const alcoholPatterns = [
        /(?:Alcohol|Styrkleiki|Alkóhólprósenta|vol\.?\s*(?:alcohol|alkóhólinnihald)?)\s*(?:Content)?[\s:]+(\d+(?:\.\d+)?)\s*%/i,
        /(\d+(?:\.\d+)?)\s*%\s*(?:vol\.?|alcohol|alkóhólinnihald)/i,
        /(\d+(?:\.\d+)?)\s*%\s*vol/i,
        /(?:vol|alcohol|alkóhólinnihald)[\s:]+(\d+(?:\.\d+)?)\s*%/i
      ];

      for (const pattern of alcoholPatterns) {
        const match = allText.match(pattern);
        if (match && match[1]) {
          const percentage = match[1];
          // Only accept if it's a reasonable alcohol percentage (0-100)
          if (parseFloat(percentage) >= 0 && parseFloat(percentage) <= 100) {
            product.alcoholContent = percentage;
            break;
          }
        }
      }
    }

    // Helper function to extract label-value pairs from HTML structure
    // Looks for elements containing label and extracts the next sibling's value
    // Handles cases where labels and values are in adjacent or nested elements
    const extractLabelValuePair = (labelText) => {
      let value = null;

      // Try to find the element containing the label
      // Search in two passes: first for exact labels within product details area,
      // then broader if needed
      const allElements = $('*');
      let bestMatch = null;
      let bestIndex = -1;

      for (let i = 0; i < allElements.length; i++) {
        const el = allElements.eq(i);
        const text = el.text().trim();

        // Check if this element contains exactly the label (or label + whitespace)
        if (text.match(new RegExp(`^${labelText}\\s*$`, 'i')) || text === labelText.trim()) {
          // Skip menu items and header navigation - they typically appear before main content
          // by checking if element is in expected product detail area or not in navigation
          const elParents = el.parents('[class*="product"], [class*="detail"], [id*="product"], [class*="info"]');
          const inNav = el.parents('[class*="nav"], [class*="menu"], [role="navigation"]').length > 0;

          // Prefer elements that are in a product/detail container and not in navigation
          if (elParents.length > 0 && !inNav) {
            bestMatch = el;
            bestIndex = i;
            break; // Found it in the right context
          } else if (bestMatch === null && !inNav) {
            // Remember first occurrence that's not in nav
            bestMatch = el;
            bestIndex = i;
          }
        }
      }

      if (bestMatch) {
        const el = bestMatch;
        // Get the next sibling element
        const nextEl = el.next();
        if (nextEl.length) {
          const nextText = nextEl.text().trim();
          // Make sure it's not another label
          if (!nextText.match(/^(Producer|Framleiðandi|Supplier|Heildsali|Country|Land|Packaging|Umbúðir|Weight|Þyngd|Carbon|Kolefnis|Region|Svæði|Origin|Uppruni|Alcohol|Styrkleiki|Unit|Eining|Vintage|Árétun)\s*$/i)) {
            value = nextText;
          }
        }

        // Also try parent's next sibling if direct sibling didn't work
        if (!value) {
          const parentNext = el.parent().next();
          if (parentNext.length) {
            const parentNextText = parentNext.text().trim();
            if (parentNextText && !parentNextText.match(/^(Producer|Framleiðandi|Supplier|Heildsali|Country|Land|Packaging|Umbúðir|Weight|Þyngd|Carbon|Kolefnis|Region|Svæði|Origin|Uppruni|Alcohol|Styrkleiki|Unit|Eining|Vintage|Árétun)\s*$/i)) {
              value = parentNextText;
            }
          }
        }
      }

      return value;
    };

    // Extract structured product details using label-value pairs
    // Producer/Framleiðandi
    let producerValue = extractLabelValuePair('Producer') ||
                        extractLabelValuePair('Framleiðandi') ||
                        extractLabelValuePair('Framleitt af');
    if (producerValue) {
      if (lang === 'is') {
        product.producerIs = producerValue.trim();
      } else {
        product.producer = producerValue.trim();
      }
    }

    // Alcohol Content / Styrkleiki - Extract from label-value pairs first
    let alcoholFromLabel = extractLabelValuePair('Alcohol') ||
                          extractLabelValuePair('Styrkleiki') ||
                          extractLabelValuePair('STYRKLEIKI') ||
                          extractLabelValuePair('Alcohol Content') ||
                          extractLabelValuePair('Alcohol Vol') ||
                          extractLabelValuePair('Vol');
    if (alcoholFromLabel) {
      // Extract numeric value with % from the label result
      // Match pattern like "6,5% vol" or "6.5% vol" or just "6,5%"
      const alcoholMatch = alcoholFromLabel.match(/(\d+[.,]\d+|\d+)\s*%/);
      if (alcoholMatch) {
        // Replace comma with period for consistency
        product.alcoholContent = alcoholMatch[1].replace(',', '.');
      }
    }

    // Supplier/Heildsali/Distributor
    let supplierValue = extractLabelValuePair('Supplier') ||
                        extractLabelValuePair('Heildsali') ||
                        extractLabelValuePair('Distributor') ||
                        extractLabelValuePair('Dreifaraðili');
    if (supplierValue) {
      if (lang === 'is') {
        product.distributorIs = supplierValue.trim();
      } else {
        product.distributor = supplierValue.trim();
      }
    }

    // Country
    let countryValue = extractLabelValuePair('Country') ||
                       extractLabelValuePair('Land');
    if (countryValue) {
      if (lang === 'is') {
        product.countryIs = countryValue.trim();
      } else {
        product.country = countryValue.trim();
      }
    }

    // Packaging/Umbúðir - first try specific ATVR element ID
    let packagingValue = null;
    const packagingElement = $('#ctl00_ctl01_Label_ProductPackaging, #Label_ProductPackaging');
    if (packagingElement.length) {
      packagingValue = packagingElement.text().trim();
    }

    // Fallback to label-value pair extraction if specific selector didn't work
    if (!packagingValue) {
      packagingValue = extractLabelValuePair('Packaging') ||
                       extractLabelValuePair('Umbúðir');
    }

    if (packagingValue) {
      if (lang === 'is') {
        product.packagingIs = packagingValue.trim();
      } else {
        product.packaging = packagingValue.trim();
      }
    }

    // Weight of packaging / Þyngd umbúða
    let weightValue = extractLabelValuePair('Weight of packaging') ||
                      extractLabelValuePair('Þyngd umbúða');
    if (weightValue) {
      if (lang === 'is') {
        product.packagingWeightIs = weightValue.trim();
      } else {
        product.packagingWeight = weightValue.trim();
      }
    }

    // Carbon footprint / Kolefnisarfar
    let carbonValue = extractLabelValuePair('Carbon footprint') ||
                      extractLabelValuePair('Est carbon footpr') ||
                      extractLabelValuePair('Kolefnisarfar');
    if (carbonValue) {
      if (lang === 'is') {
        product.carbonFootprintIs = carbonValue.trim();
      } else {
        product.carbonFootprint = carbonValue.trim();
      }
    }

    // Region/Area extraction - fallback to regex if DOM extraction fails
    let regionValue = extractLabelValuePair('Region') ||
                      extractLabelValuePair('Svæði');
    if (regionValue) {
      if (lang === 'is') {
        product.regionIs = regionValue.trim();
      } else {
        product.region = regionValue.trim();
      }
    }

    // Origin/Appellation extraction - fallback to regex if DOM extraction fails
    let originValue = extractLabelValuePair('Origin') ||
                      extractLabelValuePair('Uppruni') ||
                      extractLabelValuePair('Appellation');
    if (originValue) {
      if (lang === 'is') {
        product.originIs = originValue.trim();
      } else {
        product.origin = originValue.trim();
      }
    }

    // Vintage extraction (for wines)
    let vintageValue = extractLabelValuePair('Vintage') ||
                       extractLabelValuePair('Árétun');
    if (vintageValue && vintageValue.match(/\d{4}/)) {
      product.vintage = vintageValue.match(/\d{4}/)[0];
    }

    // Grape variety extraction
    let grapeValue = extractLabelValuePair('Grape variety') ||
                     extractLabelValuePair('Þrúguafbrigði');
    if (grapeValue) {
      if (lang === 'is') {
        product.grapeVarietyIs = grapeValue.trim();
      } else {
        product.grapeVariety = grapeValue.trim();
      }
    }

    // Wine style extraction
    let wineStyleValue = extractLabelValuePair('Wine style') ||
                         extractLabelValuePair('Vínstíll');
    if (wineStyleValue) {
      if (lang === 'is') {
        product.wineStyleIs = wineStyleValue.trim();
      } else {
        product.wineStyle = wineStyleValue.trim();
      }
    }

    // Price per liter extraction
    let pricePerLiterValue = extractLabelValuePair('Price per liter') ||
                             extractLabelValuePair('Verð á lítri');
    if (pricePerLiterValue) {
      if (lang === 'is') {
        product.pricePerLiterIs = pricePerLiterValue.trim();
      } else {
        product.pricePerLiter = pricePerLiterValue.trim();
      }
    }

    // Enhanced food pairings extraction - use actual food names, not codes
    product.foodPairings = [];
    product.foodPairingsIs = [];
    $('a[href*="foodcategory"]').each((i, el) => {
      const href = $(el).attr('href');
      const code = href.match(/foodcategory([A-Z0-9]+)/)?.[1];
      if (code && FOOD_CATEGORIES[code]) {
        product.foodPairings.push(FOOD_CATEGORIES[code].en); // Use English name
        product.foodPairingsIs.push(FOOD_CATEGORIES[code].is); // Use Icelandic name
      }
    });

    // Enhanced special attributes extraction
    product.specialAttributes = [];
    product.specialAttributesIs = [];
    
    const specialAttributeIndicators = [
      'Lífrænt', 'Organic', 'Vegan', 'Glútenlaust', 'Gluten-free',
      'Kosher', 'Náttúruvín', 'Natural wine', 'Sjálfbært', 'Sustainable',
      'Án viðbætts súlfíts', 'No added sulfites', 'Bíódínamík', 'Biodynamic',
      'Sanngjarnt', 'Fair trade', 'Léttgler', 'Light glass'
    ];
    
    specialAttributeIndicators.forEach(indicator => {
      if (allText.includes(indicator)) {
        product.specialAttributes.push(indicator);
        product.specialAttributesIs.push(indicator);
      }
    });

    // Enhanced image URL extraction
    const imgSelectors = ['img.product-image', 'img[src*="product"]', 'img:first'];
    for (const selector of imgSelectors) {
      const img = $(selector).first();
      if (img.length) {
        const src = img.attr('src');
        if (src) {
          product.atvrImageUrl = src.startsWith('http') ? src : `${ATVR_BASE_URLS[lang]}${src}`;
          break;
        }
      }
    }
    
    // Fallback: construct image URL from product ID if no image found
    if (!product.atvrImageUrl && productId) {
      product.atvrImageUrl = `${ATVR_BASE_URLS[lang]}/images/products/${productId}.jpg`;
    }

    // ATVR URLs
    product.atvrProductId = productId;
    product.atvrUrl = url;

    return product;
  } catch (error) {
    console.error('Error getting product details:', error);
    return null;
  }
};

// Search ATVR products in both languages
const searchProducts = async (req, res) => {
  let browser = null;
  try {
    const { searchTerm } = req.body;

    if (!searchTerm) {
      return errorResponse(res, 'Search term is required', 400);
    }

    // Search both Icelandic and English ATVR pages
    const [icelandicResults, englishResults] = await Promise.all([
      searchATVRInLanguage(searchTerm, 'is'),
      searchATVRInLanguage(searchTerm, 'en')
    ]);

    // Combine results and merge language data
    const allProducts = [...icelandicResults, ...englishResults];
    const productMap = new Map();
    
    // Merge products by ID, combining language data
    allProducts.forEach(product => {
      if (product.id) {
        if (productMap.has(product.id)) {
          const existing = productMap.get(product.id);
          // Merge language-specific fields
          if (product.name && !existing.name) existing.name = product.name;
          if (product.nameIs && !existing.nameIs) existing.nameIs = product.nameIs;
          if (product.description && !existing.description) existing.description = product.description;
          if (product.descriptionIs && !existing.descriptionIs) existing.descriptionIs = product.descriptionIs;
          if (product.volume && !existing.volume) existing.volume = product.volume;
          if (product.volumeIs && !existing.volumeIs) existing.volumeIs = product.volumeIs;
          if (product.country && !existing.country) existing.country = product.country;
          if (product.countryIs && !existing.countryIs) existing.countryIs = product.countryIs;
          if (product.region && !existing.region) existing.region = product.region;
          if (product.regionIs && !existing.regionIs) existing.regionIs = product.regionIs;
          if (product.origin && !existing.origin) existing.origin = product.origin;
          if (product.originIs && !existing.originIs) existing.originIs = product.originIs;
          if (product.producer && !existing.producer) existing.producer = product.producer;
          if (product.producerIs && !existing.producerIs) existing.producerIs = product.producerIs;
          if (product.distributor && !existing.distributor) existing.distributor = product.distributor;
          if (product.distributorIs && !existing.distributorIs) existing.distributorIs = product.distributorIs;
          if (product.packaging && !existing.packaging) existing.packaging = product.packaging;
          if (product.packagingIs && !existing.packagingIs) existing.packagingIs = product.packagingIs;
          if (product.packagingWeight && !existing.packagingWeight) existing.packagingWeight = product.packagingWeight;
          if (product.packagingWeightIs && !existing.packagingWeightIs) existing.packagingWeightIs = product.packagingWeightIs;
          if (product.alcoholContent && !existing.alcoholContent) existing.alcoholContent = product.alcoholContent;
          if (product.carbonFootprint && !existing.carbonFootprint) existing.carbonFootprint = product.carbonFootprint;
          if (product.carbonFootprintIs && !existing.carbonFootprintIs) existing.carbonFootprintIs = product.carbonFootprintIs;
          if (product.vintage && !existing.vintage) existing.vintage = product.vintage;
          if (product.grapeVariety && !existing.grapeVariety) existing.grapeVariety = product.grapeVariety;
          if (product.grapeVarietyIs && !existing.grapeVarietyIs) existing.grapeVarietyIs = product.grapeVarietyIs;
          if (product.wineStyle && !existing.wineStyle) existing.wineStyle = product.wineStyle;
          if (product.wineStyleIs && !existing.wineStyleIs) existing.wineStyleIs = product.wineStyleIs;
          if (product.pricePerLiter && !existing.pricePerLiter) existing.pricePerLiter = product.pricePerLiter;
          if (product.pricePerLiterIs && !existing.pricePerLiterIs) existing.pricePerLiterIs = product.pricePerLiterIs;
          if (product.availability && !existing.availability) existing.availability = product.availability;
          if (product.availabilityIs && !existing.availabilityIs) existing.availabilityIs = product.availabilityIs;
          // Merge arrays
          if (product.foodPairings && product.foodPairings.length > 0) {
            existing.foodPairings = [...new Set([...existing.foodPairings, ...product.foodPairings])];
          }
          if (product.foodPairingsIs && product.foodPairingsIs.length > 0) {
            existing.foodPairingsIs = [...new Set([...existing.foodPairingsIs, ...product.foodPairingsIs])];
          }
          if (product.specialAttributes && product.specialAttributes.length > 0) {
            existing.specialAttributes = [...new Set([...existing.specialAttributes, ...product.specialAttributes])];
          }
          if (product.specialAttributesIs && product.specialAttributesIs.length > 0) {
            existing.specialAttributesIs = [...new Set([...existing.specialAttributesIs, ...product.specialAttributesIs])];
          }
          if (product.certifications && product.certifications.length > 0) {
            existing.certifications = [...new Set([...existing.certifications, ...product.certifications])];
          }
          if (product.certificationsIs && product.certificationsIs.length > 0) {
            existing.certificationsIs = [...new Set([...existing.certificationsIs, ...product.certificationsIs])];
          }
        } else {
          productMap.set(product.id, { ...product });
        }
      }
    });
    
    const uniqueProducts = Array.from(productMap.values()).map(product => {
      // Ensure both name and nameIs are present
      if (!product.name && product.nameIs) {
        product.name = product.nameIs;
      }
      if (!product.nameIs && product.name) {
        product.nameIs = product.name;
      }
      // Ensure both description and descriptionIs are present
      if (!product.description && product.descriptionIs) {
        product.description = product.descriptionIs;
      }
      if (!product.descriptionIs && product.description) {
        product.descriptionIs = product.description;
      }
      return product;
    });

    console.log(`Found ${uniqueProducts.length} unique products from both languages`);

    return successResponse(res, {
      products: uniqueProducts,
      total: uniqueProducts.length,
      searchTerm,
      language: 'both'
    }, 'Products retrieved successfully from both languages');

  } catch (error) {
    console.error('Error searching ATVR products:', error);
    
    // If it's a timeout error, provide a more specific message
    if (error.name === 'TimeoutError') {
      return errorResponse(res, 'ATVR website is taking too long to respond. Please try again later.', 408);
    }
    
    return errorResponse(res, 'Failed to search ATVR products', 500);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
};

// Helper function to search ATVR in a specific language
const searchATVRInLanguage = async (searchTerm, language) => {
  let browser = null;
  try {
    // Construct search URL - use the correct vorur.aspx endpoint
    const searchUrl = `${ATVR_BASE_URLS[language]}/heim/vorur/vorur.aspx/?text=${encodeURIComponent(searchTerm)}`;

    // Try axios first with better headers
    console.log(`Trying axios approach for ${language}...`);
    let $;
    let html;
    
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': language === 'is' ? 'is-IS,is;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000
      });
      
      html = response.data;
      $ = cheerio.load(html);
      console.log(`Axios approach successful for ${language}, parsing HTML...`);
      console.log('HTML length:', html.length);
      
      // Check if we got meaningful content
      const hasProducts = $('listitem').length > 0 || $('[href*="productID"]').length > 0;
      if (hasProducts) {
        console.log(`Found products with axios approach for ${language}`);
      } else {
        console.log('No products found with axios, trying Playwright...');
        console.log('Available elements:', Object.keys($).filter(k => typeof $[k] === 'function').slice(0, 10));
        throw new Error('No products found with axios');
      }
    } catch (axiosError) {
      console.log('Axios failed, trying Playwright approach...');
      
      // Launch browser as fallback
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Navigate to search page
      console.log('Navigating to:', searchUrl);
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      // Wait for content
      await page.waitForTimeout(3000);
      
      // Get the HTML content
      html = await page.content();
      $ = cheerio.load(html);
      
      // Close browser
      await browser.close();
    }
    const products = [];

    console.log('Searching for products in HTML...');
    console.log('Total li.product elements found:', $('li.product').length);
    console.log('Total a[href*="productID"] elements found:', $('a[href*="productID"]').length);

    // Find product list items - ATVR uses <li class="product"> elements
    const productElements = $('li.product');
    console.log(`Found ${productElements.length} product containers`);

    for (let i = 0; i < productElements.length; i++) {
      const element = productElements.eq(i);
      const product = await parseProductFromSearchResult($, element, language);

      if (product && product.id) {
        console.log('Found product:', product.name, product.id);
        products.push(product);
      }
    }

    // Remove duplicates based on product ID
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
    );

    // Filter to only include products where the search term appears in the product name
    // This prevents irrelevant results from being returned
    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredProducts = uniqueProducts.filter(product => {
      const productNameLower = (product.name || '').toLowerCase();
      const productNameIsLower = (product.nameIs || '').toLowerCase();

      // Check if search term is in product name (allows partial matches)
      return productNameLower.includes(searchTermLower) || productNameIsLower.includes(searchTermLower);
    });

    console.log(`Found ${filteredProducts.length} products for ${language} (filtered from ${uniqueProducts.length})`);

    return filteredProducts;

  } catch (error) {
    console.error(`Error searching ATVR products for ${language}:`, error);
    return []; // Return empty array on error
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
};

// Get product details by ID
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const { language = 'is' } = req.query;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    const product = await getProductDetails(productId, language);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product, 'Product details retrieved successfully');

  } catch (error) {
    console.error('Error getting product details:', error);
    return errorResponse(res, 'Failed to get product details', 500);
  }
};

// Get food categories
const getFoodCategories = async (req, res) => {
  try {
    const { language = 'is' } = req.query;
    
    const categories = Object.entries(FOOD_CATEGORIES).map(([code, names]) => ({
      code,
      name: names[language] || names.is
    }));

    return successResponse(res, categories, 'Food categories retrieved successfully');

  } catch (error) {
    console.error('Error getting food categories:', error);
    return errorResponse(res, 'Failed to get food categories', 500);
  }
};

// Get product categories
const getProductCategories = async (req, res) => {
  try {
    const { language = 'is' } = req.query;
    
    const categories = Object.entries(PRODUCT_CATEGORIES).map(([code, names]) => ({
      code,
      name: names[language] || names.is
    }));

    return successResponse(res, categories, 'Product categories retrieved successfully');

  } catch (error) {
    console.error('Error getting product categories:', error);
    return errorResponse(res, 'Failed to get product categories', 500);
  }
};

module.exports = {
  searchProducts,
  getProductById,
  getFoodCategories,
  getProductCategories,
  downloadAndSaveImage
};
