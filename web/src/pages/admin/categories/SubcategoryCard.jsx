import { Edit, Trash2, FolderOpen } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const SubcategoryCard = ({
  subcategory,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();

  return (
    <div className="px-6 py-4 pl-16">
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
            onClick={() => onEdit(subcategory)}
            className="btn btn-outline btn-sm flex items-center space-x-1"
          >
            <Edit className="w-3 h-3" />
            <span>{t('common.edit')}</span>
          </button>
          <button
            onClick={() => onDelete(subcategory.id)}
            className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
            disabled={subcategory._count?.products > 0}
            title={subcategory._count?.products > 0 ? t('adminCategories.cannotDeleteWithProducts') : ''}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryCard;
