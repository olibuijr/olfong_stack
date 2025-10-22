import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Key,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ApiKeysSettings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings?category=API_KEYS', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiKeysData = {};
        data.data.settings.API_KEYS?.forEach(setting => {
          apiKeysData[setting.key] = setting.value || '';
        });
        setApiKeys(apiKeysData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async (keyName, value) => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: keyName, value: value, category: 'API_KEYS', description: `${keyName} API key` }
      ];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: settingsToSave })
      });

      if (!response.ok) {
        throw new Error('Failed to save API key');
      }

      toast.success(t('adminSettings', 'settingsSaved'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleApiKeyVisibility = (keyName) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="text-red-400 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700">You do not have permission to view this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
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
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/settings"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings', 'apiKeys')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminSettings', 'apiKeysDescription')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex items-center mb-6">
            <Key className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings', 'apiKeys')}</h3>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                {t('adminSettings', 'apiKeysConfiguration')}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('adminSettings', 'apiKeysDescription')}
              </p>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="space-y-6">
            {/* Unsplash API Key */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">U</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('adminSettings', 'unsplashApiKey')}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('adminSettings', 'unsplashDevelopers')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-green-600 dark:text-green-400 mr-2">●</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type={showApiKeys.unsplash ? "text" : "password"}
                    placeholder={t('adminSettings', 'enterUnsplashApiKey')}
                    value={apiKeys.unsplash || ''}
                    onChange={(e) => {
                      setApiKeys(prev => ({ ...prev, unsplash: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('unsplash')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKeys.unsplash ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <button
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings', 'save')}
                </button>
              </div>
            </div>

            {/* Pexels API Key */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">P</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('adminSettings', 'pexelsApiKey')}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('adminSettings', 'pexelsApi')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">●</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type={showApiKeys.pexels ? "text" : "password"}
                    placeholder={t('adminSettings', 'enterPexelsApiKey')}
                    value={apiKeys.pexels || ''}
                    onChange={(e) => {
                      setApiKeys(prev => ({ ...prev, pexels: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('pexels')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKeys.pexels ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleSaveApiKey('pexels', apiKeys.pexels || '')}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings', 'save')}
                </button>
              </div>
            </div>

            {/* Pixabay API Key */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">PX</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('adminSettings', 'pixabayApiKey')}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('adminSettings', 'pixabayApi')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">●</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type={showApiKeys.pixabay ? "text" : "password"}
                    placeholder={t('adminSettings', 'enterPixabayApiKey')}
                    value={apiKeys.pixabay || ''}
                    onChange={(e) => {
                      setApiKeys(prev => ({ ...prev, pixabay: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('pixabay')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKeys.pixabay ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleSaveApiKey('pixabay', apiKeys.pixabay || '')}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings', 'save')}
                </button>
              </div>
            </div>

            {/* Google Custom Search API */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm">G</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('adminSettings', 'googleApiKey')}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('adminSettings', 'googleCloudConsole')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">●</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.google ? "text" : "password"}
                      placeholder={t('adminSettings', 'enterGoogleApiKey')}
                      value={apiKeys.google || ''}
                      onChange={(e) => {
                        setApiKeys(prev => ({ ...prev, google: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility('google')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKeys.google ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveApiKey('google', apiKeys.google || '')}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings', 'save')}
                  </button>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder={t('adminSettings', 'enterGoogleSearchEngineId')}
                    value={apiKeys.googleSearchEngineId || ''}
                    onChange={(e) => {
                      setApiKeys(prev => ({ ...prev, googleSearchEngineId: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={() => handleSaveApiKey('googleSearchEngineId', apiKeys.googleSearchEngineId || '')}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings', 'test')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
              {t('adminSettings', 'importantNotes')}
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• {t('adminSettings', 'apiKeysImportantNote1')}</li>
              <li>• {t('adminSettings', 'apiKeysImportantNote2')}</li>
              <li>• {t('adminSettings', 'apiKeysImportantNote3')}</li>
              <li>• {t('adminSettings', 'apiKeysImportantNote4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default ApiKeysSettings;