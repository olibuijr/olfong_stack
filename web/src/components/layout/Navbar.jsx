import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "../../contexts/LanguageContext";
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ShoppingCart, User, Globe, Settings, Search, Package } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/productSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import api from '../../services/api';

const Navbar = () => {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  // Refs
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const shopMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const cartItemCount = cart?.items?.length || 0;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };



  const isAdmin = user?.role === 'ADMIN';
  const isDelivery = user?.role === 'DELIVERY';

  // Search functionality
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
      setSearchResults(response.data.data?.products || []);
      setIsSearchDropdownOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedResultIndex(-1);

    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchDropdownOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleResultClick = (product) => {
    navigate(`/products/${product.id}`);
    setIsSearchDropdownOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleKeyDown = (e) => {
    if (!isSearchDropdownOpen || searchResults.length === 0) {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
          handleResultClick(searchResults[selectedResultIndex]);
        } else {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setIsSearchDropdownOpen(false);
        setSelectedResultIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsSearchDropdownOpen(false);
        setSelectedResultIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close shop menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shopMenuRef.current &&
        !shopMenuRef.current.contains(event.target) &&
        !event.target.closest('[data-shop-menu-trigger]')
      ) {
        setIsShopMenuOpen(false);
      }
    };

    if (isShopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShopMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50" role="navigation" aria-label={t('aria.mainNavigation')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label={t('aria.homepage')}>
            <img
              src="/logo_black-web.webp"
              alt={t('aria.logo')}
              className="h-12 w-auto dark:invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative" ref={searchDropdownRef}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyDown}
                  placeholder={t('search.placeholder')}
                  className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  autoComplete="off"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-2 top-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-[70]">
                  {isSearching ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        <span>{t('search.searching')}</span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            index === selectedResultIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${product.imageUrl}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {product.nameIs || product.name}
                                </h4>
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0">
                                  {product.price.toLocaleString()} {t('common.currency')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {product.descriptionIs || product.description}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                  {product.category?.nameIs || 'Flokkur'}
                                </span>
                                 {product.alcoholContent && (
                                   <span className="text-xs text-gray-500 dark:text-gray-400">
                                     {product.alcoholContent}% {t('product.abv')}
                                   </span>
                                 )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* View All Results */}
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full px-4 py-3 text-center text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                          {t('search.viewAllResults')} &quot;{searchQuery}&quot;
                        </button>
                      </div>
                    </div>
                  ) : searchQuery.trim() && !isSearching ? (
                    <div className="px-4 py-6 text-center">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('search.noResults')} &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* All Products Link */}
            <Link
              to="/products"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t('productsPage.all')}
            </Link>

            {/* Enhanced Categories Mega Menu */}
            <div className="relative" ref={shopMenuRef}>
              <button
                data-shop-menu-trigger
                onMouseEnter={() => setIsShopMenuOpen(true)}
                onMouseLeave={() => setIsShopMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center"
              >
                {t('navigation', 'shop')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Mega Menu - More Zoomed In */}
              <div
                onMouseEnter={() => setIsShopMenuOpen(true)}
                onMouseLeave={() => setIsShopMenuOpen(false)}
                className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[1100px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] transition-all duration-300 overflow-hidden ${
                  isShopMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                {/* Enhanced Header */}
                <div className="px-8 py-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t('navigation.shop')}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          {t('navigation.discoverCategories')}
                        </p>
                    </div>
                     <Link
                       to="/products"
                       onClick={() => setIsShopMenuOpen(false)}
                       className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold text-base"
                     >
                      {t('navigation.viewAllProducts')}
                    </Link>
                  </div>
                </div>

                {/* Categories Grid - More Zoomed In */}
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4">
                     {categories.filter(category => category.isActive).map((category) => (
                       <Link
                         key={category.id}
                         to={`/products?category=${category.name}`}
                         onClick={() => setIsShopMenuOpen(false)}
                         className="group block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                       >
                        {/* Enhanced Category Header */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${category.imageUrl}`}
                                alt={category.name}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">
                                {category.name === 'WINE' && '🍷'}
                                {category.name === 'BEER' && '🍺'}
                                {category.name === 'SPIRITS' && '🥃'}
                                {category.name === 'VAPE' && '💨'}
                                {category.name === 'NICOTINEPADS' && '📱'}
                                {!['WINE', 'BEER', 'SPIRITS', 'VAPE', 'NICOTINEPADS'].includes(category.name) && '📦'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-base truncate">
                              {category.nameIs}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{category._count?.products || 0} {t('common.itemsLabel')}</span>
                              {category.subcategories && category.subcategories.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{category.subcategories.length} {t('adminCategories.subcategories').toLowerCase()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                          {category.descriptionIs || category.description || t('category.fallbackDescription')}
                        </p>

                        {/* Subcategories - Enhanced Layout */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.slice(0, 4).map((subcategory) => (
                              <span
                                key={subcategory.id}
                                className="inline-block px-3 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md font-medium"
                              >
                                {subcategory.nameIs || subcategory.name}
                              </span>
                            ))}
                            {category.subcategories.length > 4 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 font-medium">
                                +{category.subcategories.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Enhanced Footer */}
                <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {t('navigation.needHelp')} <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">{t('navigation.contactUs')}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <>
                {isDelivery && (
                  <Link
                    to="/delivery"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t('navigation.delivery')}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Admin Mega Menu (Cogwheel) */}
            {isAuthenticated && isAdmin && (
              <div className="relative group">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsAdminMenuOpen(false);
                  }}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('navigation.admin')}
                  aria-expanded={isAdminMenuOpen}
                  aria-haspopup="true"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {/* Admin Mega Menu - More Zoomed In */}
                <div className="absolute top-full right-0 mt-2 w-[850px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:right-auto">
                  {/* Enhanced Header */}
                  <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t('navigation.admin')}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          {t('adminDashboard.manageYourStore')}
                        </p>
                      </div>
                      <Link
                        to="/admin"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-base"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        {t('adminDashboard.dashboard')}
                      </Link>
                    </div>
                  </div>

                  {/* Admin Pages Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Core Management */}
                      <div className="space-y-3">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 px-2">
                          {t('adminDashboard.coreManagement')}
                        </h4>
                        <Link
                          to="/admin/products"
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-600 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-base">
                              {t('navigation.products')}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageProducts')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-base">
                              {t('navigation.orders')}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageOrders')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/customers"
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-600 rounded-lg">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-base">
                              {t('navigation.customers')}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageCustomers')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/categories"
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('navigation.categories')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageCategories')}
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Analytics & Reports */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2">
                          {t('adminDashboard.analyticsReports')}
                        </h4>
                        <Link
                          to="/admin/analytics"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('admin.analytics')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.viewAnalytics')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/reports"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminDashboard.reports')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.generateReports')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/chat"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('chat.title')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageChat')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/notifications"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 7H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-1.828" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminDashboard.notifications')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageNotifications')}
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Settings & Tools */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2">
                          {t('adminDashboard.settingsTools')}
                        </h4>
                        <Link
                          to="/admin/settings"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <Settings className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('navigation.settings')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.systemSettings')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/translations"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <Globe className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminDashboard.translations')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageTranslations')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/banners"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminDashboard.banners')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageBanners')}
                            </p>
                          </div>
                        </Link>
                        <Link
                          to="/admin/demo-data"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminDashboard.demoData')}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('adminDashboard.manageDemoData')}
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('adminDashboard.quickAccess')} <Link to="/admin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{t('adminDashboard.dashboard')}</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Cart */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${cartItemCount} items in cart`}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label={t('aria.userMenu')}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                   <span className="hidden sm:block text-gray-900 dark:text-white">{user?.fullName?.split(' ')[0] || user?.username}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[70] border border-gray-200 dark:border-gray-700" role="menu" aria-label={t('aria.userMenu')}>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      {t('navigation.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      {t('navigation.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-outline"
              >
                {t('navigation.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label={t('aria.toggleMobileMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('navigation.menu')}</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                 <div className="flex-1 overflow-y-auto py-4">
                  {/* Mobile Search */}
                  <div className="px-4 mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit();
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        placeholder={t('search.placeholder')}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        autoComplete="off"
                      />
                      <button
                        onClick={() => {
                          handleSearchSubmit();
                          setIsMobileMenuOpen(false);
                        }}
                        className="absolute right-3 top-3 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 px-4">
                    <Link
                      to="/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('productsPage.all')}
                    </Link>

                    {/* Category Links */}
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.name}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {category.nameIs}
                      </Link>
                    ))}

                    {isAuthenticated && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('navigation.profile')}
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t('navigation.admin')}
                          </Link>
                        )}

                        {isDelivery && (
                          <Link
                            to="/delivery"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t('navigation.delivery')}
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                        >
                          {t('navigation.logout')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

