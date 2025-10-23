import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Upload,
  X,
  Image as ImageIcon,
  File,
  Video,
  AlertTriangle,
  CheckCircle,
  Loader,
  Plus
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const MediaUpload = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  // State
  const [selectedCollection, setSelectedCollection] = useState('PRODUCTS');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [altTexts, setAltTexts] = useState({});
  const [captions, setCaptions] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [previews, setPreviews] = useState({});

  // Collections
  const collections = [
    { id: 'PRODUCTS', name: t('adminMedia.products'), icon: '🛍️', accept: 'image/*' },
    { id: 'CATEGORIES', name: t('adminMedia.categories'), icon: '📁', accept: 'image/*' },
    { id: 'BANNERS', name: t('adminMedia.banners'), icon: '📢', accept: 'image/*' },
    { id: 'PROFILE', name: t('adminMedia.profile'), icon: '👤', accept: 'image/*' },
    { id: 'DOCUMENTS', name: t('adminMedia.documents'), icon: '📄', accept: '.pdf,.doc,.docx' },
    { id: 'VIDEOS', name: t('adminMedia.videos'), icon: '🎥', accept: 'video/*' }
  ];

  const currentCollection = collections.find(c => c.id === selectedCollection);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);

    // Validate files
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      // Check file size
      const maxSize = getMaxFileSize(selectedCollection);
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`);
        return;
      }

      // Check file type
      if (!isValidFileType(file, selectedCollection)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      
      // Generate previews for image files
      validFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews(prev => ({
              ...prev,
              [file.name + file.size]: e.target.result
            }));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, [selectedCollection]);

  // Handle drag and drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFileSelect({ target: { files: droppedFiles } });
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Remove file
const removeFile = (index) => {
    const fileToRemove = files[index];
    const previewKey = fileToRemove.name + fileToRemove.size;
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[previewKey];
      return newPreviews;
    });
    
    // Clear metadata for removed file
    setAltTexts(prev => {
      const newAltTexts = { ...prev };
      delete newAltTexts[index];
      return newAltTexts;
    });
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      return newCaptions;
    });
    setDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[index];
      return newDescriptions;
    });
  };

  // Update metadata
  const updateAltText = (index, value) => {
    setAltTexts(prev => ({ ...prev, [index]: value }));
  };

  const updateCaption = (index, value) => {
    setCaptions(prev => ({ ...prev, [index]: value }));
  };

  const updateDescription = (index, value) => {
    setDescriptions(prev => ({ ...prev, [index]: value }));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();

      formData.append('file', file);
      formData.append('collection', selectedCollection);
      if (altTexts[i]) formData.append('alt', altTexts[i]);
      if (captions[i]) formData.append('caption', captions[i]);
      if (descriptions[i]) formData.append('description', descriptions[i]);

      try {
        setUploadProgress(prev => ({ ...prev, [i]: 0 }));

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ success: true, data: data.data });
          setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        } else {
          const errorData = await response.json();
          results.push({
            success: false,
            error: errorData.message || 'Upload failed'
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        results.push({ success: false, error: error.message });
      }
    }

    setUploading(false);
    setUploadProgress({});

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      // Clear files after successful upload
      setFiles([]);
      setAltTexts({});
      setCaptions({});
      setDescriptions({});
    }

    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file(s)`);
    }
  };

  // Helper functions
  const getMaxFileSize = (collection) => {
    const sizes = {
      PRODUCTS: 5 * 1024 * 1024,    // 5MB
      CATEGORIES: 2 * 1024 * 1024,  // 2MB
      BANNERS: 10 * 1024 * 1024,    // 10MB
      PROFILE: 2 * 1024 * 1024,     // 2MB
      DOCUMENTS: 10 * 1024 * 1024,  // 10MB
      VIDEOS: 50 * 1024 * 1024      // 50MB
    };
    return sizes[collection] || 5 * 1024 * 1024;
  };

  const isValidFileType = (file, collection) => {
    const types = {
      PRODUCTS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      CATEGORIES: ['image/jpeg', 'image/png', 'image/webp'],
      BANNERS: ['image/jpeg', 'image/png', 'image/webp'],
      PROFILE: ['image/jpeg', 'image/png', 'image/webp'],
      DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      VIDEOS: ['video/mp4', 'video/webm', 'video/avi']
    };

    return types[collection]?.includes(file.type) || false;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      const previewKey = file.name + file.size;
      if (previews[previewKey]) {
        return (
          <img 
            src={previews[previewKey]} 
            alt={file.name}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        );
      }
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('adminLabels.accessDenied')}</h1>
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
              {t('adminMedia.uploadMedia')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('adminMedia.uploadMediaDescription')}
            </p>
          </div>
        </div>

        {/* Collection Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('adminMedia.selectCollection')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedCollection === collection.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{collection.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {collection.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max: {formatFileSize(getMaxFileSize(collection.id))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('adminMedia.dragDropFiles')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('adminMedia.orClickToSelect')}
            </p>
            <input
              type="file"
              multiple
              accept={currentCollection?.accept}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('adminMedia.selectFiles')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('adminMedia.supportedFormats')}: {currentCollection?.accept}
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('adminMedia.selectedFiles')} ({files.length})
            </h3>

            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getFileIcon(file)}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>

                        {/* Upload Progress */}
                        {uploadProgress[index] !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              {uploadProgress[index] < 100 ? (
                                <Loader className="w-4 h-4 animate-spin text-blue-500" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {uploadProgress[index]}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[index]}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      disabled={uploading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metadata Fields */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('adminMedia.altText')}
                      </label>
                      <input
                        type="text"
                        value={altTexts[index] || ''}
                        onChange={(e) => updateAltText(index, e.target.value)}
                        placeholder={t('adminMedia.altTextPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('adminMedia.caption')}
                      </label>
                      <input
                        type="text"
                        value={captions[index] || ''}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        placeholder={t('adminMedia.captionPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('adminMedia.description')}
                      </label>
                      <input
                        type="text"
                        value={descriptions[index] || ''}
                        onChange={(e) => updateDescription(index, e.target.value)}
                        placeholder={t('adminMedia.descriptionPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    {t('adminMedia.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('adminMedia.uploadFiles')} ({files.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">{t('adminMedia.uploadGuidelines')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('adminMedia.maxFileSize')}: {formatFileSize(getMaxFileSize(selectedCollection))}</li>
                <li>{t('adminMedia.supportedFormats')}: {currentCollection?.accept}</li>
                <li>{t('adminMedia.automaticOptimization')}</li>
                <li>{t('adminMedia.altTextRecommendation')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MediaUpload;