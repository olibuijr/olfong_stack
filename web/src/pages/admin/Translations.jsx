import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  RefreshCw,
  Upload,
  BarChart3,
  Edit2,
  Trash2,
  Save,
  X,
  FileJson,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';

import AdminLayout from '../../components/admin/AdminLayout';
import translationService from '../../services/translationService';

const Translations = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  // Data state
  const [translationsIS, setTranslationsIS] = useState([]);
  const [translationsEN, setTranslationsEN] = useState([]);
  const [stats, setStats] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingKey, setEditingKey] = useState(null);
  const [editFormData, setEditFormData] = useState({ key: '', is: '', en: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(true);

  const itemsPerPage = 20;

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await translationService.getAllTranslationsMultiLang();
      if (response.success) {
        setTranslationsIS(response.data.is || []);
        setTranslationsEN(response.data.en || []);
      }
    } catch (err) {
      console.error('Error fetching translations:', err);
      toast.error(t('adminTranslations.errorFetching'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/translations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
    fetchStats();
  }, [fetchTranslations, fetchStats]);

  // Merge IS and EN translations by key
  const mergedTranslations = useMemo(() => {
    const merged = new Map();

    translationsIS.forEach(trans => {
      merged.set(trans.key, {
        key: trans.key,
        is: trans.value,
        isId: trans.id,
        en: '',
        enId: null
      });
    });

    translationsEN.forEach(trans => {
      const existing = merged.get(trans.key);
      if (existing) {
        existing.en = trans.value;
        existing.enId = trans.id;
      } else {
        merged.set(trans.key, {
          key: trans.key,
          is: '',
          isId: null,
          en: trans.value,
          enId: trans.id
        });
      }
    });

    return Array.from(merged.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [translationsIS, translationsEN]);

  // Filter and paginate
  const filteredTranslations = useMemo(() => {
    if (!searchQuery) return mergedTranslations;

    const query = searchQuery.toLowerCase();
    return mergedTranslations.filter(
      trans =>
        trans.key.toLowerCase().includes(query) ||
        trans.is.toLowerCase().includes(query) ||
        trans.en.toLowerCase().includes(query)
    );
  }, [mergedTranslations, searchQuery]);

  const paginatedTranslations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTranslations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTranslations, currentPage]);

  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage);

  // Edit handlers
  const handleEdit = (translation) => {
    setEditingKey(translation.key);
    setEditFormData({
      key: translation.key,
      is: translation.is,
      en: translation.en
    });
  };

  const handleSaveEdit = async () => {
    try {
      const updates = [];

      if (editFormData.is) {
        updates.push(
          translationService.upsertTranslation({ key: editFormData.key, value: editFormData.is, locale: 'is' })
        );
      }

      if (editFormData.en) {
        updates.push(
          translationService.upsertTranslation({ key: editFormData.key, value: editFormData.en, locale: 'en' })
        );
      }

      await Promise.all(updates);
      toast.success(t('adminTranslations.translationUpdated'));
      setEditingKey(null);
      fetchTranslations();
      fetchStats();
    } catch (err) {
      console.error('Error saving translation:', err);
      toast.error(t('adminTranslations.errorSaving'));
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditFormData({ key: '', is: '', en: '' });
  };

  const handleDelete = async (translation) => {
    if (!window.confirm(t('adminTranslations.confirmDelete'))) return;

    try {
      const deletes = [];
      if (translation.isId) deletes.push(translationService.deleteTranslation(translation.isId));
      if (translation.enId) deletes.push(translationService.deleteTranslation(translation.enId));

      await Promise.all(deletes);
      toast.success(t('adminTranslations.translationDeleted'));
      fetchTranslations();
      fetchStats();
    } catch (err) {
      console.error('Error deleting translation:', err);
      toast.error(t('adminTranslations.errorDeleting'));
    }
  };

  // Add new translation
  const handleAddNew = async (e) => {
    e.preventDefault();
    try {
      const adds = [];
      if (editFormData.is) {
        adds.push(translationService.createTranslation({ key: editFormData.key, value: editFormData.is, locale: 'is' }));
      }
      if (editFormData.en) {
        adds.push(translationService.createTranslation({ key: editFormData.key, value: editFormData.en, locale: 'en' }));
      }

      await Promise.all(adds);
      toast.success(t('adminTranslations.translationAdded'));
      setShowAddModal(false);
      setEditFormData({ key: '', is: '', en: '' });
      fetchTranslations();
      fetchStats();
    } catch (err) {
      console.error('Error adding translation:', err);
      toast.error(t('adminTranslations.errorSaving'));
    }
  };

  // Export
  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/translations/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('adminTranslations.exportSuccess'));
    } catch (err) {
      console.error('Error exporting:', err);
      toast.error(t('adminTranslations.exportError'));
    }
  };

  // Import
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const format = file.name.endsWith('.csv') ? 'csv' : 'json';
      const data = format === 'json' ? JSON.parse(text) : text;

      const response = await fetch('/api/translations/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data, format })
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      toast.success(`${t('adminTranslations.importSuccess')} (${result.data.imported})`);
      fetchTranslations();
      fetchStats();
    } catch (err) {
      console.error('Error importing:', err);
      toast.error(t('adminTranslations.importError'));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">{t('common.loading')}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminTranslations.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminTranslations.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowStatsPanel(!showStatsPanel)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span>{showStatsPanel ? t('adminTranslations.hideStats') : t('adminTranslations.showStats')}</span>
                </button>
                <button
                  onClick={fetchTranslations}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>{t('adminTranslations.refresh')}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    <span>{t('adminTranslations.exportJSON')}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  <span>{t('adminTranslations.exportCSV')}</span>
                </button>
                <label className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>{t('adminTranslations.import')}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setEditFormData({ key: '', is: '', en: '' });
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>{t('adminTranslations.addTranslation')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatsPanel && stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t('adminTranslations.statistics')}
                </h2>
                {statsLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('adminTranslations.totalEntries')}</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                    </div>
                    <Globe className="w-10 h-10 text-blue-400 dark:text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">{t('adminTranslations.icelandic')}</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.byLocale.is}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{stats.completeness.icelandic}%</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-400 dark:text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{t('adminTranslations.english')}</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.byLocale.en}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{stats.completeness.english}%</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-purple-400 dark:text-purple-600" />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 dark:text-amber-400">{t('adminTranslations.uniqueKeys')}</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.uniqueKeys}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">{stats.completeness.overall}% {t('adminTranslations.complete')}</p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-amber-400 dark:text-amber-600" />
                  </div>
                </div>
              </div>

              {(stats.missingTranslations.missingInEnglish > 0 || stats.missingTranslations.missingInIcelandic > 0) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">{t('adminTranslations.missingTranslations')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">{t('adminTranslations.missingInEnglish')}: <span className="font-bold">{stats.missingTranslations.missingInEnglish}</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">{t('adminTranslations.missingInIcelandic')}: <span className="font-bold">{stats.missingTranslations.missingInIcelandic}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('adminTranslations.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Translations Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                      {t('adminTranslations.key')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3">
                      {t('adminTranslations.icelandic')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3">
                      {t('adminTranslations.english')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                      {t('adminTranslations.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedTranslations.length > 0 ? (
                    paginatedTranslations.map((translation) => (
                      <tr key={translation.key} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {editingKey === translation.key ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editFormData.key}
                                disabled
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <textarea
                                value={editFormData.is}
                                onChange={(e) => setEditFormData({ ...editFormData, is: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                rows={2}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <textarea
                                value={editFormData.en}
                                onChange={(e) => setEditFormData({ ...editFormData, en: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                rows={2}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title={t('common.save')}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                  title={t('common.cancel')}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                              {translation.key}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {translation.is || <span className="text-red-500 italic">{t('adminTranslations.missing')}</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {translation.en || <span className="text-red-500 italic">{t('adminTranslations.missing')}</span>}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(translation)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title={t('common.edit')}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(translation)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title={t('common.delete')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('adminTranslations.noTranslationsFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  {t('common.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('common.to')}{' '}
                  {Math.min(currentPage * itemsPerPage, filteredTranslations.length)} {t('common.of')}{' '}
                  {filteredTranslations.length} {t('common.results')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Translation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('adminTranslations.addTranslation')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddNew} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminTranslations.key')} *
                  </label>
                  <input
                    type="text"
                    value={editFormData.key}
                    onChange={(e) => setEditFormData({ ...editFormData, key: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., common.greeting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminTranslations.icelandic')}
                  </label>
                  <textarea
                    value={editFormData.is}
                    onChange={(e) => setEditFormData({ ...editFormData, is: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Icelandic translation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminTranslations.english')}
                  </label>
                  <textarea
                    value={editFormData.en}
                    onChange={(e) => setEditFormData({ ...editFormData, en: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="English translation"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>{t('common.add')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Translations;
