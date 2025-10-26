import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import MediaPicker from '../../../components/admin/MediaPicker';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const CategoryModal = ({
  isOpen,
  editingCategory,
  onClose,
  onSubmit,
  showImagePicker,
  onImagePickerOpen,
  onImagePickerClose,
  selectedImage,
  onImageSelect,
  onImageRemove
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirtyForm, setIsDirtyForm] = useState(false);
  const [vatProfiles, setVatProfiles] = useState([]);
  const [loadingVatProfiles, setLoadingVatProfiles] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      nameIs: '',
      slug: '',
      description: '',
      descriptionIs: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
      metaTitle: '',
      metaTitleIs: '',
      metaDescription: '',
      metaDescriptionIs: '',
      hasDiscount: false,
      discountPercentage: 0,
      discountStartDate: '',
      discountEndDate: '',
      discountReason: '',
      discountReasonIs: '',
      vatProfileId: '',
    }
  });

  // Fetch VAT profiles
  useEffect(() => {
    const fetchVatProfiles = async () => {
      try {
        setLoadingVatProfiles(true);
        const response = await api.get('/vat-profiles');
        const profiles = response.data?.profiles || response.data?.data || response.data || [];
        setVatProfiles(Array.isArray(profiles) ? profiles : []);
      } catch (error) {
        console.error('Failed to fetch VAT profiles:', error);
        setVatProfiles([]);
      } finally {
        setLoadingVatProfiles(false);
      }
    };

    if (isOpen) {
      fetchVatProfiles();
    }
  }, [isOpen]);

  const tabs = [
    { id: 'basic', label: t('adminCategories.basicInfo'), icon: '📋' },
    { id: 'images', label: t('adminCategories.images'), icon: '🖼️' },
    { id: 'vat', label: t('adminCategories.vat') || 'VAT', icon: '💹' },
    { id: 'seo', label: t('adminCategories.seo'), icon: '🔍' },
    { id: 'discounts', label: t('adminCategories.discounts'), icon: '💰' },
  ];

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isDirtyForm) {
          const confirmClose = window.confirm(
            t('common.unsavedChanges') || 'You have unsaved changes. Are you sure you want to close without saving?'
          );
          if (confirmClose) {
            handleClose();
          }
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDirtyForm]);

  useEffect(() => {
    if (isOpen && editingCategory) {
      // Basic fields
      setValue('name', editingCategory.name || '');
      setValue('nameIs', editingCategory.nameIs || '');
      setValue('slug', editingCategory.slug || '');
      setValue('description', editingCategory.description || '');
      setValue('descriptionIs', editingCategory.descriptionIs || '');
      setValue('icon', editingCategory.icon || '');
      setValue('sortOrder', editingCategory.sortOrder || 0);
      setValue('isActive', editingCategory.isActive !== undefined ? editingCategory.isActive : true);

      // VAT fields
      setValue('vatProfileId', editingCategory.vatProfileId ? String(editingCategory.vatProfileId) : '');

      // SEO fields
      setValue('metaTitle', editingCategory.metaTitle || '');
      setValue('metaTitleIs', editingCategory.metaTitleIs || '');
      setValue('metaDescription', editingCategory.metaDescription || '');
      setValue('metaDescriptionIs', editingCategory.metaDescriptionIs || '');

      // Discount fields
      setValue('hasDiscount', editingCategory.hasDiscount || false);
      setValue('discountPercentage', editingCategory.discountPercentage || 0);
      setValue('discountStartDate', editingCategory.discountStartDate ? editingCategory.discountStartDate.split('T')[0] : '');
      setValue('discountEndDate', editingCategory.discountEndDate ? editingCategory.discountEndDate.split('T')[0] : '');
      setValue('discountReason', editingCategory.discountReason || '');
      setValue('discountReasonIs', editingCategory.discountReasonIs || '');

      setActiveTab('basic');
    } else if (isOpen) {
      reset();
      setActiveTab('basic');
    }
    setIsDirtyForm(false);
  }, [isOpen, editingCategory, setValue, reset]);

  const handleFormChange = () => {
    setIsDirtyForm(true);
  };

  const handleClose = () => {
    setIsDirtyForm(false);
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    try {
      const categoryData = {
        ...data,
        sortOrder: parseInt(data.sortOrder),
        imageUrl: selectedImage || null,
        discountPercentage: data.hasDiscount ? parseFloat(data.discountPercentage) : 0,
        vatProfileId: data.vatProfileId ? parseInt(data.vatProfileId) : null,
      };

      if (editingCategory) {
        await onSubmit({ id: editingCategory.id, ...categoryData }, 'edit');
      } else {
        await onSubmit(categoryData, 'create');
      }

      setIsDirtyForm(false);
      reset();
      handleClose();
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingCategory ? t('adminCategories.editCategory') : t('adminCategories.newCategory')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            onChange={handleFormChange}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Name (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.nameEn')} *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: t('adminCategories.nameRequired') })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterNameEn')}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Name (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.nameIs')} *
                  </label>
                  <input
                    type="text"
                    {...register('nameIs', { required: t('adminCategories.nameRequired') })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterNameIs')}
                  />
                  {errors.nameIs && (
                    <p className="text-red-600 text-sm mt-1">{errors.nameIs.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.slug')}
                  </label>
                  <input
                    type="text"
                    {...register('slug')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterSlugEn')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('adminCategories.slugHelp')}
                  </p>
                </div>

                {/* Description (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.descEn')}
                  </label>
                  <textarea
                    {...register('description')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    placeholder={t('adminPlaceholders.enterDescriptionEn')}
                  />
                </div>

                {/* Description (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.descIs')}
                  </label>
                  <textarea
                    {...register('descriptionIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    placeholder={t('adminPlaceholders.enterDescriptionIs')}
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.icon')}
                  </label>
                  <input
                    type="text"
                    {...register('icon')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterIcon')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('adminCategories.iconHelp')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminCategories.sortOrder')}
                    </label>
                    <input
                      type="number"
                      {...register('sortOrder')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('adminPlaceholders.enterSortOrder')}
                    />
                  </div>

                  {/* Is Active */}
                  <div>
                    <label className="flex items-center space-x-3 mt-8">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="rounded border-gray-300 dark:border-gray-600 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminCategories.active')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    {t('adminCategories.categoryImageFromProduct')}
                  </label>
                  <div className="flex items-center gap-4">
                    {selectedImage && (
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt="Category"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={onImagePickerOpen}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {selectedImage ? t('adminCategories.changeImage') : t('adminCategories.selectFromMedia')}
                      </button>
                      {selectedImage && (
                        <button
                          type="button"
                          onClick={onImageRemove}
                          className="btn btn-outline text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {t('adminCategories.removeImage')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VAT Tab */}
            {activeTab === 'vat' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('adminCategories.vatHelp') || 'Select a VAT profile to apply to all products in this category. The VAT rate will be calculated based on the selected profile.'}
                  </p>
                </div>

                {/* VAT Profile Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.vatProfile') || 'VAT Profile'}
                  </label>
                  {loadingVatProfiles ? (
                    <div className="flex items-center justify-center p-4 text-gray-500">
                      {t('common.loading') || 'Loading...'}
                    </div>
                  ) : (
                    <select
                      {...register('vatProfileId')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('adminCategories.selectVatProfile') || 'Select a VAT Profile'}</option>
                      {vatProfiles.map((profile) => (
                        <option key={profile.id} value={String(profile.id)}>
                          {profile.nameIs || profile.name} ({profile.vatRate}%)
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('adminCategories.vatProfileHelp') || 'The VAT rate will be applied to all products in this category.'}
                  </p>
                </div>

                {/* Selected VAT Profile Info */}
                {watch('vatProfileId') && (() => {
                  const selectedProfile = vatProfiles.find(p => String(p.id) === watch('vatProfileId'));
                  return selectedProfile ? (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                        {t('adminCategories.selectedVatProfile') || 'Selected VAT Profile'}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          <span className="font-medium">{t('adminCategories.name') || 'Name'}:</span> {selectedProfile.nameIs || selectedProfile.name}
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          <span className="font-medium">{t('adminCategories.rate') || 'Rate'}:</span> {selectedProfile.vatRate}%
                        </p>
                        {selectedProfile.description && (
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            <span className="font-medium">{t('adminCategories.description') || 'Description'}:</span> {selectedProfile.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('adminCategories.seoHelp')}
                  </p>
                </div>

                {/* Meta Title (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.metaTitleEn')}
                  </label>
                  <input
                    type="text"
                    {...register('metaTitle')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterMetaTitleEn')}
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {watch('metaTitle')?.length || 0}/60 characters
                  </p>
                </div>

                {/* Meta Title (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.metaTitleIs')}
                  </label>
                  <input
                    type="text"
                    {...register('metaTitleIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterMetaTitleIs')}
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {watch('metaTitleIs')?.length || 0}/60 characters
                  </p>
                </div>

                {/* Meta Description (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.metaDescEn')}
                  </label>
                  <textarea
                    {...register('metaDescription')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    placeholder={t('adminPlaceholders.enterMetaDescEn')}
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {watch('metaDescription')?.length || 0}/160 characters
                  </p>
                </div>

                {/* Meta Description (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminCategories.metaDescIs')}
                  </label>
                  <textarea
                    {...register('metaDescriptionIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    placeholder={t('adminPlaceholders.enterMetaDescIs')}
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {watch('metaDescriptionIs')?.length || 0}/160 characters
                  </p>
                </div>
              </div>
            )}

            {/* Discounts Tab */}
            {activeTab === 'discounts' && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {t('adminCategories.discountHelp')}
                  </p>
                </div>

                {/* Enable Discount */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('hasDiscount')}
                      className="rounded border-gray-300 dark:border-gray-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('adminCategories.enableCategoryDiscount')}
                    </span>
                  </label>
                </div>

                {watch('hasDiscount') && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminCategories.discountPercentage')} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          {...register('discountPercentage', { min: 0, max: 100 })}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminCategories.discountStartDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountStartDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminCategories.discountEndDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountEndDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminCategories.discountReasonEn')}
                      </label>
                      <input
                        type="text"
                        {...register('discountReason')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('adminPlaceholders.enterDiscountReasonEn') || 'e.g., Seasonal Sale'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminCategories.discountReasonIs')}
                      </label>
                      <input
                        type="text"
                        {...register('discountReasonIs')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('adminPlaceholders.enterDiscountReasonIs') || 'e.g., Tímabundin sala'}
                      />
                    </div>
                  </>
                )}

                {!watch('hasDiscount') && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('adminCategories.enableDiscountMessage')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Footer with Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              className="btn btn-primary flex-1"
            >
              {editingCategory ? t('common.save') : t('common.add')}
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showImagePicker}
        onClose={onImagePickerClose}
        onSelect={(media) => {
          onImageSelect(media.url);
        }}
        collection="PRODUCTS"
        selectedMedia={selectedImage}
        multiple={false}
      />
    </>
  );
};

export default CategoryModal;
