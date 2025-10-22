import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
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
  MessageCircle,
  Play,
  Building,
  Truck,
  Key,
  CreditCard,
  Languages,
  Receipt,
  Mail,
  Calculator,
  Image,
  FileImage
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useLanguage } from "../../contexts/LanguageContext";
import useUnreadCount from '../../hooks/useUnreadCount';

const AdminSidebar = ({ isMobile = false, onCollapseChange }) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage, default to false (expanded)
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const location = useLocation();
  const dispatch = useDispatch();
  const { unreadCount } = useUnreadCount();

  // Notify parent of initial collapsed state
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]); // Include dependencies

  // Save collapsed state to localStorage whenever it changes
  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newValue));
      // Notify parent component of state change
      if (onCollapseChange) {
        onCollapseChange(newValue);
      }
      return newValue;
    });
  };

  const navigationSections = [
    {
      title: t('adminSidebar', 'overview'),
      items: [
        { name: t('adminNavigation', 'dashboard'), href: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: t('adminSidebar', 'productManagement'),
      items: [
        { name: t('adminNavigation', 'products'), href: '/admin/products', icon: Package },
        { name: t('adminNavigation', 'categories'), href: '/admin/categories', icon: FolderOpen }
      ]
    },
    {
      title: t('adminSidebar', 'orderManagement'),
      items: [
        { name: t('adminNavigation', 'orders'), href: '/admin/orders', icon: ShoppingCart },
        { name: t('adminNavigation', 'pos'), href: '/admin/pos', icon: Calculator },
        { name: t('adminNavigation', 'customers'), href: '/admin/customers', icon: Users }
      ]
    },
    {
      title: t('adminSidebar', 'communication'),
      items: [
        { 
          name: t('adminNavigation', 'chat'), 
          href: '/admin/chat', 
          icon: MessageCircle,
          unreadCount: unreadCount
        }
      ]
    },
    {
      title: t('adminSidebar', 'analyticsReports'),
      items: [
        { name: t('adminNavigation', 'analytics'), href: '/admin/analytics', icon: BarChart3 },
        { name: t('adminNavigation', 'reports'), href: '/admin/reports', icon: FileText }
      ]
    },
      {
        title: t('adminSidebar', 'system'),
        items: [
           { name: t('adminNavigation', 'media'), href: '/admin/media', icon: FileImage },
          { name: t('adminNavigation', 'banners'), href: '/admin/banners', icon: Image },
          { name: t('adminNavigation', 'demoData'), href: '/admin/demo-data', icon: Play },
          { name: t('adminNavigation', 'notifications'), href: '/admin/notifications', icon: Bell },
          {
            name: t('adminNavigation', 'translations'),
            href: '/admin/translations',
            icon: Languages
          },
         {
           name: t('adminSettings', 'general'),
           href: '/admin/settings/general',
           icon: Settings
         },
         {
           name: t('adminSettings', 'business'),
           href: '/admin/settings/business',
           icon: Building
         },
         {
           name: t('adminSettings', 'shipping'),
           href: '/admin/settings/shipping',
           icon: Truck
         },
         {
           name: t('adminSettings', 'apiKeys'),
           href: '/admin/settings/api-keys',
           icon: Key
         },
        {
          name: t('adminSettings', 'paymentGateways'),
          href: '/admin/settings/payment-gateways',
          icon: CreditCard
        },
        {
          name: t('adminSettings', 'receipts'),
          href: '/admin/settings/receipts',
          icon: Receipt
        },
        {
          name: t('adminSettings', 'smtp'),
          href: '/admin/settings/smtp',
          icon: Mail
        }
       ]
     }
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
    <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isMobile ? 'w-full h-full' : 'rounded-r-lg shadow-sm border border-gray-200 dark:border-gray-700'} transition-all duration-300 ease-in-out ${isMobile ? 'w-full h-full' : (isCollapsed ? 'w-16' : 'w-56')} h-full flex flex-col overflow-hidden`}>
      {/* Toggle Button - Top (hidden on mobile) */}
      {!isMobile && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-3">
          <div className="flex justify-end">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <div className="transition-transform duration-300 ease-in-out">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-2">
        {navigationSections.map((section, sectionIndex) => (
           <div key={section.title} className="space-y-0.5">
             {/* Section Header */}
             <div className={`px-2 py-1 transition-all duration-300 ease-in-out ${
               isCollapsed && !isMobile ? 'opacity-0 h-0 py-0 overflow-hidden' : 'opacity-100 h-auto'
             }`}>
               <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                 {section.title}
               </h3>
             </div>

             {/* Section Items */}
             <div className="space-y-0">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                   <Link
                     key={item.name}
                     to={item.href}
                      className={`relative flex items-center px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out group ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                     title={isCollapsed ? item.name : undefined}
                   >
                      <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                        isCollapsed && !isMobile ? 'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'flex-shrink-0'
                      }`} />
                     <div className={`flex items-center justify-between flex-1 transition-all duration-300 ease-in-out ${
                       isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto ml-2.5'
                     }`}>
                       <span className="text-sm whitespace-nowrap transition-all duration-200">{item.name}</span>
                       {item.unreadCount > 0 && (
                         <span className={`ml-2 px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                           active
                             ? 'bg-blue-500 text-white'
                             : 'bg-red-500 text-white'
                         }`}>
                           {item.unreadCount}
                         </span>
                       )}
                     </div>
                     {isCollapsed && !isMobile && item.unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-200 animate-pulse">
                         {item.unreadCount}
                       </span>
                     )}
                  </Link>
                );
              })}
            </div>

            {/* Section Separator (except for last section) */}
            {sectionIndex < navigationSections.length - 1 && (
              <div className="px-2">
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              </div>
            )}
          </div>
        ))}
      </nav>

        {/* User Info & Logout - Bottom */}
       <div className={`border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-1.5 transition-all duration-300 ease-in-out ${isMobile ? 'p-3' : 'px-3 pt-3 pb-3'}`}>
         {/* User Info */}
         <div className="flex items-center p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 ease-in-out">
           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105">
             <span className="text-white text-sm font-medium transition-colors duration-200">A</span>
           </div>
           <div className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${
             isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-3'
           }`}>
             <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">{t('adminNavigation', 'adminUser')}</p>
             <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-200">{t('adminSidebar', 'adminEmail')}</p>
           </div>
         </div>

         {/* Logout */}
         <button
           onClick={handleLogout}
            className={`flex items-center w-full px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
              isCollapsed && !isMobile ? 'justify-center px-2' : ''
            }`}
           title={isCollapsed && !isMobile ? t('adminNavigation', 'logout') : undefined}
         >
           <LogOut className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
           <span className={`transition-all duration-300 ease-in-out ${
             isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-3'
           }`}>
            {t('adminNavigation', 'logout')}
          </span>
         </button>
      </div>
    </div>
  );
};

AdminSidebar.propTypes = {
  isMobile: PropTypes.bool,
  onCollapseChange: PropTypes.func
};

export default AdminSidebar;
