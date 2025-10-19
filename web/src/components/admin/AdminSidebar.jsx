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
  MessageCircle,
  Play
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ isMobile = false }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const navigationSections = [
    {
      title: t('adminSidebar.overview'),
      items: [
        { name: t('adminNavigation.dashboard'), href: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: t('adminSidebar.productManagement'),
      items: [
        { name: t('adminNavigation.products'), href: '/admin/products', icon: Package },
        { name: t('adminNavigation.categories'), href: '/admin/categories', icon: FolderOpen }
      ]
    },
    {
      title: t('adminSidebar.orderManagement'),
      items: [
        { name: t('adminNavigation.orders'), href: '/admin/orders', icon: ShoppingCart },
        { name: t('adminNavigation.customers'), href: '/admin/customers', icon: Users }
      ]
    },
    {
      title: t('adminSidebar.communication'),
      items: [
        { name: t('adminNavigation.chat'), href: '/admin/chat', icon: MessageCircle }
      ]
    },
    {
      title: t('adminSidebar.analyticsReports'),
      items: [
        { name: t('adminNavigation.analytics'), href: '/admin/analytics', icon: BarChart3 },
        { name: t('adminNavigation.reports'), href: '/admin/reports', icon: FileText }
      ]
    },
    {
      title: t('adminSidebar.system'),
      items: [
        { name: t('adminNavigation.demoData'), href: '/admin/demo-data', icon: Play },
        { name: t('adminNavigation.notifications'), href: '/admin/notifications', icon: Bell },
        { name: t('adminNavigation.settings'), href: '/admin/settings', icon: Settings }
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
    <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isMobile ? 'w-full h-full' : 'rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'} transition-all duration-300 ${isMobile ? 'w-full h-full' : (isCollapsed ? 'w-16' : 'w-64')} h-full flex flex-col`}>
      {/* Toggle Button - Top (hidden on mobile) */}
      {!isMobile && (
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
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-3">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className="space-y-1">
            {/* Section Header */}
            {!isCollapsed && !isMobile && (
              <div className="px-2 py-1.5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                     className={`flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors group ${
                       active
                         ? 'bg-blue-600 text-white'
                         : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                     } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                     <Icon className={`h-4 w-4 ${isCollapsed && !isMobile ? '' : 'mr-2.5'} flex-shrink-0`} />
                     {(!isCollapsed || isMobile) && <span className="text-sm">{item.name}</span>}
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
       <div className={`border-t border-gray-200 dark:border-gray-700 mt-auto space-y-3 ${isMobile ? 'p-4' : 'px-4 pt-4 pb-0'}`}>
         {/* User Info */}
         {(!isCollapsed || isMobile) ? (
           <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
               <span className="text-white text-sm font-medium">A</span>
             </div>
             <div className="ml-3 min-w-0 flex-1">
               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t('adminNavigation.adminUser')}</p>
               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t('adminSidebar.adminEmail')}</p>
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
           className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors ${
             isCollapsed && !isMobile ? 'justify-center' : ''
           }`}
           title={isCollapsed && !isMobile ? t('adminNavigation.logout') : undefined}
         >
           <LogOut className={`h-4 w-4 ${isCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
           {(!isCollapsed || isMobile) && <span>{t('adminNavigation.logout')}</span>}
         </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
