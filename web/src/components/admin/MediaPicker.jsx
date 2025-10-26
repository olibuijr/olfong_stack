import { useState, useEffect } from 'react';

import {
  X,
  Search,
  Image as ImageIcon,
  Upload,
  Check,
  Loader,
  Grid,
  List
} from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const MediaPicker = ({
  isOpen,
  onClose,
  onSelect,
  collection = 'PRODUCTS',
  selectedMedia = null,
  multiple = false
}) => {
  const { t } = useLanguage();


  // State
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(collection);
  const [selectedItems, setSelectedItems] = useState(
    multiple ? (selectedMedia || []) : (selectedMedia ? [selectedMedia] : [])
  );
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Collections
  const collections = [
    { id: 'PRODUCTS', name: t('adminMedia.products'), icon: '🛍️' },
    { id: 'CATEGORIES', name: t('adminMedia.categories'), icon: '📁' },
    { id: 'BANNERS', name: t('adminMedia.banners'), icon: '📢' },
    { id: 'PROFILE', name: t('adminMedia.profile'), icon: '👤' },
    { id: 'DOCUMENTS', name: t('adminMedia.documents'), icon: '📄' },
    { id: 'VIDEOS', name: t('adminMedia.videos'), icon: '🎥' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedCollection, pagination.page, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCollection(collection);
      setSelectedItems(
        multiple ? (selectedMedia || []) : (selectedMedia ? [selectedMedia] : [])
      );
    }
  }, [isOpen, collection, selectedMedia, multiple]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const loadMedia = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (multiple) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      if (isSelected) {
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onSelect(selectedItems);
    } else {
      onSelect(selectedItems[0] || null);
    }
    onClose();
  };

  const handleUploadRedirect = () => {
    window.open(`/admin/media/upload?collection=${selectedCollection}`, '_blank');
  };

  const isSelected = (item) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('adminMedia.selectMedia')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {multiple
                ? t('adminMedia.selectMultipleMedia')
                : t('adminMedia.selectSingleMedia')
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collection Tabs */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setSelectedCollection(col.id);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCollection === col.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{col.icon}</span>
                {col.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('adminMedia.searchMedia')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>

              <button
                onClick={handleUploadRedirect}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('adminMedia.upload')}
              </button>
            </div>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('adminMedia.noMediaFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('adminMedia.noMediaInCollection')}
              </p>
              <button
                onClick={handleUploadRedirect}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('adminMedia.uploadFirstMedia')}
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected(item)
                          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-xs">{item.mimeType.split('/')[1].toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      {isSelected(item) && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                          <p className="text-sm font-medium truncate px-2">
                            {item.originalName}
                          </p>
                          <p className="text-xs">
                            {formatFileSize(item.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected(item)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0 mr-4">
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.originalName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(item.size)} • {item.mimeType}
                        </p>
                      </div>

                      {isSelected(item) && (
                        <div className="ml-4">
                          <Check className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('adminMedia.previous')}
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {t('adminMedia.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.length > 0 && (
              <span>
                {multiple
                  ? `${selectedItems.length} ${t('adminMedia.itemsSelected')}`
                  : `${selectedItems.length} ${t('adminMedia.itemSelected')}`
                }
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('adminMedia.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiple ? t('adminMedia.selectItems') : t('adminMedia.selectItem')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPicker;