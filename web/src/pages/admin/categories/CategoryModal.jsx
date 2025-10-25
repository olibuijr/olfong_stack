import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Image } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import MediaPicker from '../../../components/admin/MediaPicker';
import toast from 'react-hot-toast';

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
    }
  });

  useEffect(() => {
    if (isOpen && editingCategory) {
      setValue('name', editingCategory.name);
      setValue('nameIs', editingCategory.nameIs || '');
      setValue('slug', editingCategory.slug || '');
      setValue('description', editingCategory.description || '');
      setValue('descriptionIs', editingCategory.descriptionIs || '');
      setValue('icon', editingCategory.icon || '');
      setValue('sortOrder', editingCategory.sortOrder || 0);
      setValue('isActive', editingCategory.isActive);
    } else if (isOpen) {
      reset();
    }
  }, [isOpen, editingCategory, setValue, reset]);

  const handleFormSubmit = async (data) => {
    try {
      const categoryData = {
        ...data,
        sortOrder: parseInt(data.sortOrder),
        imageUrl: selectedImage || null,
      };

      if (editingCategory) {
        await onSubmit({ id: editingCategory.id, ...categoryData }, 'edit');
      } else {
        await onSubmit(categoryData, 'create');
      }

      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingCategory ? t('adminCategories.editCategory') : t('adminCategories.newCategory')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Name (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminCategories.slug')}
              </label>
              <input
                type="text"
                {...register('slug')}
                className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminPlaceholders.enterSlugEn')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('adminCategories.slugHelp')}
              </p>
            </div>

            {/* Description (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminCategories.descEn')}
              </label>
              <textarea
                {...register('description')}
                className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="2"
                placeholder={t('adminPlaceholders.enterDescriptionEn')}
              />
            </div>

            {/* Description (Icelandic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminCategories.descIs')}
              </label>
              <textarea
                {...register('descriptionIs')}
                className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="2"
                placeholder={t('adminPlaceholders.enterDescriptionIs')}
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminCategories.icon')}
              </label>
              <input
                type="text"
                {...register('icon')}
                className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminPlaceholders.enterIcon')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('adminCategories.iconHelp')}
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminCategories.sortOrder')}
              </label>
              <input
                type="number"
                {...register('sortOrder')}
                className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminPlaceholders.enterSortOrder')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('adminCategories.sortOrderHelp')}
              </p>
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('adminCategories.categoryImageFromProduct')}
              </label>
              <div className="flex items-center gap-3">
                {selectedImage && (
                  <div className="w-16 h-16 bg-white dark:bg-white rounded border border-gray-200 dark:border-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={selectedImage} alt="Category" className="w-full h-full object-contain" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onImagePickerOpen}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  {selectedImage ? t('adminCategories.changeImage') : t('adminCategories.selectFromMedia')}
                </button>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={onImageRemove}
                    className="btn btn-outline text-red-600 hover:text-red-700"
                  >
                    {t('adminCategories.removeImage')}
                  </button>
                )}
              </div>
            </div>

            {/* Is Active */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('adminCategories.active')}
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                {editingCategory ? t('common.save') : t('common.add')}
              </button>
            </div>
          </form>
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
