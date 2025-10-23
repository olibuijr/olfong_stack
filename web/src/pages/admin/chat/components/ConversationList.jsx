import { useLanguage } from "../../../../contexts/LanguageContext";
import { MessageCircle } from 'lucide-react';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ConversationItem from './ConversationItem';

const ConversationList = ({
  isLoading,
  selectedConversation,
  onSelectConversation,
  filteredConversations
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t('adminChat.noConversations')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversation?.id === conversation.id}
          onSelect={() => onSelectConversation(conversation)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
