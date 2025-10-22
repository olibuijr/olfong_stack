import { TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';
import { useLanguage } from "../../../contexts/LanguageContext";

const StatCard = ({ title, value, growth, icon: Icon, color = 'blue' }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-1 sm:p-1.5 lg:p-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2 truncate">{value}</p>
          <div className="flex items-center mt-2 sm:mt-3">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">+{growth}%</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">{t('adminDashboard', 'vsLastMonth')}</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 sm:hidden">{t('adminDashboard', 'vsLastMonthShort')}</span>
          </div>
        </div>
        <div className={`p-1 sm:p-1.5 lg:p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 ml-2 sm:ml-3 flex-shrink-0`}>
          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  growth: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string
};

export default StatCard;