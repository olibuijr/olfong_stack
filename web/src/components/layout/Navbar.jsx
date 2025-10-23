import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "../../contexts/LanguageContext";
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ShoppingCart, User, Globe, Settings, Search, Package, LayoutDashboard, BarChart3, FileText, MessageCircle, Bell, Truck, Calculator, FolderOpen, Image, FileImage, Languages, Play, CreditCard, Receipt, Clock, Plus } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import api from '../../services/api';
import { getTodayHours, isStoreOpen } from '../../utils/openingHours';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { t, currentLanguage, setCurrentLanguage } = useLanguage();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Opening hours state
  const [openingHours, setOpeningHours] = useState(null);

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
  const languageMenuRef = useRef(null);
  const adminMenuRef = useRef(null);

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    dispatch(fetchCategories());
    fetchOpeningHours();
  }, [dispatch]);

  // Fetch opening hours from the database
  const fetchOpeningHours = async () => {
    try {
      const response = await fetch('/api/settings/opening-hours');
      if (response.ok) {
        const data = await response.json();
        if (data.data?.openingHours) {
          setOpeningHours(data.data.openingHours);
        } else {
          // Fallback to hardcoded values
          setOpeningHours(getTodayHours());
        }
      }
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      // Fallback to hardcoded values
      setOpeningHours(getTodayHours());
    }
  };

  // Get today's hours from the fetched opening hours (with fallback to hardcoded if not yet loaded)
  const getTodayHoursFromDB = () => {
    // If opening hours haven't loaded yet, use hardcoded values as fallback
    if (!openingHours) {
      return getTodayHours();
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayName = daysOfWeek[today];

    return openingHours[dayName] || getTodayHours();
  };

  // Check if store is currently open based on fetched hours
  const isStoreOpenNow = () => {
    // If opening hours haven't loaded yet, use hardcoded function as fallback
    if (!openingHours) {
      return isStoreOpen();
    }

    const todayHours = getTodayHoursFromDB();
    if (todayHours.closed) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return currentTime >= todayHours.open && currentTime < todayHours.close;
  };

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

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageMenuOpen]);

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
      setSearchResults(response.data?.products || []);
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

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent navigation to product detail
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.success(t('cart.itemAdded'));
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || t('cart.addError'));
    }
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

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setIsAdminMenuOpen(false);
      }
    };

    if (isAdminMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdminMenuOpen]);

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
          {/* Logo and Hours */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center" aria-label={t('aria.homepage')}>
              <img
                src="/logo_black-web.webp"
                alt={t('aria.logo')}
                className="h-12 w-auto dark:invert"
              />
            </Link>

            {/* Today's Hours */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex items-center gap-2">
                {getTodayHoursFromDB().closed ? (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">
                      {currentLanguage === 'is' ? 'Í dag' : 'Today'}:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {currentLanguage === 'is' ? 'Lokað' : 'Closed'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">
                      {currentLanguage === 'is' ? 'Í dag' : 'Today'}: {getTodayHoursFromDB().open} - {getTodayHoursFromDB().close}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isStoreOpenNow()
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {isStoreOpenNow()
                        ? (currentLanguage === 'is' ? 'Opið' : 'Open')
                        : (currentLanguage === 'is' ? 'Lokað' : 'Closed')
                      }
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[512px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-[70]">
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
                        <div
                          key={product.id}
                          className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            index === selectedResultIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Product Image */}
                            <button
                              onClick={() => handleResultClick(product)}
                              className="flex-shrink-0 w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
                            >
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </button>

                            {/* Product Info */}
                            <button
                              onClick={() => handleResultClick(product)}
                              className="flex-1 min-w-0 text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                  {product.nameIs || product.name}
                                </h4>
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex-shrink-0">
                                  {product.price.toLocaleString()} {t('common.currency')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {product.descriptionIs || product.description}
                              </p>
                              <div className="flex items-center mt-1.5 space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                  {product.category?.nameIs || 'Flokkur'}
                                </span>
                                 {product.alcoholContent && (
                                   <span className="text-xs text-gray-500 dark:text-gray-400">
                                     {product.alcoholContent}% {t('product.abv')}
                                   </span>
                                 )}
                              </div>
                            </button>

                            {/* Add to Cart Button */}
                            {isAuthenticated && (
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                                title={t('cart.addToCart')}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
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
                {t('navigation.shop')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Mega Menu - More Zoomed In */}
              <div
                onMouseEnter={() => setIsShopMenuOpen(true)}
                onMouseLeave={() => setIsShopMenuOpen(false)}
                className={`fixed top-[4rem] left-1/2 transform -translate-x-1/2 mt-2 w-[1100px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[999] transition-all duration-300 overflow-hidden ${
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
                         className="group block p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                       >
                        {/* Category Image - Large */}
                        {category.imageUrl && (
                          <div className="mb-3 flex items-center justify-center w-full h-32 bg-white dark:bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-200">
                            <img
                              src={category.imageUrl.startsWith('http') ? category.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${category.imageUrl}`}
                              alt={category.name}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}

                        {/* Enhanced Category Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          {!category.imageUrl && (
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex-shrink-0">
                              <span className="text-xl">
                                {category.name === 'WINE' && '🍷'}
                                {category.name === 'BEER' && '🍺'}
                                {category.name === 'SPIRITS' && '🥃'}
                                {category.name === 'VAPE' && '💨'}
                                {category.name === 'NICOTINEPADS' && '📱'}
                                {!['WINE', 'BEER', 'SPIRITS', 'VAPE', 'NICOTINEPADS'].includes(category.name) && '📦'}
                              </span>
                            </div>
                          )}
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

            {/* Language Switcher */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Change language"
                aria-expanded={isLanguageMenuOpen}
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[70] border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setCurrentLanguage('is');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === 'is'
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🇮🇸</span>
                      Íslenska
                      {currentLanguage === 'is' && <span className="ml-auto">✓</span>}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLanguage('en');
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === 'en'
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🇬🇧</span>
                      English
                      {currentLanguage === 'en' && <span className="ml-auto">✓</span>}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin Mega Menu (Cogwheel) */}
            {isAuthenticated && isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('navigation.admin')}
                  aria-expanded={isAdminMenuOpen}
                  aria-haspopup="true"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Admin Mega Menu - Centered on Viewport */}
                {isAdminMenuOpen && (
                <div className="fixed top-[4rem] left-1/2 transform -translate-x-1/2 w-[1200px] max-w-[95vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[999] overflow-hidden transition-all duration-300">
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
                        <LayoutDashboard className="w-5 h-5 inline mr-2" />
                        {t('adminDashboard.dashboard')}
                      </Link>
                    </div>
                  </div>

                  {/* Admin Pages Grid - 4 Columns */}
                  <div className="p-8">
                    <div className="grid grid-cols-4 gap-6">
                      {/* Column 1: Sales & Orders */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                          {t('adminSidebar.sales')}
                        </h4>
                        <Link
                          to="/admin/orders"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.orders')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/pos"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Calculator className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.pos')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/delivery"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.delivery')}
                            </h5>
                          </div>
                        </Link>

                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                            {t('adminSidebar.catalog')}
                          </h4>
                        </div>
                        <Link
                          to="/admin/products"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.products')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/categories"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.categories')}
                            </h5>
                          </div>
                        </Link>
                      </div>

                      {/* Column 2: Content & Communication */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                          {t('adminSidebar.content')}
                        </h4>
                        <Link
                          to="/admin/media"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <FileImage className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.media')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/banners"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Image className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.banners')}
                            </h5>
                          </div>
                        </Link>

                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                            {t('adminSidebar.customersAndCommunication')}
                          </h4>
                        </div>
                        <Link
                          to="/admin/customers"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.customers')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/chat"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.chat')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/notifications"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Bell className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.notifications')}
                            </h5>
                          </div>
                        </Link>
                      </div>

                      {/* Column 3: Analytics */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                          {t('adminSidebar.analytics')}
                        </h4>
                        <Link
                          to="/admin/analytics"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.analytics')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/reports"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.reports')}
                            </h5>
                          </div>
                        </Link>
                      </div>

                      {/* Column 4: Settings & System */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                          {t('adminSidebar.settings')}
                        </h4>
                        <Link
                          to="/admin/settings/general"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Settings className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminSettings.general')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/settings/shipping"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Truck className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminSettings.shipping')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/settings/payment-gateways"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminSettings.paymentGateways')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/settings/receipts"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Receipt className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminSettings.receipts')}
                            </h5>
                          </div>
                        </Link>

                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wide">
                            {t('adminSidebar.system')}
                          </h4>
                        </div>
                        <Link
                          to="/admin/translations"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Languages className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.translations')}
                            </h5>
                          </div>
                        </Link>
                        <Link
                          to="/admin/demo-data"
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex-shrink-0">
                            <Play className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {t('adminNavigation.demoData')}
                            </h5>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('adminDashboard.quickAccess')} <Link to="/admin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{t('adminDashboard.dashboard')}</Link>
                      </p>
                    </div>
                  </div>
                </div>
                )}
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

