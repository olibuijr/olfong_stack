import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw, Save } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Reusable PageHeader component for admin pages
 * Provides consistent styling and layout across all admin pages
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page subtitle/description
 * @param {React.ReactNode} props.icon - Icon component (e.g., <SettingsIcon />)
 * @param {string} props.backUrl - URL for back button (optional)
 * @param {React.ReactNode} props.actions - Action buttons/elements (optional)
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {boolean} props.isSaving - Whether currently saving
 * @param {Function} props.onSave - Save button callback
 */
const PageHeader = ({
  title,
  description,
  icon: Icon,
  backUrl = null,
  actions = null,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave = null,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Left section - Back button, icon, and title */}
          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
            {backUrl && (
              <Link
                to={backUrl}
                className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 mt-0.5"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap leading-tight">
                {Icon && (
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
                <span>{title}</span>
              </h1>
              {description && (
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right section - Status and save button */}
          <div className="flex flex-col xs:flex-row items-center justify-end gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 w-full sm:w-auto">
            {/* Status indicator - only show if save functionality is provided */}
            {onSave && (
              <>
                {hasUnsavedChanges ? (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Unsaved Changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 whitespace-nowrap">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">All Saved</span>
                  </div>
                )}
                <button
                  onClick={onSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}

            {/* Custom actions (optional) */}
            {actions && !onSave && actions}
          </div>
        </div>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  backUrl: PropTypes.string,
  actions: PropTypes.node,
  hasUnsavedChanges: PropTypes.bool,
  isSaving: PropTypes.bool,
  onSave: PropTypes.func,
};

PageHeader.defaultProps = {
  description: null,
  icon: null,
  backUrl: null,
  actions: null,
  hasUnsavedChanges: false,
  isSaving: false,
  onSave: null,
};

export default PageHeader;
