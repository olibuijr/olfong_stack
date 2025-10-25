import { FolderOpen } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import CategoryCard from './CategoryCard';

const CategoryList = ({
  categories,
  searchTerm,
  onEdit,
  onDelete,
  onEditSubcategory,
  onDeleteSubcategory
}) => {
  const { t } = useLanguage();

  const filteredCategories = categories.filter((category) =>
    searchTerm === '' ||
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.nameIs.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('adminCategories.noCategories')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('adminCategories.createFirstCategory')}
        </p>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          {t('common.noResults')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          onEditSubcategory={onEditSubcategory}
          onDeleteSubcategory={onDeleteSubcategory}
        />
      ))}
    </div>
  );
};

export default CategoryList;
