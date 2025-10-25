import { useState } from 'react';
import PropTypes from 'prop-types';
import AdminSidebar from './AdminSidebar';
import { useLanguage } from "../../contexts/LanguageContext";

const AdminLayout = ({ children, showSidebar = true }) => {
  const { t } = useLanguage();

  // Initialize sidebar collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Handle sidebar collapse state changes
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

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
      {/* Desktop sidebar - positioned on the left with proper alignment */}
      <div className="hidden lg:flex lg:flex-1">
        {/* Sidebar */}
        <div className="fixed top-16 bottom-0 left-0 z-10 flex-shrink-0">
          <div className="m-4 lg:m-0 lg:mt-0 lg:mb-0 lg:pt-6" style={{height: 'calc(100vh - 4rem)'}}>
            <AdminSidebar onCollapseChange={handleSidebarCollapse} />
          </div>
        </div>

        {/* Main content area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
          }`}
        >
          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex-1 flex flex-col min-w-0">
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool
};

export default AdminLayout;
