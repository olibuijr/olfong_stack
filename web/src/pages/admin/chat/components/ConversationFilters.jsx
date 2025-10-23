import { useLanguage } from "../../../../contexts/LanguageContext";
import { Search } from 'lucide-react';

const ConversationFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('adminChat.searchConversations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('adminChat.allStatuses')}</option>
            <option value="ACTIVE">{t('adminChat.active')}</option>
            <option value="ARCHIVED">{t('adminChat.archived')}</option>
            <option value="RESOLVED">{t('adminChat.resolved')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ConversationFilters;
