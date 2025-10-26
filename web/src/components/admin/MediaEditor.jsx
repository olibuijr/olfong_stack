import { useState, useEffect } from 'react';

import {
  X,
  Save,
  Loader
} from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const MediaEditor = ({ isOpen, onClose, media, onSave }) => {
  const { t } = useLanguage();


  // State
  const [formData, setFormData] = useState({
    alt: '',
    caption: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (media && isOpen) {
      setFormData({
        alt: media.alt || '',
        caption: media.caption || '',
        description: media.description || ''
      });
    }
  }, [media, isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.data.media);
        onClose();
        toast.success('Media updated successfully');
      } else {
        throw new Error('Failed to update media');
      }
    } catch (error) {
      console.error('Update media error:', error);
      toast.error('Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('adminMedia.editMedia')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Media Preview */}
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {media.mimeType.startsWith('image/') ? (
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.alt || media.originalName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="text-sm">{media.mimeType.split('/')[1].toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Media Info */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {media.originalName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {media.mimeType} • {formatFileSize(media.size)}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminMedia.altText')}
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => handleChange('alt', e.target.value)}
                  placeholder={t('adminMedia.altTextPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminMedia.altTextDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminMedia.caption')}
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => handleChange('caption', e.target.value)}
                  placeholder={t('adminMedia.captionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminMedia.captionDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminMedia.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('adminMedia.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminMedia.descriptionDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('adminMedia.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {t('adminMedia.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('adminMedia.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default MediaEditor;