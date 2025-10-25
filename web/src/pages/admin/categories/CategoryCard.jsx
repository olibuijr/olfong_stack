import { Edit, Trash2, FolderOpen } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SubcategoryList from './SubcategoryList';

const CategoryCard = ({
  category,
  onEdit,
  onDelete,
  onEditSubcategory,
  onDeleteSubcategory
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Main Category */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon or Image */}
            <div className="w-16 h-16 bg-white dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-200 overflow-hidden aspect-square">
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.nameIs || category.name} className="w-full h-full object-contain" />
              ) : category.icon ? (
                <span className="text-2xl">{category.icon}</span>
              ) : (
                <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-600" />
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
              onClick={() => onEdit(category)}
              className="btn btn-outline btn-sm flex items-center space-x-1"
            >
              <Edit className="w-3 h-3" />
              <span>{t('common.edit')}</span>
            </button>
            {category.slug !== 'tilbodin' && (
              <button
                onClick={() => onDelete(category.id)}
                className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                disabled={category._count?.products > 0}
                title={category._count?.products > 0 ? t('adminCategories.cannotDeleteWithProducts') : ''}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <SubcategoryList
          subcategories={category.subcategories}
          onEdit={onEditSubcategory}
          onDelete={onDeleteSubcategory}
        />
      )}
    </div>
  );
};

export default CategoryCard;
