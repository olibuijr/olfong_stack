import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Shield,
  Bell,
  CreditCard,
  Truck,
  AlertTriangle,
  Key,
  Server,
  Wifi,
  Download,
  Trash2,
  Percent,
  Info,
  Plus,
  Building,
  X
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);





  const [paymentGateways, setPaymentGateways] = useState([]);


  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editingGatewayData, setEditingGatewayData] = useState({});
  const [integrations, setIntegrations] = useState([]);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [editingIntegrationData, setEditingIntegrationData] = useState({});

  const [shippingOptions, setShippingOptions] = useState([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingShippingData, setEditingShippingData] = useState({});

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      storeName: 'Ölföng',
      storeDescription: 'Icelandic wine and beer shop with home delivery',
      storeEmail: 'info@olfong.is',
      storePhone: '+354 555 1234',
      storeAddress: 'Laugavegur 123, 101 Reykjavík, Iceland',
      timezone: 'Atlantic/Reykjavik',
      currency: 'ISK',
      language: 'is',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    business: {
      openingHours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '12:00', close: '24:00', closed: false },
        sunday: { open: '12:00', close: '24:00', closed: false }
      },
      delivery: {
        enabled: true,
        freeDeliveryThreshold: 5000,
        deliveryFee: 500,
        deliveryRadius: 50,
        estimatedDeliveryTime: 60
      },
      taxes: {
        vatRate: 24,
        includeVatInPrices: true
      },
      ageRestriction: {
        enabled: true,
        nicotineAge: 18,
        alcoholNicotineAge: 20,
        generalProducts: 0
      }
    },
    vat: {
      enabled: true,
      rate: 24,
      country: 'IS',
      displayInAdmin: true,
      includeInCustomerPrice: true,
      showVatBreakdown: false
    },
    notifications: {
      email: {
        enabled: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@olfong.is',
        smtpPassword: '',
        fromName: 'Ölföng',
        fromEmail: 'noreply@olfong.is'
      },
      sms: {
        enabled: false,
        provider: 'twilio',
        apiKey: '',
        apiSecret: '',
        fromNumber: ''
      },
      push: {
        enabled: true,
        firebaseConfig: ''
      }
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: [],
      failedLoginAttempts: 5,
      lockoutDuration: 15
    },
    integration: {
      payment: {
        stripe: {
          enabled: true,
          publicKey: 'pk_test_...',
          secretKey: 'sk_test_...',
          webhookSecret: 'whsec_...'
        },
        paypal: {
          enabled: false,
          clientId: '',
          clientSecret: ''
        }
      },
      shipping: {
        dhl: {
          enabled: false,
          apiKey: '',
          apiSecret: ''
        },
        posturinn: {
          enabled: true,
          apiKey: '',
          apiSecret: ''
        }
      },
      analytics: {
        googleAnalytics: {
          enabled: true,
          trackingId: 'GA-XXXXX-X'
        },
        facebookPixel: {
          enabled: false,
          pixelId: ''
        }
      }
    },
    maintenance: {
      mode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please try again later.',
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      logLevel: 'info',
      maxLogSize: 100
    }
  });


  // Settings categories configuration
  const settingsCategories = [
    {
      title: t('adminSettings.storeSettings'),
      description: t('adminSettings.storeSettingsDescription'),
      tabs: [
        { id: 'general', name: t('adminSettings.general'), icon: SettingsIcon, description: t('adminSettings.generalDescription') },
        { id: 'business', name: t('adminSettings.business'), icon: Building, description: t('adminSettings.businessDescription') },
        { id: 'shipping', name: t('adminSettings.shipping'), icon: Truck, description: t('adminSettings.shippingDescription') },
        { id: 'vat', name: t('adminSettings.vat'), icon: Percent, description: t('adminSettings.vatDescription') }
      ]
    },
    {
      title: t('adminSettings.securityAndAccess'),
      description: t('adminSettings.securityAndAccessDescription'),
      tabs: [
        { id: 'security', name: t('adminSettings.security'), icon: Shield, description: t('adminSettings.securityDescription') },
        { id: 'api-keys', name: t('adminSettings.apiKeys'), icon: Key, description: t('adminSettings.apiKeysDescription') }
      ]
    },
    {
      title: t('adminSettings.integrations'),
      description: t('adminSettings.integrationsDescription'),
      tabs: [
        { id: 'payment-gateways', name: t('adminSettings.paymentGateways'), icon: CreditCard, description: t('adminSettings.paymentGatewayDescription') },
        { id: 'integration', name: t('adminSettings.integrations'), icon: Wifi, description: t('adminSettings.integrationsDescription') },
        { id: 'notifications', name: t('adminSettings.notifications'), icon: Bell, description: t('adminSettings.notificationsDescription') }
      ]
    },
    {
      title: t('adminSettings.system'),
      description: t('adminSettings.systemDescription'),
      tabs: [
        { id: 'maintenance', name: t('adminSettings.maintenance'), icon: Server, description: t('adminSettings.maintenanceDescription') }
      ]
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load API keys
      const apiKeysResponse = await fetch('/api/settings?category=API_KEYS', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (apiKeysResponse.ok) {
        const data = await apiKeysResponse.json();
        const apiKeysData = {};
        data.data.settings.API_KEYS?.forEach(setting => {
          apiKeysData[setting.key] = setting.value || '';
        });

      }

      // Load payment gateways
      const gatewaysResponse = await fetch('/api/payment-gateways', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (gatewaysResponse.ok) {
        const data = await gatewaysResponse.json();
        setPaymentGateways(data.data.gateways || []);
      }

      // Load integrations
      const integrationsResponse = await fetch('/api/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (integrationsResponse.ok) {
        const data = await integrationsResponse.json();
        setIntegrations(data.data.integrations || []);
      }

      // Load shipping options
      const shippingResponse = await fetch('/api/shipping/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (shippingResponse.ok) {
        const data = await shippingResponse.json();
        setShippingOptions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('adminLabels.accessDenied')}</h1>
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

  const handleShippingToggle = async (shippingId, isEnabled) => {
    try {
      const response = await fetch(`/api/shipping/${shippingId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isEnabled })
      });

      if (response.ok) {
        setShippingOptions(prev =>
          prev.map(option =>
            option.id === shippingId
              ? { ...option, isEnabled }
              : option
          )
        );
        toast.success(`Shipping option ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to toggle shipping option');
      }
    } catch (error) {
      console.error('Error toggling shipping option:', error);
      toast.error('Failed to toggle shipping option');
    }
  };

  const handleShippingUpdate = async (shippingId, updateData) => {
    try {
      const response = await fetch(`/api/shipping/${shippingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setShippingOptions(prev =>
          prev.map(option =>
            option.id === shippingId
              ? data.data.shippingOption
              : option
          )
        );
        setShowShippingModal(false);
        setEditingShippingData({});
        toast.success('Shipping option updated successfully');
      } else {
        throw new Error('Failed to update shipping option');
      }
    } catch (error) {
      console.error('Error updating shipping option:', error);
      toast.error('Failed to update shipping option');
    }
  };

  const handleShippingCreate = async (createData) => {
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const data = await response.json();
        setShippingOptions(prev => [...prev, data.data.shippingOption]);
        setShowShippingModal(false);
        setEditingShippingData({});
        toast.success('Shipping option created successfully');
      } else {
        throw new Error('Failed to create shipping option');
      }
    } catch (error) {
      console.error('Error creating shipping option:', error);
      toast.error('Failed to create shipping option');
    }
  };

  const handleShippingDelete = async (shippingId) => {
    if (!window.confirm(t('adminSettings.confirmDeleteShipping'))) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping/${shippingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setShippingOptions(prev => prev.filter(option => option.id !== shippingId));
        toast.success('Shipping option deleted successfully');
      } else {
        throw new Error('Failed to delete shipping option');
      }
    } catch (error) {
      console.error('Error deleting shipping option:', error);
      toast.error('Failed to delete shipping option');
    }
  };

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.shippingConfiguration')}</p>
            <p>{t('adminSettings.shippingDescription')}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <button
          onClick={() => {
            setEditingShippingData({});
            setShowShippingModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('adminSettings.addShippingOption')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shippingOptions.map((option) => (
          <div key={option.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {option.nameIs}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleShippingDelete(option.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title={t('adminSettings.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={option.isEnabled}
                    onChange={(e) => handleShippingToggle(option.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {option.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 leading-relaxed italic">
              {option.descriptionIs}
            </p>

            {/* Price and Type */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${option.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {option.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {option.fee} ISK
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {option.type}
                </div>
              </div>
            </div>



            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingShippingData(option);
                  setShowShippingModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.edit')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {shippingOptions.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.noShippingOptions')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('adminSettings.noShippingOptionsDescription')}</p>
          <button
            onClick={() => {
              setEditingShippingData({});
              setShowShippingModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('adminSettings.addFirstShippingOption')}
          </button>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.shippingNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.shippingNote1')}</li>
              <li>{t('adminSettings.shippingNote2')}</li>
              <li>{t('adminSettings.shippingNote3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // General settings form
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <SettingsIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.generalSettings')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('adminSettings.storeName')}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.storeName')}
              </label>
              <input
                type="text"
                value={settings.general.storeName}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, storeName: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminSettings.storeName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.storeEmail')}
              </label>
              <input
                type="email"
                value={settings.general.storeEmail}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, storeEmail: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminSettings.storeEmail')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.phoneNumber')}
              </label>
              <input
                type="tel"
                value={settings.general.storePhone}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, storePhone: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminSettings.phoneNumber')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.storeAddress')}
              </label>
              <textarea
                value={settings.general.storeAddress}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, storeAddress: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('adminSettings.storeAddress')}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('adminSettings.configureGeneral')}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.currency')}
              </label>
              <select
                value={settings.general.currency}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, currency: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ISK">{t('adminSettings.currencyISK')}</option>
                <option value="USD">{t('adminSettings.currencyUSD')}</option>
                <option value="EUR">{t('adminSettings.currencyEUR')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.language')}
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, language: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="is">{t('adminSettings.languageIcelandic')}</option>
                <option value="en">{t('adminSettings.languageEnglish')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.dateFormat')}
              </label>
              <select
                value={settings.general.dateFormat}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, dateFormat: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="DD/MM/YYYY">{t('adminSettings.dateFormatDDMMYYYY')}</option>
                <option value="MM/DD/YYYY">{t('adminSettings.dateFormatMMDDYYYY')}</option>
                <option value="YYYY-MM-DD">{t('adminSettings.dateFormatYYYYMMDD')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('adminSettings.timeFormat')}
              </label>
              <select
                value={settings.general.timeFormat}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, timeFormat: e.target.value }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="24h">{t('adminSettings.timeFormat24h')}</option>
                <option value="12h">{t('adminSettings.timeFormat12h')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('adminSettings.storeDescription')}
          </label>
          <textarea
            value={settings.general.storeDescription}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                general: { ...prev.general, storeDescription: e.target.value }
              }));
              setHasUnsavedChanges(true);
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('adminSettings.storeDescription')}
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Building className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.businessSettings')}</h3>
        </div>

        {/* Opening Hours */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            {t('adminSettings.openingHours')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(settings.business.openingHours).map(([day, hours]) => (
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
                        business: {
                          ...prev.business,
                          openingHours: {
                            ...prev.business.openingHours,
                            [day]: { ...hours, open: e.target.value }
                          }
                        }
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    disabled={hours.closed}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <span className="text-gray-500 dark:text-gray-400">{t('adminSettings.to')}</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          openingHours: {
                            ...prev.business.openingHours,
                            [day]: { ...hours, close: e.target.value }
                          }
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
                          business: {
                            ...prev.business,
                            openingHours: {
                              ...prev.business.openingHours,
                              [day]: { ...hours, closed: e.target.checked }
                            }
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('adminSettings.closed')}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            {t('adminSettings.deliverySettings')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDelivery"
                  checked={settings.business.delivery.enabled}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        delivery: { ...prev.business.delivery, enabled: e.target.checked }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="enableDelivery" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('adminSettings.enableDelivery')}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.deliveryFee')} (kr)
                </label>
                <input
                  type="number"
                  value={settings.business.delivery.deliveryFee}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        delivery: { ...prev.business.delivery, deliveryFee: parseInt(e.target.value) || 0 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.delivery.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.freeDeliveryThreshold')} (kr)
                </label>
                <input
                  type="number"
                  value={settings.business.delivery.freeDeliveryThreshold}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        delivery: { ...prev.business.delivery, freeDeliveryThreshold: parseInt(e.target.value) || 0 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.delivery.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.deliveryRadius')} (km)
                </label>
                <input
                  type="number"
                  value={settings.business.delivery.deliveryRadius}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        delivery: { ...prev.business.delivery, deliveryRadius: parseInt(e.target.value) || 0 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.delivery.enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  {t('adminSettings.deliverySettings')}
                </h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {t('adminSettings.enableDelivery')} delivery service</li>
                  <li>• Set delivery fees and free delivery thresholds</li>
                  <li>• Define delivery radius for geographic restrictions</li>
                  <li>• All settings are automatically applied to checkout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Age Restriction */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            {t('adminSettings.ageRestriction')}
          </h4>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAgeRestriction"
                checked={settings.business.ageRestriction.enabled}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    business: {
                      ...prev.business,
                      ageRestriction: { ...prev.business.ageRestriction, enabled: e.target.checked }
                    }
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="enableAgeRestriction" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('adminSettings.enableAgeRestriction')}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.nicotineProducts')} ({t('adminSettings.years')})
                </label>
                <input
                  type="number"
                  value={settings.business.ageRestriction.nicotineAge}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        ageRestriction: { ...prev.business.ageRestriction, nicotineAge: parseInt(e.target.value) || 18 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.ageRestriction.enabled}
                  min="0"
                  max="25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminSettings.nicotineAgeDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.alcoholNicotineProducts')} ({t('adminSettings.years')})
                </label>
                <input
                  type="number"
                  value={settings.business.ageRestriction.alcoholNicotineAge}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        ageRestriction: { ...prev.business.ageRestriction, alcoholNicotineAge: parseInt(e.target.value) || 20 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.ageRestriction.enabled}
                  min="0"
                  max="25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminSettings.alcoholNicotineAgeDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminSettings.generalProducts')} ({t('adminSettings.years')})
                </label>
                <input
                  type="number"
                  value={settings.business.ageRestriction.generalProducts}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        ageRestriction: { ...prev.business.ageRestriction, generalProducts: parseInt(e.target.value) || 0 }
                      }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.business.ageRestriction.enabled}
                  min="0"
                  max="25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('adminSettings.generalProductsDescription')}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                {t('adminSettings.ageRestrictionNotice')}
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('adminSettings.ageRestrictionDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVatSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                  checked={settings.vat.enabled}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      vat: { ...prev.vat, enabled: e.target.checked }
                    }));
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
                  value={settings.vat.rate}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      vat: { ...prev.vat, rate: parseFloat(e.target.value) || 0 }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.vat.enabled}
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
                  value={settings.vat.country}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      vat: { ...prev.vat, country: e.target.value }
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  disabled={!settings.vat.enabled}
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
                checked={settings.vat.displayInAdmin}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    vat: { ...prev.vat, displayInAdmin: e.target.checked }
                  }));
                  setHasUnsavedChanges(true);
                }}
                disabled={!settings.vat.enabled}
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
                checked={settings.vat.includeInCustomerPrice}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    vat: { ...prev.vat, includeInCustomerPrice: e.target.checked }
                  }));
                  setHasUnsavedChanges(true);
                }}
                disabled={!settings.vat.enabled}
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
                checked={settings.vat.showVatBreakdown}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    vat: { ...prev.vat, showVatBreakdown: e.target.checked }
                  }));
                  setHasUnsavedChanges(true);
                }}
                disabled={!settings.vat.enabled}
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
      </div>
    </div>
  );

  const renderApiKeysSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.apiKeys')}</h3>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {t('adminSettings.apiKeysConfiguration')}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('adminSettings.apiKeysDescription')}
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
                    {t('adminSettings.unsplashApiKey')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.unsplashDevelopers')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-green-600 dark:text-green-400 mr-2">●</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <input
                type="password"
                placeholder={t('adminSettings.enterUnsplashApiKey')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                {t('adminSettings.save')}
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
                    {t('adminSettings.pexelsApiKey')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.pexelsApi')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">●</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <input
                type="password"
                placeholder={t('adminSettings.enterPexelsApiKey')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                {t('adminSettings.save')}
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
                    {t('adminSettings.pixabayApiKey')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.pixabayApi')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">●</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <input
                type="password"
                placeholder={t('adminSettings.enterPixabayApiKey')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                {t('adminSettings.save')}
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
                    {t('adminSettings.googleApiKey')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.googleCloudConsole')}
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
                <input
                  type="password"
                  placeholder={t('adminSettings.enterGoogleApiKey')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  {t('adminSettings.save')}
                </button>
              </div>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder={t('adminSettings.enterGoogleSearchEngineId')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  {t('adminSettings.test')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
            {t('adminSettings.importantNotes')}
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• {t('adminSettings.apiKeysImportantNote1')}</li>
            <li>• {t('adminSettings.apiKeysImportantNote2')}</li>
            <li>• {t('adminSettings.apiKeysImportantNote3')}</li>
            <li>• {t('adminSettings.apiKeysImportantNote4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.notifications')}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t('adminSettings.notificationsComingSoon')}</p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.security')}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t('adminSettings.securityComingSoon')}</p>
      </div>
    </div>
  );

  const handleGatewayToggle = async (gatewayId, isEnabled) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isEnabled })
      });

      if (response.ok) {
        setPaymentGateways(prev =>
          prev.map(gateway =>
            gateway.id === gatewayId
              ? { ...gateway, isEnabled }
              : gateway
          )
        );
        toast.success(`Payment gateway ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to toggle payment gateway');
      }
    } catch (error) {
      console.error('Error toggling payment gateway:', error);
      toast.error('Failed to toggle payment gateway');
    }
  };

  const handleGatewayUpdate = async (gatewayId, updateData) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentGateways(prev =>
          prev.map(gateway =>
            gateway.id === gatewayId
              ? data.data.gateway
              : gateway
          )
        );
        setShowGatewayModal(false);
        setEditingGatewayData({});
        toast.success('Payment gateway updated successfully');
      } else {
        throw new Error('Failed to update payment gateway');
      }
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast.error('Failed to update payment gateway');
    }
  };

  const handleGatewayCreate = async (createData) => {
    try {
      const response = await fetch('/api/payment-gateways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentGateways(prev => [...prev, data.data.gateway]);
        setShowGatewayModal(false);
        setEditingGatewayData({});
        toast.success('Payment gateway created successfully');
      } else {
        throw new Error('Failed to create payment gateway');
      }
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      toast.error('Failed to create payment gateway');
    }
  };

  const handleGatewayDelete = async (gatewayId) => {
    if (!window.confirm(t('adminSettings.confirmDeleteGateway'))) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setPaymentGateways(prev => prev.filter(gateway => gateway.id !== gatewayId));
        toast.success('Payment gateway deleted successfully');
      } else {
        throw new Error('Failed to delete payment gateway');
      }
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      toast.error('Failed to delete payment gateway');
    }
  };

  const handleGatewayTest = async (gatewayId) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Payment gateway test successful');
      } else {
        const errorData = await response.json();
        toast.error(`Payment gateway test failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      toast.error('Failed to test payment gateway');
    }
  };

  const renderPaymentGateways = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.paymentGatewayConfiguration')}</p>
            <p>{t('adminSettings.paymentGatewayDescription')}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <button
          onClick={() => {
            setEditingGatewayData({});
            setShowGatewayModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('adminSettings.addPaymentGateway')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paymentGateways.map((gateway) => (
          <div key={gateway.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {gateway.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {gateway.provider}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleGatewayTest(gateway.id)}
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  title={t('adminSettings.testConnection')}
                >
                  <Wifi className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleGatewayDelete(gateway.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title={t('adminSettings.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateway.isEnabled}
                    onChange={(e) => handleGatewayToggle(gateway.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {gateway.description}
            </p>

            {/* Environment and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${gateway.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {gateway.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {gateway.environment}
                </div>
              </div>
            </div>

            {/* Supported Methods */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t('adminSettings.supportedMethods')}:
              </div>
              <div className="flex flex-wrap gap-1">
                {gateway.supportedMethods?.slice(0, 4).map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    {method}
                  </span>
                ))}
                {gateway.supportedMethods?.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                    +{gateway.supportedMethods.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingGatewayData(gateway);
                  setShowGatewayModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.edit')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {paymentGateways.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.noPaymentGateways')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('adminSettings.noPaymentGatewaysDescription')}</p>
          <button
            onClick={() => {
              setEditingGatewayData({});
              setShowGatewayModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('adminSettings.addFirstPaymentGateway')}
          </button>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.paymentGatewayNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.paymentGatewayNote1')}</li>
              <li>{t('adminSettings.paymentGatewayNote2')}</li>
              <li>{t('adminSettings.paymentGatewayNote3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const handleIntegrationToggle = async (integrationId, isEnabled) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isEnabled })
      });

      if (response.ok) {
        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === integrationId
              ? { ...integration, isEnabled }
              : integration
          )
        );
        toast.success(`Integration ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to toggle integration');
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to toggle integration');
    }
  };

  const handleIntegrationUpdate = async (integrationId, updateData) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === integrationId
              ? data.data.integration
              : integration
          )
        );
        setShowIntegrationModal(false);
        setEditingIntegrationData({});
        toast.success('Integration updated successfully');
      } else {
        throw new Error('Failed to update integration');
      }
    } catch (error) {
      console.error('Error updating integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const handleIntegrationCreate = async (createData) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(prev => [...prev, data.data.integration]);
        setShowIntegrationModal(false);
        setEditingIntegrationData({});
        toast.success('Integration created successfully');
      } else {
        throw new Error('Failed to create integration');
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    }
  };

  const handleIntegrationDelete = async (integrationId) => {
    if (!window.confirm(t('adminSettings.confirmDeleteIntegration'))) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
        toast.success('Integration deleted successfully');
      } else {
        throw new Error('Failed to delete integration');
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const handleIntegrationTest = async (integrationId) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Integration test successful');
      } else {
        const errorData = await response.json();
        toast.error(`Integration test failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Failed to test integration');
    }
  };

  const handleIntegrationSync = async (integrationId) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Integration sync started successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Integration sync failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast.error('Failed to sync integration');
    }
  };

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.integrationConfiguration')}</p>
            <p>{t('adminSettings.integrationDescription')}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <button
          onClick={() => {
            setEditingIntegrationData({});
            setShowIntegrationModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('adminSettings.addIntegration')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {integration.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {integration.provider}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleIntegrationSync(integration.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title={t('adminSettings.syncData')}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleIntegrationTest(integration.id)}
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  title={t('adminSettings.testConnection')}
                >
                  <Wifi className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleIntegrationDelete(integration.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title={t('adminSettings.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={(e) => handleIntegrationToggle(integration.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {integration.description}
            </p>

            {/* Environment and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${integration.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {integration.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {integration.environment}
                </div>
                {integration.lastSync && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('adminSettings.lastSync')}: {new Date(integration.lastSync).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingIntegrationData(integration);
                  setShowIntegrationModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.edit')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-12">
          <Wifi className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.noIntegrations')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('adminSettings.noIntegrationsDescription')}</p>
          <button
            onClick={() => {
              setEditingIntegrationData({});
              setShowIntegrationModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('adminSettings.addFirstIntegration')}
          </button>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.integrationNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.integrationNote1')}</li>
              <li>{t('adminSettings.integrationNote2')}</li>
              <li>{t('adminSettings.integrationNote3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Server className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.maintenance')}</h3>
        <p className="text-gray-600 dark:text-gray-400">{t('adminSettings.maintenanceComingSoon')}</p>
      </div>
    </div>
  );



  // Modal functions
  const renderGatewayEditModal = () => {
    if (!showGatewayModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingGatewayData.id ? t('adminSettings.editPaymentGateway') : t('adminSettings.addPaymentGateway')}
              </h3>
              <button
                onClick={() => {
                  setShowGatewayModal(false);
                  setEditingGatewayData({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());

              if (editingGatewayData.id) {
                handleGatewayUpdate(editingGatewayData.id, data);
              } else {
                handleGatewayCreate(data);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.gatewayName')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingGatewayData.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.displayName')}
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={editingGatewayData.displayName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.provider')}
                  </label>
                  <input
                    type="text"
                    name="provider"
                    defaultValue={editingGatewayData.provider || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.environment')}
                  </label>
                  <select
                    name="environment"
                    defaultValue={editingGatewayData.environment || 'sandbox'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.description')}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingGatewayData.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatewayModal(false);
                    setEditingGatewayData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  {t('adminSettings.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingGatewayData.id ? t('adminSettings.update') : t('adminSettings.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationEditModal = () => {
    if (!showIntegrationModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingIntegrationData.id ? t('adminSettings.editIntegration') : t('adminSettings.addIntegration')}
              </h3>
              <button
                onClick={() => {
                  setShowIntegrationModal(false);
                  setEditingIntegrationData({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());

              if (editingIntegrationData.id) {
                handleIntegrationUpdate(editingIntegrationData.id, data);
              } else {
                handleIntegrationCreate(data);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.integrationName')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingIntegrationData.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.displayName')}
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={editingIntegrationData.displayName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.provider')}
                  </label>
                  <input
                    type="text"
                    name="provider"
                    defaultValue={editingIntegrationData.provider || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.baseUrl')}
                  </label>
                  <input
                    type="url"
                    name="baseUrl"
                    defaultValue={editingIntegrationData.baseUrl || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.environment')}
                  </label>
                  <select
                    name="environment"
                    defaultValue={editingIntegrationData.environment || 'sandbox'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.description')}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingIntegrationData.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowIntegrationModal(false);
                    setEditingIntegrationData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  {t('adminSettings.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingIntegrationData.id ? t('adminSettings.update') : t('adminSettings.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderShippingEditModal = () => {
    if (!showShippingModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingShippingData.id ? t('adminSettings.editShippingOption') : t('adminSettings.addShippingOption')}
              </h3>
              <button
                onClick={() => {
                  setShowShippingModal(false);
                  setEditingShippingData({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());

              // Convert fee to number
              data.fee = parseFloat(data.fee) || 0;
              data.estimatedDays = parseInt(data.estimatedDays) || 1;
              data.sortOrder = parseInt(data.sortOrder) || 0;

              if (editingShippingData.id) {
                handleShippingUpdate(editingShippingData.id, data);
              } else {
                handleShippingCreate(data);
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings.shippingName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingShippingData.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings.shippingNameIs')}
                    </label>
                    <input
                      type="text"
                      name="nameIs"
                      defaultValue={editingShippingData.nameIs || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.shippingType')}
                  </label>
                  <select
                    name="type"
                    defaultValue={editingShippingData.type || 'DELIVERY'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP">Pickup</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings.fee')} (ISK)
                    </label>
                    <input
                      type="number"
                      name="fee"
                      defaultValue={editingShippingData.fee || 0}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings.estimatedDays')}
                    </label>
                    <input
                      type="number"
                      name="estimatedDays"
                      defaultValue={editingShippingData.estimatedDays || 1}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings.sortOrder')}
                    </label>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={editingShippingData.sortOrder || 0}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.cutoffTime')}
                  </label>
                  <input
                    type="time"
                    name="cutoffTime"
                    defaultValue={editingShippingData.cutoffTime || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.description')}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingShippingData.description || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.descriptionIs')}
                  </label>
                  <textarea
                    name="descriptionIs"
                    defaultValue={editingShippingData.descriptionIs || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowShippingModal(false);
                    setEditingShippingData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  {t('adminSettings.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingShippingData.id ? t('adminSettings.update') : t('adminSettings.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Placeholder handler functions
  const handleSaveSettings = async () => {
    try {
      // Prepare settings for API - combine all categories
      const settingsToSave = [
        // General Settings
        { key: 'storeName', value: settings.general.storeName, category: 'GENERAL', description: 'Store name' },
        { key: 'storeDescription', value: settings.general.storeDescription, category: 'GENERAL', description: 'Store description' },
        { key: 'storeEmail', value: settings.general.storeEmail, category: 'GENERAL', description: 'Store email' },
        { key: 'storePhone', value: settings.general.storePhone, category: 'GENERAL', description: 'Store phone number' },
        { key: 'storeAddress', value: settings.general.storeAddress, category: 'GENERAL', description: 'Store address' },
        { key: 'currency', value: settings.general.currency, category: 'GENERAL', description: 'Store currency' },
        { key: 'language', value: settings.general.language, category: 'GENERAL', description: 'Default language' },
        { key: 'dateFormat', value: settings.general.dateFormat, category: 'GENERAL', description: 'Date format' },
        { key: 'timeFormat', value: settings.general.timeFormat, category: 'GENERAL', description: 'Time format' },

        // Business Settings
        { key: 'openingHours', value: JSON.stringify(settings.business.openingHours), category: 'BUSINESS', description: 'Store opening hours' },
        { key: 'deliveryEnabled', value: settings.business.delivery.enabled.toString(), category: 'BUSINESS', description: 'Delivery service enabled' },
        { key: 'deliveryFee', value: settings.business.delivery.deliveryFee.toString(), category: 'BUSINESS', description: 'Delivery fee' },
        { key: 'freeDeliveryThreshold', value: settings.business.delivery.freeDeliveryThreshold.toString(), category: 'BUSINESS', description: 'Free delivery threshold' },
        { key: 'deliveryRadius', value: settings.business.delivery.deliveryRadius.toString(), category: 'BUSINESS', description: 'Delivery radius' },
        { key: 'ageRestrictionEnabled', value: settings.business.ageRestriction.enabled.toString(), category: 'BUSINESS', description: 'Age restriction enabled' },
        { key: 'nicotineAge', value: settings.business.ageRestriction.nicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for nicotine products' },
        { key: 'alcoholNicotineAge', value: settings.business.ageRestriction.alcoholNicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for alcohol and nicotine products' },
        { key: 'generalProductsAge', value: settings.business.ageRestriction.generalProducts.toString(), category: 'BUSINESS', description: 'Minimum age for general products' },

        // VAT Settings
        { key: 'vatEnabled', value: settings.vat.enabled.toString(), category: 'VAT', description: 'VAT enabled' },
        { key: 'vatRate', value: settings.vat.rate.toString(), category: 'VAT', description: 'VAT rate' },
        { key: 'vatCountry', value: settings.vat.country, category: 'VAT', description: 'VAT country' },
        { key: 'vatDisplayInAdmin', value: settings.vat.displayInAdmin.toString(), category: 'VAT', description: 'Show VAT in admin' },
        { key: 'vatIncludeInCustomerPrice', value: settings.vat.includeInCustomerPrice.toString(), category: 'VAT', description: 'Include VAT in customer price' },
        { key: 'vatShowBreakdown', value: settings.vat.showVatBreakdown.toString(), category: 'VAT', description: 'Show VAT breakdown' }
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

      toast.success(t('adminSettings.settingsSaved'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    if (window.confirm(t('adminSettings.confirmReset'))) {
      // Reset logic would go here
      toast.success(t('adminSettings.settingsReset'));
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings.settings')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminSettings.manageSystemSettings')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('adminSettings.saveChanges')}
            </button>
            <button
              onClick={handleResetSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('adminSettings.resetToDefaults')}
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('adminSettings.backupSettings')}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="space-y-8">
        {settingsCategories.map((category) => (
          <div key={category.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Category Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label={`${category.title} tabs`}>
                {category.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      title={tab.description}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Tab Content */}
            <div className="p-6">
              {category.tabs.some(tab => tab.id === activeTab) && (
                <>
                  {activeTab === 'general' && renderGeneralSettings()}
                  {activeTab === 'business' && renderBusinessSettings()}
                  {activeTab === 'shipping' && renderShippingSettings()}
                  {activeTab === 'vat' && renderVatSettings()}
                  {activeTab === 'api-keys' && renderApiKeysSettings()}
                  {activeTab === 'notifications' && renderNotificationsSettings()}
                  {activeTab === 'security' && renderSecuritySettings()}
                  {activeTab === 'payment-gateways' && renderPaymentGateways()}
                  {activeTab === 'integration' && renderIntegrations()}
                  {activeTab === 'maintenance' && renderMaintenanceSettings()}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {renderGatewayEditModal()}
      {renderIntegrationEditModal()}
      {renderShippingEditModal()}
    </AdminLayout>
  );
};

export default Settings;
