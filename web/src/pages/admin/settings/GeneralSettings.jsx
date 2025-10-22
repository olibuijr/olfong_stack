import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Settings as SettingsIcon, Save, RefreshCw, ArrowLeft, Store, Globe, Mail, Phone, MapPin, Clock, DollarSign, Calendar, Info, AlertCircle, CheckCircle } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const GeneralSettings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'Ölföng',
    storeDescription: 'Icelandic wine and beer shop with home delivery',
    storeEmail: 'info@olfong.is',
    storePhone: '+354 555 1234',
    storeAddress: 'Laugavegur 123, 101 Reykjavík, Iceland',
    currency: 'ISK',
    language: 'is',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings?category=GENERAL', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const generalSettings = {};
        data.data.settings.GENERAL?.forEach(setting => {
          generalSettings[setting.key] = setting.value || '';
        });

        setSettings(prev => ({
          ...prev,
          ...generalSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSettings = () => {
    const errors = {};
    
    if (!settings.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    
    if (!settings.storeEmail.trim()) {
      errors.storeEmail = 'Store email is required';
    } else if (!/\S+@\S+\.\S+/.test(settings.storeEmail)) {
      errors.storeEmail = 'Please enter a valid email address';
    }
    
    if (!settings.storePhone.trim()) {
      errors.storePhone = 'Phone number is required';
    }
    
    if (!settings.storeAddress.trim()) {
      errors.storeAddress = 'Store address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'storeName', value: settings.storeName, category: 'GENERAL', description: 'Store name' },
        { key: 'storeDescription', value: settings.storeDescription, category: 'GENERAL', description: 'Store description' },
        { key: 'storeEmail', value: settings.storeEmail, category: 'GENERAL', description: 'Store email' },
        { key: 'storePhone', value: settings.storePhone, category: 'GENERAL', description: 'Store phone number' },
        { key: 'storeAddress', value: settings.storeAddress, category: 'GENERAL', description: 'Store address' },
        { key: 'currency', value: settings.currency, category: 'GENERAL', description: 'Store currency' },
        { key: 'language', value: settings.language, category: 'GENERAL', description: 'Default language' },
        { key: 'dateFormat', value: settings.dateFormat, category: 'GENERAL', description: 'Date format' },
        { key: 'timeFormat', value: settings.timeFormat, category: 'GENERAL', description: 'Time format' }
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
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-red-400 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-700 dark:text-gray-300">You do not have permission to view this page.</p>
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
          <div className="px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
             <div className="flex items-center space-x-4">
               <Link
                 to="/admin/settings"
                 className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
               >
                 <ArrowLeft className="w-5 h-5" />
               </Link>
               <div>
                 <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 dark:text-white flex items-center">
                   <SettingsIcon className="w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-blue-600 dark:text-blue-400 mr-3" />
                   {t('adminSettings', 'generalSettings')}
                 </h1>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminSettings', 'generalDescription')}</p>
               </div>
             </div>
             <div className="flex items-center space-x-4 mt-4 sm:mt-0">
               {hasUnsavedChanges ? (
                 <div className="flex items-center text-amber-600 dark:text-amber-400">
                   <AlertCircle className="w-5 h-5 mr-2" />
                   <span className="text-sm font-medium">Unsaved Changes</span>
                 </div>
               ) : (
                 <div className="flex items-center text-green-600 dark:text-green-400">
                   <CheckCircle className="w-5 h-5 mr-2" />
                   <span className="text-sm font-medium">All Saved</span>
                 </div>
               )}
               <button
                 onClick={handleSaveSettings}
                 disabled={isSaving || !hasUnsavedChanges}
                 className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
       </div>

        {/* Main Content */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
           <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Store className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">Store Information</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Basic information about your store</p>
              </div>
                <div className="p-4 xl:p-6 2xl:p-8 space-y-4 xl:space-y-6 2xl:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings', 'storeName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.storeName 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your store name"
                    />
                    {validationErrors.storeName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.storeName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings', 'storeEmail')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          validationErrors.storeEmail 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="info@yourstore.com"
                      />
                    </div>
                    {validationErrors.storeEmail && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.storeEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings', 'phoneNumber')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => handleInputChange('storePhone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          validationErrors.storePhone 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="+354 555 1234"
                      />
                    </div>
                    {validationErrors.storePhone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.storePhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings', 'storeAddress')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={settings.storeAddress}
                        onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                        rows={3}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          validationErrors.storeAddress 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your store address"
                      />
                    </div>
                    {validationErrors.storeAddress && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.storeAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings', 'storeDescription')}
                    </label>
                    <textarea
                      value={settings.storeDescription}
                      onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your store and what makes it special"
                    />
                  </div>
                </div>
              </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">Preferences</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Configure general preferences and settings</p>
              </div>
                <div className="p-4 xl:p-6 2xl:p-8 space-y-4 xl:space-y-6 2xl:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4 xl:gap-6 2xl:gap-8">
                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings', 'currency')}
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="ISK">{t('adminSettings', 'currencyISK')}</option>
                          <option value="USD">{t('adminSettings', 'currencyUSD')}</option>
                          <option value="EUR">{t('adminSettings', 'currencyEUR')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings', 'language')}
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="is">{t('adminSettings', 'languageIcelandic')}</option>
                          <option value="en">{t('adminSettings', 'languageEnglish')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings', 'dateFormat')}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="DD/MM/YYYY">{t('adminSettings', 'dateFormatDDMMYYYY')}</option>
                          <option value="MM/DD/YYYY">{t('adminSettings', 'dateFormatMMDDYYYY')}</option>
                          <option value="YYYY-MM-DD">{t('adminSettings', 'dateFormatYYYYMMDD')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings', 'timeFormat')}
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.timeFormat}
                          onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="24h">{t('adminSettings', 'timeFormat24h')}</option>
                          <option value="12h">{t('adminSettings', 'timeFormat12h')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             </div>

             {/* Help Information */}
             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 xl:p-6">
               <div className="flex items-start">
                 <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                 <div>
                   <h4 className="text-sm xl:text-base font-medium text-blue-900 dark:text-blue-100 mb-2">Need Help?</h4>
                   <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                     These settings control how your store appears to customers and how the system behaves.
                   </p>
                   <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                     <li>• Store name appears in emails and receipts</li>
                     <li>• Currency affects all pricing displays</li>
                     <li>• Language sets the default for new users</li>
                     <li>• Date/time formats affect order displays</li>
                   </ul>
                 </div>
               </div>
             </div>
            </div>
         </div>
       </div>
     </AdminLayout>
  );
};

export default GeneralSettings;
