import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { Plus, Search, RefreshCw } from 'lucide-react';

import AdminLayout from '../../components/admin/AdminLayout';
import translationService from '../../services/translationService';
import TranslationEditor from '../../components/admin/TranslationEditor'; // This will also need simplification

const Translations = () => {
  const { t } = useLanguage();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await translationService.getAllTranslations();
      if (response.success) {
        setTranslations(response.data);
      } else {
        setError(response.error);
        toast.error(t('adminTranslations.errorFetching'));
      }
    } catch (err) {
      setError(err.message);
      toast.error(t('adminTranslations.errorFetching'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const filteredTranslations = useMemo(() => {
    let filtered = translations;
    if (searchQuery) {
      filtered = filtered.filter(
        (trans) =>
          trans.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trans.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [translations, searchQuery]);

  const paginatedTranslations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTranslations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTranslations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage);

  const handleAddTranslation = () => {
    setEditingTranslation(null);
    setIsEditorOpen(true);
  };

  const handleEditTranslation = (translation) => {
    setEditingTranslation(translation);
    setIsEditorOpen(true);
  };

  const handleDeleteTranslation = async (id) => {
    if (window.confirm(t('adminTranslations.confirmDelete'))) {
      try {
        await translationService.deleteTranslation(id);
        toast.success(t('adminTranslations.translationDeleted'));
        fetchTranslations();
      } catch (err) {
        toast.error(t('adminTranslations.errorDeleting'));
      }
    }
  };

  const handleSaveTranslation = async (formData) => {
    try {
      if (editingTranslation) {
        await translationService.updateTranslation(editingTranslation.id, formData.value);
        toast.success(t('adminTranslations.translationUpdated'));
      } else {
        await translationService.createTranslation(formData.key, formData.value);
        toast.success(t('adminTranslations.translationAdded'));
      }
      setIsEditorOpen(false);
      fetchTranslations();
    } catch (err) {
      toast.error(err.message || t('adminTranslations.errorSaving'));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg">{t('adminTranslations.loading')}</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600">{t('adminTranslations.error')}</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTranslations}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('adminTranslations.retry')}
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminTranslations.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminTranslations.subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchTranslations}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>{t('adminTranslations.refresh')}</span>
          </button>
          <button
            onClick={handleAddTranslation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>{t('adminTranslations.addTranslation')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('adminTranslations.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('adminTranslations.key')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('adminTranslations.value')} (is)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('adminTranslations.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {paginatedTranslations.length > 0 ? (
                paginatedTranslations.map((translation) => (
                  <tr key={translation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {translation.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {translation.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTranslation(translation)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteTranslation(translation.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('adminTranslations.noTranslationsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {t('common.showing')} <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>{' '}
                {t('common.to')} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTranslations.length)}</span>{' '}
                {t('common.of')} <span className="font-medium">{filteredTranslations.length}</span>{' '}
                {t('common.results')}
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          </nav>
        )}
      </div>

      {isEditorOpen && (
        <TranslationEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTranslation}
          translation={editingTranslation}
        />
      )}
    </AdminLayout>
  );
};

export default Translations;