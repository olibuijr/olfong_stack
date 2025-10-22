import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MediaGrid from '../../components/admin/MediaGrid';
import MediaList from '../../components/admin/MediaList';
import MediaFilters from '../../components/admin/MediaFilters';
import MediaEditor from '../../components/admin/MediaEditor';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const Media = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('PRODUCTS');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [, setShowUploadModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);

  // Helper functions for components
  const handleSelectItem = (itemId, isSelected) => {
    if (Array.isArray(itemId)) {
      // Bulk selection
      setSelectedItems(itemId);
    } else {
      // Single item selection
      if (isSelected) {
        setSelectedItems(prev => [...prev, itemId]);
      } else {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
      }
    }
  };

  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedItems([]);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleUploadClick = () => {
    window.open('/admin/media/upload', '_blank');
  };
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Collections
  const collections = [
    { id: 'PRODUCTS', name: t('adminMedia', 'products'), icon: '🛍️' },
    { id: 'CATEGORIES', name: t('adminMedia', 'categories'), icon: '📁' },
    { id: 'BANNERS', name: t('adminMedia', 'banners'), icon: '📢' },
    { id: 'PROFILE', name: t('adminMedia', 'profile'), icon: '👤' },
    { id: 'DOCUMENTS', name: t('adminMedia', 'documents'), icon: '📄' },
    { id: 'VIDEOS', name: t('adminMedia', 'videos'), icon: '🎥' }
  ];

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        collection: selectedCollection,
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/media?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(data.data.media);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to load media');
      }
    } catch (error) {
      console.error('Load media error:', error);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, pagination.page, pagination.limit, searchQuery]);

  const handleDelete = async (mediaId) => {
    if (!window.confirm(t('adminMedia', 'confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMedia(prev => prev.filter(item => item.id !== mediaId));
        toast.success('Media deleted successfully');
      } else {
        throw new Error('Failed to delete media');
      }
    } catch (error) {
      console.error('Delete media error:', error);
      toast.error('Failed to delete media');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    if (!window.confirm(t('adminMedia', 'confirmBulkDelete', { count: selectedItems.length }))) {
      return;
    }

    try {
      const response = await fetch('/api/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ids: selectedItems })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Deleted ${data.data.deletedCount} of ${selectedItems.length} items`);
        setSelectedItems([]);
        loadMedia(); // Reload the list
      } else {
        throw new Error('Failed to bulk delete media');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to bulk delete media');
    }
  };

  const handleEdit = (mediaItem) => {
    setEditingMedia(mediaItem);
    setShowEditModal(true);
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('adminLabels', 'accessDenied')}</h1>
            <p className="text-gray-700">You do not have permission to view this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('adminNavigation', 'media')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('adminMedia', 'manageMediaDescription')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open('/admin/media/upload', '_blank')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('adminMedia', 'uploadMedia')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <MediaFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedItems={selectedItems}
          onBulkDelete={handleBulkDelete}
          collections={collections.map(collection => ({
            ...collection,
            name: collection.name,
            // Add count for selected collection
            ...(selectedCollection === collection.id && { count: pagination.total })
          }))}
          selectedCollection={selectedCollection}
          onCollectionChange={handleCollectionChange}
          onUploadClick={handleUploadClick}
        />

        {/* Media Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('adminMedia', 'noMediaFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('adminMedia', 'noMediaDescription')}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('adminMedia', 'uploadFirstMedia')}
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <MediaGrid
                media={media}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ) : (
              <MediaList
                media={media}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t('adminMedia', 'showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('adminMedia', 'to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('adminMedia', 'of')} {pagination.total} {t('adminMedia', 'results')}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('adminMedia', 'previous')}
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('adminMedia', 'next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}



        {/* Edit Modal */}
        <MediaEditor
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMedia(null);
          }}
          media={editingMedia}
          onSave={(updatedMedia) => {
            setMedia(prev => prev.map(item =>
              item.id === updatedMedia.id ? updatedMedia : item
            ));
            setShowEditModal(false);
            setEditingMedia(null);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default Media;