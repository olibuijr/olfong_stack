import { useLanguage } from "../../../../contexts/LanguageContext";
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatInput = ({
  newMessage,
  onSendMessage,
  onTyping,
  onKeyPress,
  isLoading,
  currentConversation
}) => {
  const { t } = useLanguage();

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-end space-x-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={onTyping}
            onKeyPress={onKeyPress}
            placeholder={currentConversation ? t('chat.typeMessage') : t('chat.initializing')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Smile className="h-5 w-5" />
        </button>
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || !currentConversation || isLoading}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
