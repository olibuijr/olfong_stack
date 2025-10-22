import { CreditCard, Wifi } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";
import PropTypes from 'prop-types';

const PaymentGatewayCard = ({ 
  gateway, 
  onToggle, 
  onTest, 
  onEdit 
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {gateway.displayName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {gateway.provider}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onTest(gateway.id)}
            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
            title={t('adminSettings', 'testConnection')}
          >
            <Wifi className="h-4 w-4" />
          </button>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gateway.isEnabled}
              onChange={(e) => onToggle(gateway.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {gateway.description}
      </p>

      {/* Environment and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${gateway.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {gateway.isEnabled ? t('adminSettings', 'enabled') : t('adminSettings', 'disabled')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {gateway.environment}
          </div>
        </div>
      </div>

      {/* Supported Methods */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {gateway.supportedMethods?.slice(0, 4).map((method) => (
            <span
              key={method}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              {method}
            </span>
          ))}
          {gateway.supportedMethods?.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
              +{gateway.supportedMethods.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => onEdit(gateway)}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
        >
          {t('adminSettings', 'edit')}
        </button>
      </div>
    </div>
  );
};

PaymentGatewayCard.propTypes = {
  gateway: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    description: PropTypes.string,
    isEnabled: PropTypes.bool.isRequired,
    environment: PropTypes.string.isRequired,
    supportedMethods: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onTest: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default PaymentGatewayCard;