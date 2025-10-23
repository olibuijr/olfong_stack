import { CreditCard, Plus } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";

const PaymentGatewayEmptyState = ({ onAddGateway }) => {
  const { t } = useLanguage();

  return (
    <div className="text-center py-12">
      <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {t('adminSettings.noPaymentGateways')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {t('adminSettings.noPaymentGatewaysDescription')}
      </p>
      <button
        onClick={onAddGateway}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('adminSettings.addFirstPaymentGateway')}
      </button>
    </div>
  );
};

export default PaymentGatewayEmptyState;