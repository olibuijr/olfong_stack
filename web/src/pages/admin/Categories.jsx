import { useEffect, useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { Plus, AlertCircle, FolderOpen } from 'lucide-react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../store/slices/categorySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import toast from 'react-hot-toast';
import CategoryModal from './categories/CategoryModal';
import CategoryList from './categories/CategoryList';

const AdminCategories = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchCategories({ includeInactive: true }));
    }
  }, [dispatch, user]);

  const onModalSubmit = async (categoryData, action) => {
    try {
      if (action === 'edit') {
        await dispatch(updateCategory(categoryData)).unwrap();
        toast.success(t('common.success'));
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
        toast.success(t('common.success'));
      }

      setShowModal(false);
      setEditingCategory(null);
      setSelectedCategoryImage(null);
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

  const handleEditSubcategory = () => {
    // For now, just show a message that subcategory editing is not implemented
    toast.info('Subcategory editing will be implemented in a future update');
  };

  const handleDeleteSubcategory = async () => {
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
      <PageHeader
        icon={FolderOpen}
        title={t('adminCategories.title')}
        description={t('adminCategories.manageCategories')}
        actions={
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('adminCategories.newCategory')}
          </button>
        }
      />

      {/* Search Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <CategoryList
          categories={categories}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEditSubcategory={handleEditSubcategory}
          onDeleteSubcategory={handleDeleteSubcategory}
        />

        <CategoryModal
          isOpen={showModal}
          editingCategory={editingCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
            setSelectedCategoryImage(null);
          }}
          onSubmit={onModalSubmit}
          showImagePicker={showImagePicker}
          onImagePickerOpen={() => setShowImagePicker(true)}
          onImagePickerClose={() => setShowImagePicker(false)}
          selectedImage={selectedCategoryImage}
          onImageSelect={(url) => {
            setSelectedCategoryImage(url);
            setShowImagePicker(false);
          }}
          onImageRemove={() => setSelectedCategoryImage(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
