import { useAdminSidebar } from "../../contexts/AdminSidebarContext";
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import AdminSidebar from './AdminSidebar';

const AdminSidebarWidget = () => {
  const { sidebarOpen, setSidebarOpen } = useAdminSidebar();
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();

  // Only show sidebar for admin users
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Mobile sidebar - slides in from right */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('navigation.menu')}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close sidebar"
            >
              <Menu className="w-6 h-6 rotate-45" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <AdminSidebar isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebarWidget;
