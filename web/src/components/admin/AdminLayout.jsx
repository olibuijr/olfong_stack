import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main container with sidebar and content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 lg:relative lg:inset-0 flex-shrink-0 lg:sticky lg:top-0">
          <div className="m-4 lg:m-0 lg:mr-4 lg:mt-4 lg:mb-4">
            <AdminSidebar />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
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
    </div>
  );
};

export default AdminLayout;
