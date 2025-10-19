import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ATVRImport = ({ onImportProduct, onClose }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  // Language selection removed - now searches both languages automatically

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
      const response = await fetch('http://192.168.8.62:5000/api/atvr/search', {
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
    const foodPairings = atvrProduct.foodPairings || [];
    const foodPairingsIs = atvrProduct.foodPairingsIs || [];
    const parsedPairings = foodPairings.map(code => ({
      code,
      name: foodCategories[code]?.en || code
    }));
    const parsedPairingsIs = foodPairingsIs.map(code => ({
      code,
      name: foodCategories[code]?.is || code
    }));

    return {
      name: atvrProduct.name,
      nameIs: atvrProduct.nameIs || atvrProduct.name,
      description: atvrProduct.description || '',
      descriptionIs: atvrProduct.descriptionIs || atvrProduct.description || '',
      price: parseFloat(atvrProduct.price.replace(/[^\d.,]/g, '').replace(',', '.')),
      category: productCategories[atvrProduct.category]?.en || atvrProduct.category,
      image: atvrProduct.image,
      alcoholContent: atvrProduct.alcoholContent,
      volume: atvrProduct.volume,
      volumeIs: atvrProduct.volumeIs,
      country: atvrProduct.country,
      countryIs: atvrProduct.countryIs,
      producer: atvrProduct.producer,
      producerIs: atvrProduct.producerIs,
      distributor: atvrProduct.distributor,
      distributorIs: atvrProduct.distributorIs,
      packaging: atvrProduct.packaging,
      packagingIs: atvrProduct.packagingIs,
      foodPairings: parsedPairings,
      foodPairingsIs: parsedPairingsIs,
      specialAttributes: atvrProduct.specialAttributes || [],
      specialAttributesIs: atvrProduct.specialAttributesIs || [],
      availability: atvrProduct.availability || 'available',
      availabilityIs: atvrProduct.availabilityIs,
      atvrProductId: atvrProduct.id,
      atvrUrl: atvrProduct.url
    };
  };

  // Import selected products
  const handleImport = async () => {
    if (selectedProducts.length === 0) {
      toast.error(t('atvrImport.pleaseSelectOne'));
      return;
    }

    try {
      const parsedProducts = selectedProducts.map(parseATVRProduct);
      
      for (const product of parsedProducts) {
        await onImportProduct(product);
      }

      toast.success(`${t('atvrImport.successfullyImported')} ${parsedProducts.length} ${t('atvrImport.productsImported')}`);
      setSelectedProducts([]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error(t('atvrImport.failedToImport'));
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {parsedProduct.name}
                          </h4>
                          {parsedProduct.nameIs && parsedProduct.nameIs !== parsedProduct.name && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <strong>{t('atvrImport.icelandicLabel')}</strong> {parsedProduct.nameIs}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {parsedProduct.description}
                          </p>
                          {parsedProduct.descriptionIs && parsedProduct.descriptionIs !== parsedProduct.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <strong>{t('atvrImport.icelandicLabel')}</strong> {parsedProduct.descriptionIs}
                            </p>
                          )}
                          <p className="text-lg font-bold text-primary-600">
                            {parsedProduct.price} kr
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {parsedProduct.volume && (
                            <p className="text-sm">
                              <strong>{t('atvrImport.volume')}</strong> {parsedProduct.volume}
                              {parsedProduct.volumeIs && parsedProduct.volumeIs !== parsedProduct.volume && (
                                <span className="text-gray-600"> / {parsedProduct.volumeIs}</span>
                              )}
                            </p>
                          )}
                          {parsedProduct.country && (
                            <p className="text-sm">
                              <strong>{t('atvrImport.country')}</strong> {parsedProduct.country}
                              {parsedProduct.countryIs && parsedProduct.countryIs !== parsedProduct.country && (
                                <span className="text-gray-600"> / {parsedProduct.countryIs}</span>
                              )}
                            </p>
                          )}
                          {parsedProduct.producer && (
                            <p className="text-sm">
                              <strong>{t('atvrImport.producer')}</strong> {parsedProduct.producer}
                              {parsedProduct.producerIs && parsedProduct.producerIs !== parsedProduct.producer && (
                                <span className="text-gray-600"> / {parsedProduct.producerIs}</span>
                              )}
                            </p>
                          )}
                          {parsedProduct.foodPairings && parsedProduct.foodPairings.length > 0 && (
                            <div>
                              <strong className="text-sm">{t('atvrImport.foodPairings')}</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedProduct.foodPairings.map((pairing, idx) => (
                                  <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    {pairing.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
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
          <div className="flex-1 overflow-hidden flex">
            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6">
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
                                className="w-16 h-16 object-cover rounded"
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
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
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
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t('atvrImport.importProducts')}</span>
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