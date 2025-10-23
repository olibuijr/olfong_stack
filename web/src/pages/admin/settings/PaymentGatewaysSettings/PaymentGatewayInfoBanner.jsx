import { useLanguage } from "../../../../contexts/LanguageContext";

const PaymentGatewayInfoBanner = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.paymentGatewayConfiguration')}</p>
            <p>{t('adminSettings.paymentGatewayDescription')}</p>
          </div>
        </div>
      </div>

    </>
  );
};

export default PaymentGatewayInfoBanner;