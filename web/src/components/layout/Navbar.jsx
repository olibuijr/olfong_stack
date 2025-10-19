import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ShoppingCart, User, Globe, Settings } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/productSlice';
import DarkModeToggle from '../common/DarkModeToggle';

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

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50" role="navigation" aria-label={t('aria.mainNavigation')}>
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
            <div className="relative">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${e.target.value}`);
                  }
                }}
              />
              <button
                className="absolute right-2 top-2 text-gray-500 hover:text-primary-600"
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="search"]');
                  if (searchInput && searchInput.value) {
                    navigate(`/products?search=${searchInput.value}`);
                  }
                }}
              >
                🔍
              </button>
            </div>

            {/* All Products Link */}
            <Link
              to="/products"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t('productsPage.all')}
            </Link>

            {/* Categories Mega Menu */}
            <div className="relative group">
              <button className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                {t('navigation.categories')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.name}`}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">
                        {category.name === 'WINE' && '🍷'}
                        {category.name === 'BEER' && '🍺'}
                        {category.name === 'SPIRITS' && '🥃'}
                        {category.name === 'VAPE' && '💨'}
                        {category.name === 'NICOTINEPADS' && '📱'}
                        {!['WINE', 'BEER', 'SPIRITS', 'VAPE', 'NICOTINEPADS'].includes(category.name) && '📦'}
                      </span>
                      <div>
                        <div className="font-medium">{i18n.language === 'is' ? category.nameIs : category.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{category.description || 'Browse products'}</div>
                      </div>
                    </div>
                  </Link>
                ))}
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
                  <span className="hidden sm:block text-gray-900 dark:text-white">{user?.username}</span>
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

