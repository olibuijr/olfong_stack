import { useLanguage } from "../../../../contexts/LanguageContext";
import { ShoppingBag } from 'lucide-react';

const OrderDetails = ({ conversation }) => {
  const { t } = useLanguage();

  if (!conversation.metadata?.orderId) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-4">
      <div className="flex items-center space-x-2 mb-2">
        <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {t('adminChat', 'orderDetails')}
        </h3>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>{t('order', 'orderNumber')}:</strong> {conversation.metadata.orderNumber}</p>
        <p><strong>{t('chat.topics', 'topic')}:</strong> {conversation.metadata.topic}</p>
        {conversation.metadata.customTopic && (
          <p><strong>{t('chat', 'customTopic')}:</strong> {conversation.metadata.customTopic}</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
