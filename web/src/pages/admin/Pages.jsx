import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  togglePageVisibility,
  clearError,
} from '../../store/slices/pagesSlice';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import PageModal from '../../components/admin/PageModal';

const Pages = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { pages, isLoading, error } = useSelector((state) => state.pages);

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch pages on mount and when filters change
  useEffect(() => {
    dispatch(fetchPages({ search: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Filtered and sorted pages
  const filteredPages = pages.sort((a, b) => {
    const aOrder = a.sortOrder || 0;
    const bOrder = b.sortOrder || 0;
    return sortOrder === 'asc' ? aOrder - bOrder : bOrder - aOrder;
  });

  const handleCreate = () => {
    setEditingPage(null);
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setShowModal(true);
  };

  const handleDeleteClick = (page) => {
    if (window.confirm(t('adminPages.deleteConfirm'))) {
      dispatch(deletePage(page.id))
        .unwrap()
        .then(() => {
          toast.success(t('adminPages.pageDeleted'));
        })
        .catch((error) => {
          toast.error(error || t('common.errorOccurred'));
        });
    }
  };

  const handleToggleVisibility = (page) => {
    dispatch(togglePageVisibility(page.id))
      .unwrap()
      .then(() => {
        toast.success(t('common.updated'));
      })
      .catch((error) => {
        toast.error(error || t('common.errorOccurred'));
      });
  };

  const handleDuplicate = async (page) => {
    try {
      const newPageData = {
        title: `${page.title} (Copy)`,
        titleIs: `${page.titleIs} (Afrit)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        content: page.content,
        contentIs: page.contentIs,
        status: 'DRAFT',
        isVisible: false,
        sortOrder: page.sortOrder + 1,
        metaTitle: page.metaTitle,
        metaTitleIs: page.metaTitleIs,
        metaDescription: page.metaDescription,
        metaDescriptionIs: page.metaDescriptionIs,
        canonicalUrl: page.canonicalUrl,
        featuredImageId: page.featuredImage?.id || null,
      };

      await dispatch(createPage(newPageData)).unwrap();
      toast.success(t('common.duplicated'));
    } catch (error) {
      toast.error(error || t('common.errorOccurred'));
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingPage) {
        await dispatch(updatePage({ id: editingPage.id, ...formData })).unwrap();
        toast.success(t('common.updated'));
      } else {
        await dispatch(createPage(formData)).unwrap();
        toast.success(t('common.created'));
      }
    } catch (error) {
      toast.error(error || t('common.errorOccurred'));
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const isPublished = status === 'PUBLISHED';
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPublished
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
        }`}
      >
        {isPublished ? t('adminPages.status.published') : t('adminPages.status.draft')}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <PageHeader
        icon={Plus}
        title={t('adminPages.title')}
        description={t('adminPages.subtitle')}
        actions={
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            {t('adminPages.createPage')}
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('common.allStatuses')}</option>
            <option value="DRAFT">{t('adminPages.status.draft')}</option>
            <option value="PUBLISHED">{t('adminPages.status.published')}</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="asc">{t('common.sortAsc')}</option>
            <option value="desc">{t('common.sortDesc')}</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.slug')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.visibility')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.order')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.updatedAt')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {t('adminPages.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {page.title}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {page.titleIs}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                        {page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(page.status)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          page.isVisible
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {page.isVisible
                          ? t('adminPages.visibility.visible')
                          : t('adminPages.visibility.hidden')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-400">{page.sortOrder}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(page.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                          title={t('common.edit')}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(page)}
                          className={`p-2 rounded transition ${
                            page.isVisible
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          title={
                            page.isVisible
                              ? t('common.hide')
                              : t('common.show')
                          }
                        >
                          {page.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleDuplicate(page)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          title={t('common.duplicate')}
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(page)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          title={t('common.delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Page Modal */}
      <PageModal
        isOpen={showModal}
        editingPage={editingPage}
        onClose={() => {
          setShowModal(false);
          setEditingPage(null);
        }}
        onSubmit={handleModalSubmit}
      />
    </AdminLayout>
  );
};

export default Pages;
