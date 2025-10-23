import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from "../../contexts/LanguageContext";
import { useSelector } from 'react-redux';
import { Home, Package, ShoppingCart, User } from 'lucide-react';

const BottomNav = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const cartItemCount = cart?.items?.length || 0;

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: t('navigation.home'),
      active: location.pathname === '/',
    },
    {
      to: '/products',
      icon: Package,
      label: t('navigation.products'),
      active: location.pathname === '/products' || location.pathname.startsWith('/products/'),
    },
    ...(isAuthenticated ? [{
      to: '/cart',
      icon: ShoppingCart,
      label: t('navigation.cart'),
      active: location.pathname === '/cart',
      badge: cartItemCount > 0 ? cartItemCount : null,
    }] : []),
    ...(isAuthenticated ? [{
      to: '/profile',
      icon: User,
      label: t('navigation.profile'),
      active: location.pathname === '/profile',
    }] : [{
      to: '/login',
      icon: User,
      label: t('navigation.login'),
      active: location.pathname === '/login',
    }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs transition-colors min-h-[44px] ${
                item.active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;