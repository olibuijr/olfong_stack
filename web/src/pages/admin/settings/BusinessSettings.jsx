import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Building,
  Save,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const BusinessSettings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    openingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '22:00', closed: false },
      saturday: { open: '12:00', close: '24:00', closed: false },
      sunday: { open: '12:00', close: '24:00', closed: false }
    },
    ageRestriction: {
      enabled: true,
      nicotineAge: 18,
      alcoholNicotineAge: 20,
      generalProducts: 0
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings?category=BUSINESS', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const businessSettings = {};
        data.data.settings.BUSINESS?.forEach(setting => {
          if (setting.key === 'openingHours') {
            businessSettings.openingHours = JSON.parse(setting.value);
          } else if (setting.key === 'ageRestrictionEnabled') {
            businessSettings.ageRestriction = { ...businessSettings.ageRestriction, enabled: setting.value === 'true' };
          } else if (setting.key === 'nicotineAge') {
            businessSettings.ageRestriction = { ...businessSettings.ageRestriction, nicotineAge: parseInt(setting.value) };
          } else if (setting.key === 'alcoholNicotineAge') {
            businessSettings.ageRestriction = { ...businessSettings.ageRestriction, alcoholNicotineAge: parseInt(setting.value) };
          } else if (setting.key === 'generalProductsAge') {
            businessSettings.ageRestriction = { ...businessSettings.ageRestriction, generalProducts: parseInt(setting.value) };
          }
        });

        // Merge with defaults
        setSettings(prev => ({
          ...prev,
          ...businessSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'openingHours', value: JSON.stringify(settings.openingHours), category: 'BUSINESS', description: 'Store opening hours' },
        { key: 'ageRestrictionEnabled', value: settings.ageRestriction.enabled.toString(), category: 'BUSINESS', description: 'Age restriction enabled' },
        { key: 'nicotineAge', value: settings.ageRestriction.nicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for nicotine products' },
        { key: 'alcoholNicotineAge', value: settings.ageRestriction.alcoholNicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for alcohol and nicotine products' },
        { key: 'generalProductsAge', value: settings.ageRestriction.generalProducts.toString(), category: 'BUSINESS', description: 'Minimum age for general products' }
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
        throw new Error('Failed to save settings');
      }

      toast.success(t('adminSettings', 'settingsSaved'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings', 'businessSettings')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminSettings', 'businessDescription')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings', 'businessSettings')}</h3>
            </div>

            {/* Opening Hours */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {t('adminSettings', 'openingHours')}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(settings.openingHours).map(([day, hours]) => (
                  <div key={day} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {t('adminSettings', '${day}')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            openingHours: {
                              ...prev.openingHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        disabled={hours.closed}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                      />
                      <span className="text-gray-500 dark:text-gray-400">{t('adminSettings', 'to')}</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            openingHours: {
                              ...prev.openingHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        disabled={hours.closed}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                [day]: { ...hours, closed: e.target.checked }
                              }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('adminSettings', 'closed')}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Age Restriction */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {t('adminSettings', 'ageRestriction')}
              </h4>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAgeRestriction"
                    checked={settings.ageRestriction.enabled}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        ageRestriction: { ...prev.ageRestriction, enabled: e.target.checked }
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="enableAgeRestriction" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('adminSettings', 'enableAgeRestriction')}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'nicotineProducts')} ({t('adminSettings', 'years')})
                    </label>
                    <input
                      type="number"
                      value={settings.ageRestriction.nicotineAge}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          ageRestriction: { ...prev.ageRestriction, nicotineAge: parseInt(e.target.value) || 18 }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      disabled={!settings.ageRestriction.enabled}
                      min="0"
                      max="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('adminSettings', 'nicotineAgeDescription')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'alcoholNicotineProducts')} ({t('adminSettings', 'years')})
                    </label>
                    <input
                      type="number"
                      value={settings.ageRestriction.alcoholNicotineAge}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          ageRestriction: { ...prev.ageRestriction, alcoholNicotineAge: parseInt(e.target.value) || 20 }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      disabled={!settings.ageRestriction.enabled}
                      min="0"
                      max="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('adminSettings', 'alcoholNicotineAgeDescription')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'generalProducts')} ({t('adminSettings', 'years')})
                    </label>
                    <input
                      type="number"
                      value={settings.ageRestriction.generalProducts}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          ageRestriction: { ...prev.ageRestriction, generalProducts: parseInt(e.target.value) || 0 }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      disabled={!settings.ageRestriction.enabled}
                      min="0"
                      max="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('adminSettings', 'generalProductsDescription')}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    {t('adminSettings', 'ageRestrictionNotice')}
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('adminSettings', 'ageRestrictionDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 flex justify-end">
          <button
              onClick={handleSaveSettings}
              disabled={isSaving || !hasUnsavedChanges}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? t('common', 'loading') : t('adminSettings', 'saveChanges')}
          </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BusinessSettings;