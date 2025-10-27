import { useState, useEffect } from 'react';
import { Search, Eye, Download, AlertCircle, CheckCircle, X, Sparkles } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const ATVRImport = ({ onImportProduct, onClose, onGeneratingProducts }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [autoGenerateAI, setAutoGenerateAI] = useState(false);
  const [hasRunPodKey, setHasRunPodKey] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // Language selection removed - now searches both languages automatically

  // Check if RunPod API key is configured
  useEffect(() => {
    const checkRunPodKey = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
        const response = await fetch(`${apiBase}/api/ai-image/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const hasKey = data.settings?.runpodApiKey ? true : false;
          setHasRunPodKey(hasKey);
          console.log('RunPod API key check:', { hasKey, data });
        }
      } catch (error) {
        console.error('Error checking RunPod API key:', error);
      }
    };

    checkRunPodKey();
  }, []);

  // Food categories mapping
  const foodCategories = {
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
  const productCategories = {
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

  // Search ATVR products
  const searchATVRProducts = async (term) => {
    if (!term.trim()) return;

    setIsSearching(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
      const response = await fetch(`${apiBase}/api/atvr/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: term
        }),
      });

      if (!response.ok) {
        throw new Error(t('atvrImport.failedToImport'));
      }

      const data = await response.json();
      setSearchResults(data.data?.products || []);
    } catch (error) {
      console.error('Error searching ATVR products:', error);
      toast.error(t('atvrImport.failedToImport'));
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    searchATVRProducts(searchTerm);
  };

  // Toggle product selection
  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Parse ATVR product data to our format with bilingual support
  const parseATVRProduct = (atvrProduct) => {
    // Food pairings from ATVR are already human-readable names, pass them through as-is
    const foodPairings = atvrProduct.foodPairings || [];
    const foodPairingsIs = atvrProduct.foodPairingsIs || [];

    // Map ATVR subcategories to internal names
    const subcategoryMapping = {
      // Wines
      'Red wine': 'RED_WINE',
      'Rauðvín': 'RED_WINE',
      'White wine': 'WHITE_WINE',
      'Hvítvín': 'WHITE_WINE',
      'Rosé wine': 'ROSE_WINE',
      'Rose wine': 'ROSE_WINE',
      'Rósavín': 'ROSE_WINE',
      'Sparkling wine': 'SPARKLING_WINE',
      'Freyðivín': 'SPARKLING_WINE',
      'Champagne': 'CHAMPAGNE',
      'Dessert wine': 'DESSERT_WINE',
      'Yellow wine': 'YELLOW_WINE',
      // Spirits
      'Gin': 'GIN',
      'Vodka': 'VODKA',
      'Rum': 'RUM',
      'Whiskey': 'WHISKEY',
      'Whisky': 'WHISKEY',
      'Cognac': 'COGNAC',
      'Liqueur': 'LIQUEURS_SHOTS',
      'Tequila': 'TEQUILA',
      // Beer
      'Beer': 'BEER',
      'Bjór': 'BEER',
      // Cider
      'Cider': 'CIDER_RTD',
      'Síder': 'CIDER_RTD'
    };

    const parsedSubcategory = subcategoryMapping[atvrProduct.subcategory] || atvrProduct.subcategory;

    return {
      name: atvrProduct.name,
      nameIs: atvrProduct.nameIs || atvrProduct.name,
      description: atvrProduct.description || '',
      descriptionIs: atvrProduct.descriptionIs || atvrProduct.description || '',
      price: typeof atvrProduct.price === 'number' ? atvrProduct.price : parseFloat(atvrProduct.price.replace(/[^\d.,]/g, '').replace(',', '.')),
      category: productCategories[atvrProduct.category]?.en || atvrProduct.category,
      subcategory: parsedSubcategory,
      subcategoryIs: atvrProduct.subcategoryIs || parsedSubcategory,
      image: atvrProduct.image,
      alcoholContent: atvrProduct.alcoholContent,
      volume: atvrProduct.volume,
      volumeIs: atvrProduct.volumeIs,
      country: atvrProduct.country,
      countryIs: atvrProduct.countryIs,
      region: atvrProduct.region,
      regionIs: atvrProduct.regionIs,
      origin: atvrProduct.origin,
      originIs: atvrProduct.originIs,
      producer: atvrProduct.producer,
      producerIs: atvrProduct.producerIs,
      distributor: atvrProduct.distributor,
      distributorIs: atvrProduct.distributorIs,
      packaging: atvrProduct.packaging,
      packagingIs: atvrProduct.packagingIs,
      packagingWeight: atvrProduct.packagingWeight,
      packagingWeightIs: atvrProduct.packagingWeightIs,
      carbonFootprint: atvrProduct.carbonFootprint,
      carbonFootprintIs: atvrProduct.carbonFootprintIs,
      vintage: atvrProduct.vintage,
      grapeVariety: atvrProduct.grapeVariety,
      grapeVarietyIs: atvrProduct.grapeVarietyIs,
      wineStyle: atvrProduct.wineStyle,
      wineStyleIs: atvrProduct.wineStyleIs,
      pricePerLiter: atvrProduct.pricePerLiter,
      pricePerLiterIs: atvrProduct.pricePerLiterIs,
      foodPairings: foodPairings,
      foodPairingsIs: foodPairingsIs,
      specialAttributes: atvrProduct.specialAttributes || [],
      specialAttributesIs: atvrProduct.specialAttributesIs || [],
      certifications: atvrProduct.certifications || [],
      certificationsIs: atvrProduct.certificationsIs || [],
      availability: atvrProduct.availability || 'available',
      availabilityIs: atvrProduct.availabilityIs,
      atvrProductId: atvrProduct.id,
      atvrUrl: atvrProduct.url,
      atvrImageUrl: atvrProduct.atvrImageUrl || atvrProduct.image
    };
  };

  // Fetch detailed product information from ATVR
  const fetchProductDetails = async (productId) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
      const response = await fetch(`${apiBase}/api/atvr/product/${productId}`);
      if (!response.ok) {
        console.warn(`Failed to fetch details for product ${productId}`);
        return null;
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching product details for ${productId}:`, error);
      return null;
    }
  };

  // Import selected products
  const handleImport = async () => {
    if (selectedProducts.length === 0) {
      toast.error(t('atvrImport.pleaseSelectOne'));
      return;
    }

    setIsImporting(true);
    try {
      // Fetch detailed information for each product to capture all fields
      const enrichedProducts = await Promise.all(
        selectedProducts.map(async (searchResult) => {
          // First try to fetch full details from product page
          const detailedProduct = await fetchProductDetails(searchResult.id);

          // Merge search result with detailed product info (detailed product takes precedence)
          const mergedProduct = {
            ...searchResult,
            ...detailedProduct,
            // Preserve search result data if detail fetch failed
            id: searchResult.id
          };

          return mergedProduct;
        })
      );

      const parsedProducts = enrichedProducts.map(parseATVRProduct);

      // Import products and collect mediaIds for AI generation
      const importedMediaIds = [];
      for (const product of parsedProducts) {
        const result = await onImportProduct(product);
        // If auto-generate is enabled and we have a mediaId from the import, store it
        if (autoGenerateAI && result?.mediaId) {
          importedMediaIds.push(result.mediaId);
        }
      }

      // Generate AI images if auto-generate is enabled
      if (autoGenerateAI && importedMediaIds.length > 0) {
        // Collect job mappings: mediaId -> jobId
        const jobMappings = {};

        toast.loading(`Generating AI images for ${importedMediaIds.length} product(s)...`);

        for (const mediaId of importedMediaIds) {
          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
            const response = await fetch(`${apiBase}/api/ai-image/generate/${mediaId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                shadowStyle: 'soft',
                backgroundColor: '#FFFFFF'
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.jobId) {
                jobMappings[mediaId] = data.jobId;
                console.log(`Generation started for media ${mediaId} with jobId ${data.jobId}`);
              }
            }
          } catch (error) {
            console.error(`Error generating AI image for media ${mediaId}:`, error);
          }
        }

        // Notify parent component about generating products with job mappings
        if (onGeneratingProducts) {
          onGeneratingProducts(importedMediaIds, jobMappings);
        }

        toast.dismiss();
        toast.success(`${t('atvrImport.successfullyImported')} ${parsedProducts.length} ${t('atvrImport.productsImported')} and AI images are being generated...`);
      } else {
        toast.success(`${t('atvrImport.successfullyImported')} ${parsedProducts.length} ${t('atvrImport.productsImported')}`);
      }

      setSelectedProducts([]);
      setSearchResults([]);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error(t('atvrImport.failedToImport'));
    } finally {
      setIsImporting(false);
    }
  };

  // Preview selected products
  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 60 }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('atvrImport.previewImportTitle')} ({selectedProducts.length} {t('atvrImport.products')})
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {selectedProducts.map((product, index) => {
                  const parsedProduct = parseATVRProduct(product);
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Product Image */}
                        {parsedProduct.image && (
                          <div className="md:col-span-1">
                            <img
                              src={parsedProduct.image}
                              alt={parsedProduct.name}
                              className="w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                            />
                          </div>
                        )}

                        {/* Main Information */}
                        <div className={parsedProduct.image ? "md:col-span-2" : "md:col-span-3"}>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {parsedProduct.name}
                              </h4>
                              {parsedProduct.nameIs && parsedProduct.nameIs !== parsedProduct.name && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  <strong>{t('atvrImport.icelandicLabel')}:</strong> {parsedProduct.nameIs}
                                </p>
                              )}
                            </div>

                            {/* Category and Price */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                                {parsedProduct.category}
                              </span>
                              <p className="text-lg font-bold text-primary-600">
                                {parsedProduct.price} kr
                              </p>
                            </div>

                            {/* Description */}
                            {parsedProduct.description && (
                              <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {parsedProduct.description}
                                </p>
                                {parsedProduct.descriptionIs && parsedProduct.descriptionIs !== parsedProduct.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <strong>{t('atvrImport.icelandicLabel')}:</strong> {parsedProduct.descriptionIs}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Product Details Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              {parsedProduct.volume && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.volume')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.volume}
                                    {parsedProduct.volumeIs && parsedProduct.volumeIs !== parsedProduct.volume && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.volumeIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              {parsedProduct.alcoholContent && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.alcoholContent')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.alcoholContent}%
                                  </p>
                                </div>
                              )}
                              {parsedProduct.country && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.country')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.country}
                                    {parsedProduct.countryIs && parsedProduct.countryIs !== parsedProduct.country && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.countryIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              {parsedProduct.producer && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.producer')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.producer}
                                    {parsedProduct.producerIs && parsedProduct.producerIs !== parsedProduct.producer && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.producerIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              {parsedProduct.distributor && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.distributor')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.distributor}
                                    {parsedProduct.distributorIs && parsedProduct.distributorIs !== parsedProduct.distributor && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.distributorIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              {parsedProduct.packaging && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.packaging')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.packaging}
                                    {parsedProduct.packagingIs && parsedProduct.packagingIs !== parsedProduct.packaging && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.packagingIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                              {parsedProduct.availability && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('atvrImport.availability')}
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {parsedProduct.availability}
                                    {parsedProduct.availabilityIs && parsedProduct.availabilityIs !== parsedProduct.availability && (
                                      <span className="text-gray-600 dark:text-gray-400"> / {parsedProduct.availabilityIs}</span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Food Pairings */}
                            {parsedProduct.foodPairings && parsedProduct.foodPairings.length > 0 && (
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                  {t('atvrImport.foodPairings')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {parsedProduct.foodPairings.map((pairing, idx) => (
                                    <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                      {typeof pairing === 'string' ? pairing : pairing.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Special Attributes */}
                            {parsedProduct.specialAttributes && parsedProduct.specialAttributes.length > 0 && (
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                  {t('atvrImport.specialAttributes')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {parsedProduct.specialAttributes.map((attr, idx) => (
                                    <span key={idx} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                      {typeof attr === 'string' ? attr : attr.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ATVR URL */}
                            {parsedProduct.atvrUrl && (
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <a
                                  href={parsedProduct.atvrUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                                >
                                  {t('atvrImport.viewOnATVR')} →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {t('atvrImport.cancel')}
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        handleImport();
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      {t('atvrImport.importProductsButton')}
                    </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Import Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 50 }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
          {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('atvrImport.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {t('atvrImport.subtitle')}
                </p>
              </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search both languages automatically - no language selection needed */}

          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('atvrImport.searchPlaceholderIs')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchTerm.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{t('atvrImport.search')}</span>
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0 min-w-0">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('atvrImport.searchResults')} ({searchResults.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedProducts.length} {t('atvrImport.selected')}
                  </span>
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('atvrImport.clearAll')}
                  </button>
                </div>
                  </div>

                  <div className="grid gap-4">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedProducts.some(p => p.id === product.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-contain rounded"
                              />
                            ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">{t('atvrImport.noImage')}</span>
                        </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {product.category} • {product.country}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.volume} • {product.alcoholContent}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {product.price} kr.
                                </p>
                                {product.foodPairings && product.foodPairings.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {product.foodPairings.slice(0, 3).map((pairing, index) => (
                                      <span
                                        key={index}
                                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                      >
                                        {pairing}
                                      </span>
                                    ))}
                                    {product.foodPairings.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.foodPairings.length - 3} {t('atvrImport.more')}
                                </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {selectedProducts.some(p => p.id === product.id) ? (
                              <CheckCircle className="h-5 w-5 text-primary-600" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchTerm && !isSearching ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('atvrImport.noProductsFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('atvrImport.tryDifferentTerms')}
                </p>
              </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t('atvrImport.searchATVRProducts')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('atvrImport.enterSearchTerm')}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Products Sidebar */}
            {selectedProducts.length > 0 && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('atvrImport.selected')} ({selectedProducts.length})
                </h3>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t('atvrImport.clearAll')}
                </button>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {product.price} kr.
                          </p>
                        </div>
                        <button
                          onClick={() => toggleProductSelection(product)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-generate AI images with FLUX Kontext option */}
                {hasRunPodKey && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenerateAI}
                        onChange={(e) => setAutoGenerateAI(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>{t('atvrImport.generateAIImages') || 'Generate Images with FLUX Kontext Dev'}</span>
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t('atvrImport.generateAIImagesDescription') || 'Automatically generate 1024x1024 product images with Icelandic backgrounds using FLUX Kontext Dev'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handlePreview}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{t('atvrImport.previewImport')}</span>
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('atvrImport.importing') || 'Importing...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>{t('atvrImport.importProducts')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ATVRImport;