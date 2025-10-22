import ConversationFilters from './ConversationFilters';
import ConversationList from './ConversationList';

const ConversationSidebar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  filteredConversations
}) => {
  return (
    <div className="w-full sm:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col h-full">
      {/* Filters */}
      <ConversationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Conversations List */}
      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        selectedConversation={selectedConversation}
        onSelectConversation={onSelectConversation}
        filteredConversations={filteredConversations}
      />
    </div>
  );
};

export default ConversationSidebar;
