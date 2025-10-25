import { useLanguage } from "../../../contexts/LanguageContext";
import PropTypes from 'prop-types';
import { getStatusIcon, getStatusLabel } from './utils';

const OrderStatusChart = ({ orderStatusCounts }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          {t('adminDashboard.orderStatus')}
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(orderStatusCounts).map(([status, count]) => {
            const StatusIcon = getStatusIcon(status);
            const total = Object.values(orderStatusCounts).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={status} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
                <div className="flex items-center min-w-0">
                  <StatusIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                    {getStatusLabel(status, t)}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-8 text-right flex-shrink-0">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

OrderStatusChart.propTypes = {
  orderStatusCounts: PropTypes.objectOf(PropTypes.number).isRequired
};

export default OrderStatusChart;