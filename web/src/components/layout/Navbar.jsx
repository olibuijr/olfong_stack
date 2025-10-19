import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ShoppingCart, User, Globe, Settings, Search, Package } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/productSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import api from '../../services/api';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

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

  const cartItemCount = cart?.items?.length || 0;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'is' ? 'en' : 'is';
    i18n.changeLanguage(newLang);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50" role="navigation" aria-label={t('aria.mainNavigation')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="Ölföng homepage">
            <img 
              src="/logo_black-web.webp" 
              alt="Ölföng Logo" 
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
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
                                  src={`http://localhost:5000${product.imageUrl}`}
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
                                  {i18n.language === 'is' ? product.nameIs || product.name : product.name}
                                </h4>
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0">
                                  {product.price.toLocaleString()} {t('common.currency')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {i18n.language === 'is' ? product.descriptionIs || product.description : product.description}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                  {i18n.language === 'is' ? product.category?.nameIs || 'Flokkur' : product.category?.name || 'Category'}
                                </span>
                                {product.alcoholContent && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.alcoholContent}% ABV
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
                          {t('search.viewAllResults')} "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : searchQuery.trim() && !isSearching ? (
                    <div className="px-4 py-6 text-center">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('search.noResults')} "{searchQuery}"
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
            <div className="relative group">
              <button className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                {t('navigation.shop')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Mega Menu - Wider & Shorter */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[1200px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                {/* Compact Header */}
                <div className="px-6 py-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('navigation.shop')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('navigation.discoverCategories')}
                      </p>
                    </div>
                    <Link
                      to="/products"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      {t('navigation.viewAllProducts')}
                    </Link>
                  </div>
                </div>

                {/* Categories Grid - More Compact */}
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {categories.filter(category => category.isActive).map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.name}`}
                        className="group block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-md transition-all duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                      >
                        {/* Compact Category Header */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={`http://localhost:5000${category.imageUrl}`}
                                alt={category.name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span className="text-lg">
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
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm truncate">
                              {i18n.language === 'is' ? category.nameIs : category.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{category._count?.products || 0} {t('common.itemsLabel', 'items')}</span>
                              {category.subcategories && category.subcategories.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{category.subcategories.length} {t('adminCategories.subcategories', 'subcategories').toLowerCase()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Compact Description */}
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                          {i18n.language === 'is' ? category.descriptionIs || category.description : category.description || 'Browse our selection of products'}
                        </p>

                        {/* Subcategories - Horizontal Layout */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.slice(0, 4).map((subcategory) => (
                              <span
                                key={subcategory.id}
                                className="inline-block px-2 py-1 text-xs bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                              >
                                {i18n.language === 'is' ? subcategory.nameIs || subcategory.name : subcategory.name}
                              </span>
                            ))}
                            {category.subcategories.length > 4 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                +{category.subcategories.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Compact Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('navigation.needHelp')} <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">{t('navigation.contactUs')}</a>
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

            {/* Admin Menu (Cogwheel) */}
            {isAuthenticated && isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('navigation.admin')}
                  aria-expanded={isAdminMenuOpen}
                  aria-haspopup="true"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {isAdminMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {t('navigation.admin')}
                    </Link>
                    <Link
                      to="/admin/products"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {t('navigation.products')}
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {t('navigation.orders')}
                    </Link>
                    <Link
                      to="/admin/customers"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {t('navigation.customers')}
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {t('navigation.settings')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
              aria-label={t('aria.changeLanguage')}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{i18n.language.toUpperCase()}</span>
            </button>

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
              <div className="relative">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" role="menu" aria-label={t('aria.userMenu')}>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {t('navigation.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
          <div className="fixed inset-0 z-50 md:hidden">
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
                        {i18n.language === 'is' ? category.nameIs : category.name}
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

