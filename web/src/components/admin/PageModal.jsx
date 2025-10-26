import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import SlateEditor from './SlateEditor';
import MediaPicker from './MediaPicker';

const PageModal = ({ isOpen, editingPage, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirtyForm, setIsDirtyForm] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedFeaturedImage, setSelectedFeaturedImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      titleIs: '',
      slug: '',
      content: JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]),
      contentIs: JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]),
      status: 'DRAFT',
      isVisible: true,
      sortOrder: 0,
      metaTitle: '',
      metaTitleIs: '',
      metaDescription: '',
      metaDescriptionIs: '',
      canonicalUrl: '',
    },
  });

  const formValues = watch();

  // Populate form when editing
  useEffect(() => {
    if (editingPage) {
      setValue('title', editingPage.title || '');
      setValue('titleIs', editingPage.titleIs || '');
      setValue('slug', editingPage.slug || '');
      setValue('content', editingPage.content || JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]));
      setValue('contentIs', editingPage.contentIs || JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]));
      setValue('status', editingPage.status || 'DRAFT');
      setValue('isVisible', editingPage.isVisible !== undefined ? editingPage.isVisible : true);
      setValue('sortOrder', editingPage.sortOrder || 0);
      setValue('metaTitle', editingPage.metaTitle || '');
      setValue('metaTitleIs', editingPage.metaTitleIs || '');
      setValue('metaDescription', editingPage.metaDescription || '');
      setValue('metaDescriptionIs', editingPage.metaDescriptionIs || '');
      setValue('canonicalUrl', editingPage.canonicalUrl || '');
      setSelectedFeaturedImage(editingPage.featuredImage || null);
    } else {
      reset();
      setSelectedFeaturedImage(null);
    }
    setIsDirtyForm(false);
  }, [editingPage, isOpen, setValue, reset]);

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    if (isDirtyForm && !window.confirm(t('common.unsavedChanges'))) {
      return;
    }
    onClose();
    reset();
    setSelectedFeaturedImage(null);
  }, [isDirtyForm, onClose, reset, t]);

  // Track form changes
  useEffect(() => {
    setIsDirtyForm(true);
  }, [formValues]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isDirtyForm) {
          if (window.confirm(t('common.unsavedChanges'))) {
            handleClose();
          }
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDirtyForm, t, handleClose]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        sortOrder: parseInt(data.sortOrder),
        featuredImageId: selectedFeaturedImage?.id || null,
      });
      setIsDirtyForm(false);
      handleClose();
    } catch (error) {
      toast.error(error.message || t('common.errorOccurred'));
    }
  };

  const handleImageSelected = (image) => {
    setSelectedFeaturedImage(image);
    setShowMediaModal(false);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: t('adminPages.modal.basicInfo') },
    { id: 'contentEn', label: t('adminPages.modal.contentEn') },
    { id: 'contentIs', label: t('adminPages.modal.contentIs') },
    { id: 'image', label: t('adminPages.modal.featuredImage') },
    { id: 'seo', label: t('adminPages.modal.seo') },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingPage ? t('adminPages.editPage') : t('adminPages.createPage')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.title')} *
                      </label>
                      <input
                        {...register('title', { required: t('adminPages.validation.titleRequired') })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.title')}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.titleIs')} *
                      </label>
                      <input
                        {...register('titleIs', { required: t('adminPages.validation.titleRequired') })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.titleIs')}
                      />
                      {errors.titleIs && (
                        <p className="text-red-500 text-sm mt-1">{errors.titleIs.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('adminPages.modal.slug')} *
                    </label>
                    <input
                      {...register('slug', { required: t('adminPages.validation.slugRequired') })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="privacy-policy"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('adminPages.modal.slugHelper')}
                    </p>
                    {errors.slug && (
                      <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.status')}
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DRAFT">{t('adminPages.status.draft')}</option>
                        <option value="PUBLISHED">{t('adminPages.status.published')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.visibility')}
                      </label>
                      <select
                        {...register('isVisible')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="true">{t('adminPages.visibility.visible')}</option>
                        <option value="false">{t('adminPages.visibility.hidden')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.sortOrder')}
                      </label>
                      <input
                        {...register('sortOrder')}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminPages.modal.sortOrderHelper')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content EN Tab */}
              {activeTab === 'contentEn' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('adminPages.modal.contentEn')} *
                  </label>
                  <SlateEditor
                    value={formValues.content}
                    onChange={(value) => {
                      setValue('content', value);
                      setIsDirtyForm(true);
                    }}
                    locale="en"
                  />
                </div>
              )}

              {/* Content IS Tab */}
              {activeTab === 'contentIs' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('adminPages.modal.contentIs')} *
                  </label>
                  <SlateEditor
                    value={formValues.contentIs}
                    onChange={(value) => {
                      setValue('contentIs', value);
                      setIsDirtyForm(true);
                    }}
                    locale="is"
                  />
                </div>
              )}

              {/* Featured Image Tab */}
              {activeTab === 'image' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('adminPages.modal.featuredImage')}
                  </label>
                  {selectedFeaturedImage ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={selectedFeaturedImage.url}
                          alt={selectedFeaturedImage.alt || 'Featured'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMediaModal(true)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {t('adminPages.modal.selectImage')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFeaturedImage(null)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          {t('common.remove')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {t('adminPages.modal.selectImage')}
                    </button>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('adminPages.modal.imageHelper')}
                  </p>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.metaTitle')}
                      </label>
                      <input
                        {...register('metaTitle')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.metaTitle')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.metaTitleIs')}
                      </label>
                      <input
                        {...register('metaTitleIs')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.metaTitleIs')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.metaDescription')}
                      </label>
                      <textarea
                        {...register('metaDescription')}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.metaDescription')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('adminPages.modal.metaDescriptionIs')}
                      </label>
                      <textarea
                        {...register('metaDescriptionIs')}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('adminPages.modal.metaDescriptionIs')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('adminPages.modal.canonicalUrl')}
                    </label>
                    <input
                      {...register('canonicalUrl')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/page"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('adminPages.modal.canonicalHelper')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingPage ? t('common.update') : t('common.create')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaModal && (
        <MediaPicker
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSelect={handleImageSelected}
          collection="PAGES"
        />
      )}
    </>
  );
};

export default PageModal;
