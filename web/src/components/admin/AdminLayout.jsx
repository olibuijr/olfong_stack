import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children, showSidebar = true }) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!showSidebar) {
    // Simple layout without sidebar
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('navigation.menu')}</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <AdminSidebar isMobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar - positioned on the left with proper alignment */}
      <div className="hidden lg:flex lg:flex-1">
        {/* Sidebar */}
        <div className="fixed top-16 bottom-0 left-0 z-50 flex-shrink-0">
          <div className="m-4 lg:m-0 lg:mt-0 lg:mb-0 lg:pt-6" style={{height: 'calc(100vh - 4rem)'}}>
            <AdminSidebar />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex-1 flex flex-col min-w-0">
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mx-4 mt-4 mb-2 px-4 py-3">
          <button
            type="button"
            className="text-gray-700 dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">{t('adminLayout.openSidebar')}</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
