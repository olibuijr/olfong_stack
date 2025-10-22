import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext'; // Changed from '../../hooks/useTranslation' to 'react-i18next'
import { toast } from 'react-toastify'; // Changed from 'react-hot-toast' to 'react-toastify'

const TranslationEditor = ({ translation, onClose, onSave }) => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    key: '',
    value: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (translation) {
      setFormData({
        key: translation.key || '',
        value: translation.value || ''
      });
    } else {
      // Reset form for new translation
      setFormData({
        key: '',
        value: ''
      });
    }
  }, [translation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.key.trim()) {
      newErrors.key = t('adminTranslations.validation.keyRequired');
    }

    if (!formData.value.trim()) {
      newErrors.value = t('adminTranslations.validation.valueRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData); // Call the onSave prop passed from parent
      onClose(); // Close editor on successful save
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error(error.message || t('adminTranslations.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {translation ? t('adminTranslations.editTranslation') : t('adminTranslations.addTranslation')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminTranslations.key')} *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              disabled={!!translation} // Don't allow editing key for existing translations
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.key ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${translation ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
              placeholder="e.g., common.loading"
            />
            {errors.key && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.key}</p>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminTranslations.value')} *
            </label>
            <textarea
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.value ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter the translation text..."
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.value}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t('adminTranslations.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('common.saving')}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{t('adminTranslations.save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranslationEditor;