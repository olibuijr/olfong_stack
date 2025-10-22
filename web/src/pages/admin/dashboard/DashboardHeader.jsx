import { useLanguage } from "../../../contexts/LanguageContext";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Filter, 
  Download, 
  Plus 
} from 'lucide-react';

const DashboardHeader = ({ user }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Package,
      label: t('adminDashboard', 'addProduct'),
      onClick: () => navigate('/admin/products'),
      className: 'flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 group'
    },
    {
      icon: Users,
      label: t('adminDashboard', 'manageUsers'),
      onClick: () => navigate('/admin/customers'),
      className: 'flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 group'
    },
    {
      icon: TrendingUp,
      label: t('adminDashboard', 'viewAnalytics'),
      onClick: () => navigate('/admin/analytics'),
      className: 'flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 group'
    },
    {
      icon: Filter,
      label: t('adminDashboard', 'reports'),
      onClick: () => navigate('/admin/reports'),
      className: 'flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 group'
    },
    {
      icon: Download,
      label: t('adminDashboard', 'export'),
      onClick: () => {
        // TODO: Implement export functionality
        alert(t('adminDashboard', 'export') + ' - Coming soon');
      },
      className: 'flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 group'
    },
    {
      icon: Plus,
      label: t('adminDashboard', 'newOrder'),
      onClick: () => navigate('/admin/orders'),
      className: 'flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-xl border border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-lg transition-all duration-300 group'
    }
  ];

  return (
    <div className="py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('adminDashboard', 'dashboardOverview')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            {t('adminDashboard', 'welcomeBack')} {user?.fullName || user?.username}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {quickActions.map((action, index) => (
            <button 
              key={index}
              onClick={action.onClick}
              className={action.className}
            >
              <action.icon className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {action.label}
              </span>
            </button>
        ))}
      </div>
    </div>
  );
};

DashboardHeader.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    username: PropTypes.string
  })
};

export default DashboardHeader;