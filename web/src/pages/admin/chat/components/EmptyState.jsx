import { useLanguage } from "../../../../contexts/LanguageContext";
import { MessageCircle } from 'lucide-react';

const EmptyState = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('adminChat', 'selectConversation')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('adminChat', 'selectConversationMessage')}</p>
      </div>
    </div>
  );
};

export default EmptyState;
