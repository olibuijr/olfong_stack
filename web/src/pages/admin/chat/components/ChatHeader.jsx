import { useLanguage } from "../../../../contexts/LanguageContext";
import { ArrowLeft, User, ShoppingBag } from 'lucide-react';

const ChatHeader = ({
  conversation,
  otherUserTyping,
  onUpdateStatus
}) => {
  const { t } = useLanguage();

  const customer = conversation.participants.find(p => p.user.role === 'CUSTOMER')?.user;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile back button */}
          <button
            onClick={() => window.history.back()}
            className="sm:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {customer?.fullName || customer?.username || t('adminChat.unknownCustomer')}
            </h2>
            {conversation.metadata?.orderNumber && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {t('order.orderNumber')}: {conversation.metadata.orderNumber}
                </span>
              </div>
            )}
            {otherUserTyping && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">{t('adminChat.customerTyping')}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={conversation.status}
            onChange={(e) => onUpdateStatus(conversation.id, e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ACTIVE">{t('adminChat.active')}</option>
            <option value="ARCHIVED">{t('adminChat.archived')}</option>
            <option value="RESOLVED">{t('adminChat.resolved')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
