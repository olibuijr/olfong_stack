import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  MessageCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const navigation = [
    { name: t('adminNavigation.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('adminNavigation.products'), href: '/admin/products', icon: Package },
    { name: t('adminNavigation.categories'), href: '/admin/categories', icon: FolderOpen },
    { name: t('adminNavigation.orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('adminNavigation.customers'), href: '/admin/customers', icon: Users },
    { name: t('adminNavigation.chat'), href: '/admin/chat', icon: MessageCircle },
    { name: t('adminNavigation.analytics'), href: '/admin/analytics', icon: BarChart3 },
    { name: t('adminNavigation.reports'), href: '/admin/reports', icon: FileText },
    { name: t('adminNavigation.notifications'), href: '/admin/notifications', icon: Bell },
    { name: t('adminNavigation.settings'), href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActive = (href) => {
    if (href === '/admin') {
      // For dashboard, only match exact path or if we're on the root admin path
      return location.pathname === href || location.pathname === '/admin/';
    }
    // For other pages, match exact path or if pathname starts with href + '/'
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col sticky top-0`}>
      {/* Toggle Button - Top */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout - Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 mt-auto space-y-3">
        {/* User Info */}
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('adminNavigation.adminUser')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('adminSidebar.adminEmail')}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? t('adminNavigation.logout') : undefined}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!isCollapsed && <span>{t('adminNavigation.logout')}</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
