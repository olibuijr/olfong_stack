

import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import OrderDetails from './OrderDetails';
import EmptyState from './EmptyState';

const ChatArea = ({
  currentConversation,
  messages,
  newMessage,
  setNewMessage,
  isLoading,
  otherUserTyping,
  onSendMessage,
  onTyping,
  onKeyPress,
  onUpdateStatus
}) => {


  if (!currentConversation) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full rounded-r-lg">
      {/* Chat Header */}
      <ChatHeader
        conversation={currentConversation}
        otherUserTyping={otherUserTyping}
        onUpdateStatus={onUpdateStatus}
      />

      {/* Order Details */}
      <OrderDetails conversation={currentConversation} />

      {/* Messages */}
      <MessagesList
        messages={messages}
        isLoading={isLoading}
      />

      {/* Input */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        currentConversation={currentConversation}
      />
    </div>
  );
};

export default ChatArea;
