import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Percent,
  Save,
  RefreshCw,
  ArrowLeft,
  Tag
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const VatSettings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    enabled: true,
    rate: 24,
    country: 'IS',
    displayInAdmin: true,
    includeInCustomerPrice: true,
    showVatBreakdown: false
  });

  // Category VAT Rates
  const [categories, setCategories] = useState([]);
  const [categoryVatRates, setCategoryVatRates] = useState({});

  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings?category=VAT', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const vatSettings = {};
        data.data.settings.VAT?.forEach(setting => {
          if (setting.key === 'vatEnabled') {
            vatSettings.enabled = setting.value === 'true';
          } else if (setting.key === 'vatRate') {
            vatSettings.rate = parseFloat(setting.value);
          } else if (setting.key === 'vatCountry') {
            vatSettings.country = setting.value;
          } else if (setting.key === 'vatDisplayInAdmin') {
            vatSettings.displayInAdmin = setting.value === 'true';
          } else if (setting.key === 'vatIncludeInCustomerPrice') {
            vatSettings.includeInCustomerPrice = setting.value === 'true';
          } else if (setting.key === 'vatShowBreakdown') {
            vatSettings.showVatBreakdown = setting.value === 'true';
          }
        });

        // Merge with defaults
        setSettings(prev => ({
          ...prev,
          ...vatSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);

        // Create rate map
        const rates = {};
        (data.categories || []).forEach(cat => {
          rates[cat.id] = cat.vatRate || null;
        });
        setCategoryVatRates(rates);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'vatEnabled', value: settings.enabled.toString(), category: 'VAT', description: 'VAT enabled' },
        { key: 'vatRate', value: settings.rate.toString(), category: 'VAT', description: 'VAT rate' },
        { key: 'vatCountry', value: settings.country, category: 'VAT', description: 'VAT country' },
        { key: 'vatDisplayInAdmin', value: settings.displayInAdmin.toString(), category: 'VAT', description: 'Show VAT in admin' },
        { key: 'vatIncludeInCustomerPrice', value: settings.includeInCustomerPrice.toString(), category: 'VAT', description: 'Include VAT in customer price' },
        { key: 'vatShowBreakdown', value: settings.showVatBreakdown.toString(), category: 'VAT', description: 'Show VAT breakdown' }
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

      // Save category VAT rates
      for (const [categoryId, vatRate] of Object.entries(categoryVatRates)) {
        try {
          await fetch(`/api/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ vatRate: vatRate === null ? null : parseFloat(vatRate) })
          });
        } catch (error) {
          console.error(`Error saving VAT rate for category ${categoryId}:`, error);
        }
      }

      toast.success(t('adminSettings.settingsSaved'));
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
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('admin.accessDenied')}</h1>
            <p className="text-gray-700">{t('admin.accessDeniedMessage')}</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings.vatSettings')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminSettings.vatDescription')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex items-center mb-6">
            <Percent className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.vatSettings')}</h3>
          </div>

          {/* VAT Configuration */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              {t('adminSettings.vatConfiguration')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vatEnabled"
                    checked={settings.enabled}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, enabled: e.target.checked }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="vatEnabled" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('adminSettings.vatEnabled')}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.vatRate')} (%)
                  </label>
                  <input
                    type="number"
                    value={settings.rate}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }));
                      setHasUnsavedChanges(true);
                    }}
                    disabled={!settings.enabled}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder="24.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.country')}
                  </label>
                   <select
                     name="country"
                     value={settings.country}
                     onChange={(e) => {
                       setSettings(prev => ({ ...prev, country: e.target.value }));
                       setHasUnsavedChanges(true);
                     }}
                     disabled={!settings.enabled}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                   >
                    <option value="IS">{t('adminSettings.iceland')}</option>
                    <option value="EU">{t('adminSettings.euCountries')}</option>
                    <option value="OTHER">{t('adminSettings.otherCountries')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    {t('adminSettings.vatInformation')}
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('adminSettings.vatInformationDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* VAT Display Settings */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              {t('adminSettings.vatDisplaySettings')}
            </h4>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showVatInAdmin"
                  checked={settings.displayInAdmin}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, displayInAdmin: e.target.checked }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.enabled}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <div className="ml-2">
                  <label htmlFor="showVatInAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('adminSettings.showVatInAdmin')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.showVatInAdminDescription')}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeVatInCustomerPrice"
                  checked={settings.includeInCustomerPrice}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, includeInCustomerPrice: e.target.checked }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.enabled}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <div className="ml-2">
                  <label htmlFor="includeVatInCustomerPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('adminSettings.includeVatInCustomerPrice')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.includeVatInCustomerPriceDescription')}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showVatBreakdown"
                  checked={settings.showVatBreakdown}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, showVatBreakdown: e.target.checked }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.enabled}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
                <div className="ml-2">
                  <label htmlFor="showVatBreakdown" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('adminSettings.showVatBreakdown')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.showVatBreakdownDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category VAT Rates */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Category VAT Rates (Optional)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Set different VAT rates for specific product categories. Leave blank to use the default VAT rate above.
            </p>

            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {category.nameIs || category.name}
                    </label>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={categoryVatRates[category.id] === null ? '' : categoryVatRates[category.id] || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          setCategoryVatRates(prev => ({
                            ...prev,
                            [category.id]: value
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        disabled={!settings.enabled}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Default"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              ))}
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
            {isSaving ? t('common.loading') : t('adminSettings.saveChanges')}
          </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VatSettings;