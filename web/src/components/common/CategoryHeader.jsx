import { useLanguage } from "../../contexts/LanguageContext";

const CategoryHeader = ({ category, subcategory }) => {
  const { currentLanguage } = useLanguage();

  if (!category) return null;

  // If subcategory is selected, display subcategory information
  if (subcategory) {
    const subcategoryDescription = currentLanguage === 'is'
      ? subcategory.descriptionIs || subcategory.description
      : subcategory.description || subcategory.descriptionIs;

    const subcategoryName = currentLanguage === 'is' ? subcategory.nameIs : subcategory.name;

    if (!subcategoryDescription) return null;

    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800/30">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {subcategoryName}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {subcategoryDescription}
        </p>
      </div>
    );
  }

  // Display category information if no subcategory is selected
  const categoryDescription = currentLanguage === 'is'
    ? category.descriptionIs || category.description
    : category.description || category.descriptionIs;

  if (!categoryDescription) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800/30">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {currentLanguage === 'is' ? category.nameIs : category.name}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        {categoryDescription}
      </p>
    </div>
  );
};

export default CategoryHeader;
