import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen,
  AlertCircle,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../store/slices/categorySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { categories, isLoading, error } = useSelector((state) => state.categories);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
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
    if (user?.role === 'ADMIN') {
      dispatch(fetchCategories({ includeInactive: true }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('nameIs', editingCategory.nameIs || '');
      setValue('slug', editingCategory.slug || '');
      setValue('description', editingCategory.description || '');
      setValue('descriptionIs', editingCategory.descriptionIs || '');
      setValue('icon', editingCategory.icon || '');
      setValue('sortOrder', editingCategory.sortOrder || 0);
      setValue('isActive', editingCategory.isActive);
    } else {
      reset();
    }
  }, [editingCategory, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const categoryData = {
        ...data,
        sortOrder: parseInt(data.sortOrder),
      };

      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, ...categoryData })).unwrap();
        toast.success(t('common.success'));
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
        toast.success(t('common.success'));
      }

      setShowModal(false);
      setEditingCategory(null);
      reset();
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm(t('adminCategories.confirmDelete'))) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        toast.success(t('common.success'));
      } catch (error) {
        toast.error(error || t('common.error'));
      }
    }
  };

  const handleEditSubcategory = (subcategory) => {
    // For now, just show a message that subcategory editing is not implemented
    toast.info('Subcategory editing will be implemented in a future update');
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    // For now, just show a message that subcategory deletion is not implemented
    toast.info('Subcategory deletion will be implemented in a future update');
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminPage.accessDenied')}</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('adminPage.accessDenied')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('adminPage.noPermission')}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminCategories.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminCategories.manageCategories')}</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('adminCategories.newCategory')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('adminCategories.noCategories')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('adminCategories.createFirstCategory')}
            </p>
          </div>
        ) : (
           <div className="space-y-6">
             {categories.map((category) => (
               <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 {/* Main Category */}
                 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4 flex-1">
                       {/* Icon */}
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          {category.icon ? (
                            <span className="text-2xl text-white">{category.icon}</span>
                          ) : (
                            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>

                       {/* Category Info */}
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-1">
                           <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                             {category.nameIs || category.name}
                           </h3>
                           <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                             {category.slug}
                           </span>
                           {!category.isActive && (
                             <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded">
                               {t('adminCategories.inactive')}
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {category.descriptionIs || category.description || t('adminCategories.noDescription')}
                         </p>
                         <div className="flex items-center gap-4 mt-2">
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {t('adminCategories.productCount')}: {category._count?.products || 0}
                           </span>
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {t('adminCategories.subcategories')}: {category.subcategories?.length || 0}
                           </span>
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {t('adminCategories.sortOrder')}: {category.sortOrder}
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2 flex-shrink-0">
                       <button
                         onClick={() => handleEdit(category)}
                         className="btn btn-outline btn-sm flex items-center space-x-1"
                       >
                         <Edit className="w-3 h-3" />
                         <span>{t('common.edit')}</span>
                       </button>
                       <button
                         onClick={() => handleDelete(category.id)}
                         className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                         disabled={category._count?.products > 0}
                         title={category._count?.products > 0 ? t('adminCategories.cannotDeleteWithProducts') : ''}
                       >
                         <Trash2 className="w-3 h-3" />
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Subcategories */}
                 {category.subcategories && category.subcategories.length > 0 && (
                   <div className="bg-gray-50 dark:bg-gray-900/50">
                     <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                       <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         {t('adminCategories.subcategories')}
                       </h4>
                     </div>
                     <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="px-6 py-4 pl-16">
                            <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-3 flex-1 min-w-0">
                               {/* Subcategory Icon */}
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {subcategory.icon ? (
                                    <span className="text-lg text-white">{subcategory.icon}</span>
                                  ) : (
                                    <FolderOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  )}
                                </div>

                               {/* Subcategory Info */}
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                   <h4 className="font-medium text-gray-900 dark:text-white">
                                     {subcategory.nameIs || subcategory.name}
                                   </h4>
                                   <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                     {subcategory.slug}
                                   </span>
                                   {!subcategory.isActive && (
                                     <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded">
                                       {t('adminCategories.inactive')}
                                     </span>
                                   )}
                                 </div>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                   {subcategory.descriptionIs || subcategory.description || t('adminCategories.noDescription')}
                                 </p>
                                 <div className="flex items-center gap-4 mt-1">
                                   <span className="text-xs text-gray-500 dark:text-gray-400">
                                     {t('adminCategories.productCount')}: {subcategory._count?.products || 0}
                                   </span>
                                   <span className="text-xs text-gray-500 dark:text-gray-400">
                                     {t('adminCategories.sortOrder')}: {subcategory.sortOrder}
                                   </span>
                                 </div>
                               </div>
                             </div>

                             {/* Subcategory Actions */}
                             <div className="flex items-center gap-2 flex-shrink-0">
                               <button
                                 onClick={() => handleEditSubcategory(subcategory)}
                                 className="btn btn-outline btn-sm flex items-center space-x-1"
                               >
                                 <Edit className="w-3 h-3" />
                                 <span>{t('common.edit')}</span>
                               </button>
                               <button
                                 onClick={() => handleDeleteSubcategory(subcategory.id)}
                                 className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                                 disabled={subcategory._count?.products > 0}
                                 title={subcategory._count?.products > 0 ? t('adminCategories.cannotDeleteWithProducts') : ''}
                               >
                                 <Trash2 className="w-3 h-3" />
                               </button>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}

        {/* Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingCategory ? t('adminCategories.editCategory') : t('adminCategories.newCategory')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminCategories.nameEn')} *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: t('adminCategories.nameRequired') })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminPlaceholders.enterSlug')}
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
                    placeholder={t('adminPlaceholders.enterSlugIs')}
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
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      reset();
                    }}
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
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
