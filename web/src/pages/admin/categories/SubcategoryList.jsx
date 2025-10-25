import { useLanguage } from '../../../contexts/LanguageContext';
import SubcategoryCard from './SubcategoryCard';

const SubcategoryList = ({
  subcategories,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50">
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('adminCategories.subcategories')}
        </h4>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {subcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.id}
            subcategory={subcategory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default SubcategoryList;
