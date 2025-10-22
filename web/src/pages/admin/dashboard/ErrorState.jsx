import { useLanguage } from "../../../contexts/LanguageContext";
import { AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import AdminLayout from '../../../components/admin/AdminLayout';

const ErrorState = ({ error, onRetry }) => {
  const { t } = useLanguage();

  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common', 'retry')}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};

export default ErrorState;