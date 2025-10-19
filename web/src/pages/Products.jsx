import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, Search, ArrowUpDown } from 'lucide-react';
import { FaFish, FaDrumstickBite, FaCheese, FaCarrot, FaBirthdayCake, FaUtensils, FaPizzaSlice, FaLeaf, FaHamburger } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { fetchProducts, fetchCategories, setFilters } from '../store/slices/productSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductImage from '../components/common/ProductImage';
import SkeletonLoader from '../components/common/SkeletonLoader';
import DualThumbSlider from '../components/common/DualThumbSlider';
import { getProductName, getProductDescription, getProductCountry, getProductFoodPairings } from '../utils/languageUtils';

// Map food pairings to grayscale icons using react-icons
const getFoodIcon = (food) => {
  const foodLower = food.toLowerCase();
  if (foodLower.includes('fish') || foodLower.includes('fiskur')) return <FaFish className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('beef') || foodLower.includes('nautakjöt')) return <GiCow className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('lamb') || foodLower.includes('lambakjöt')) return <FaDrumstickBite className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('pork') || foodLower.includes('svínakjöt')) return <FaHamburger className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('fowl') || foodLower.includes('fuglakjöt') || foodLower.includes('poultry')) return <FaDrumstickBite className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('cheese') || foodLower.includes('ostur')) return <FaCheese className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('vegetable') || foodLower.includes('grænmeti')) return <FaCarrot className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('dessert') || foodLower.includes('eftirréttur')) return <FaBirthdayCake className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('seafood') || foodLower.includes('sjávarfiskur')) return <FaFish className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('pasta') || foodLower.includes('pasta')) return <FaUtensils className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('pizza') || foodLower.includes('pizza')) return <FaPizzaSlice className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('salad') || foodLower.includes('salat')) return <FaLeaf className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('meat') || foodLower.includes('kjöt')) return <GiCow className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('chicken') || foodLower.includes('kjúklingur')) return <FaDrumstickBite className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('duck') || foodLower.includes('önd')) return <FaDrumstickBite className="w-4 h-4 text-gray-500" />;
  if (foodLower.includes('turkey') || foodLower.includes('kalkúnn')) return <FaDrumstickBite className="w-4 h-4 text-gray-500" />;
  return <FaUtensils className="w-4 h-4 text-gray-500" />; // Default food icon
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, categories, filters, pagination, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle URL parameters for initial category filter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== filters.category) {
      dispatch(setFilters({ category: categoryFromUrl }));
    } else if (!categoryFromUrl && filters.category) {
      // Clear category if no category in URL
      dispatch(setFilters({ category: '' }));
    }
  }, [searchParams, dispatch, filters.category]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleCategoryChange = (category) => {
    const categoryName = typeof category === 'string' ? category : (category?.name || '');
    dispatch(setFilters({ category: categoryName }));
    setIsMobileFilterOpen(false);
    
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryName && categoryName.trim() !== '') {
      newSearchParams.set('category', categoryName);
    } else {
      newSearchParams.delete('category');
    }
    navigate(`/products?${newSearchParams.toString()}`, { replace: true });
  };

  const handleSearchChange = (search) => {
    dispatch(setFilters({ search }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    dispatch(setFilters({ sortBy, sortOrder }));
  };

  const handlePriceFilterChange = (minPrice, maxPrice) => {
    dispatch(setFilters({ minPrice, maxPrice }));
  };

  const handleAlcoholVolumeFilterChange = (minAlcoholVolume, maxAlcoholVolume) => {
    dispatch(setFilters({ minAlcoholVolume, maxAlcoholVolume }));
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6 w-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }, (_, i) => (
              <SkeletonLoader key={i} type="product" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  {t('productsPage.filters')}
                </h2>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('common.search')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('common.search')}
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-label={t('aria.searchProducts')}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('productsPage.category')}
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.category === '' 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-pressed={filters.category === ''}
                    >
                      {t('productsPage.all')}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          filters.category === category.name 
                            ? 'bg-primary-600 text-white shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-pressed={filters.category === category.name}
                      >
                        {i18n.language === 'is' ? category.nameIs : category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <DualThumbSlider
                    min={0}
                    max={50000}
                    step={100}
                    value={[filters.minPrice || 0, filters.maxPrice || 50000]}
                    onChange={(values) => handlePriceFilterChange(values[0], values[1])}
                    label={`${t('productsPage.priceRange')} (${filters.minPrice || 0} - ${filters.maxPrice || 50000} kr)`}
                    formatValue={(val) => `${val} kr`}
                  />
                </div>

                {/* Alcohol Volume Range Filter */}
                <div>
                  <DualThumbSlider
                    min={0}
                    max={50}
                    step={0.5}
                    value={[filters.minAlcoholVolume || 0, filters.maxAlcoholVolume || 50]}
                    onChange={(values) => handleAlcoholVolumeFilterChange(values[0], values[1])}
                    label={`${t('productsPage.alcoholVolume')} (${filters.minAlcoholVolume || 0} - ${filters.maxAlcoholVolume || 50}%)`}
                    formatValue={(val) => `${val}%`}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('products.title')}
                </h1>
                
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleSortChange(sortBy, sortOrder);
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="name-asc">{t('productsPage.sortByNameAsc')}</option>
                      <option value="name-desc">{t('productsPage.sortByNameDesc')}</option>
                      <option value="price-asc">{t('productsPage.sortByPriceAsc')}</option>
                      <option value="price-desc">{t('productsPage.sortByPriceDesc')}</option>
                      <option value="alcoholVolume-asc">{t('productsPage.sortByAlcoholAsc')}</option>
                      <option value="alcoholVolume-desc">{t('productsPage.sortByAlcoholDesc')}</option>
                    </select>
                  </div>
                  
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden btn btn-outline flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {t('productsPage.filters')}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                {products.length} {t('productsPage.products')}
              </p>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('productsPage.noProductsFound')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t('productsPage.adjustSearch')}
                  </p>
                  <button
                    onClick={() => handleSearchChange('')}
                    className="btn btn-outline"
                  >
                    {t('common.clearSearch')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <Link to={`/products/${product.id}`} className="block flex-shrink-0">
                        <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                          <ProductImage 
                            product={product}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            currentLanguage={i18n.language}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                          {product.stock === 0 && (
                            <div className="absolute top-3 right-3">
                              <span className="px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-red-500 text-white">
                                {t('products.outOfStock')}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-4 flex-1">
                          <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white line-clamp-2 leading-tight">
                            {getProductName(i18n.language, product)}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                            {getProductDescription(i18n.language, product)}
                          </p>
                          
                          {/* ATVR Product Info */}
                          {(product.volume || product.alcoholContent || product.country) && (
                            <div className="mt-3 space-y-1">
                              {product.volume && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">{t('products.volume')}:</span> {product.volume}
                                </p>
                              )}
                              {product.alcoholContent && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">{t('products.alcoholContent')}:</span> {product.alcoholContent}%
                                </p>
                              )}
                              {product.country && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">{t('products.country')}:</span> {getProductCountry(i18n.language, product)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {product.price.toLocaleString()} {t('common.currency')}
                          </span>
                        </div>
                        
                        {/* Food Pairing Icons */}
                        {getProductFoodPairings(i18n.language, product).length > 0 && (
                          <div className="mt-3 mb-4">
                            <div className="flex flex-wrap gap-2">
                              {getProductFoodPairings(i18n.language, product).slice(0, 4).map((pairing, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full"
                                  title={pairing}
                                >
                                  {getFoodIcon(pairing)}
                                </div>
                              ))}
                              {getProductFoodPairings(i18n.language, product).length > 4 && (
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-500">
                                  +{getProductFoodPairings(i18n.language, product).length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-auto">
                          {isAuthenticated && product.stock > 0 && (
                            <Link
                              to={`/products/${product.id}`}
                              className="btn btn-primary w-full py-3 text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                              </svg>
                              {t('products.addToCart')}
                            </Link>
                          )}
                          
                          {!isAuthenticated && (
                            <Link
                              to={`/products/${product.id}`}
                              className="btn btn-outline w-full py-3 text-sm font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {t('common.view')}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t('productsPage.filters')}
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('common.search')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label={t('aria.searchProducts')}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('productsPage.category')}
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    !filters.category || filters.category === '' || filters.category === null
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={!filters.category || filters.category === '' || filters.category === null}
                >
                  {t('productsPage.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.category === category.name 
                        ? 'bg-primary-600 text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-pressed={filters.category === category.name}
                  >
                    {i18n.language === 'is' ? category.nameIs : category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <DualThumbSlider
                min={0}
                max={50000}
                step={100}
                value={[filters.minPrice || 0, filters.maxPrice || 50000]}
                onChange={(values) => handlePriceFilterChange(values[0], values[1])}
                label={`${t('productsPage.priceRange')} (${filters.minPrice || 0} - ${filters.maxPrice || 50000} kr)`}
                formatValue={(val) => `${val} kr`}
              />
            </div>

            {/* Alcohol Volume Range Filter */}
            <div className="mb-6">
              <DualThumbSlider
                min={0}
                max={50}
                step={0.5}
                value={[filters.minAlcoholVolume || 0, filters.maxAlcoholVolume || 50]}
                onChange={(values) => handleAlcoholVolumeFilterChange(values[0], values[1])}
                label={`${t('productsPage.alcoholVolume')} (${filters.minAlcoholVolume || 0} - ${filters.maxAlcoholVolume || 50}%)`}
                formatValue={(val) => `${val}%`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
