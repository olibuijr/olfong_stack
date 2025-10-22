import { ArrowLeft } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';

const PaymentGatewayHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/settings"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('adminSettings', 'paymentGateways')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('adminSettings', 'paymentGatewayDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayHeader;