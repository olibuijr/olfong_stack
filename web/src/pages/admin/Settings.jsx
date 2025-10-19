import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  User,
  Shield,
  Bell,
  Globe,
  Database,
  Mail,
  Phone,
  CreditCard,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Key,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Monitor,
  Smartphone,
  Lock,
  Unlock,
  Download,
  Upload,
  Trash2,
  Archive,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Percent,
  Hash,
  Star,
  Heart,
  Flag,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Edit,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [showGatewayKeys, setShowGatewayKeys] = useState({});
  const [editingGateway, setEditingGateway] = useState(null);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editingGatewayData, setEditingGatewayData] = useState({});
  const [integrations, setIntegrations] = useState([]);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [editingIntegrationData, setEditingIntegrationData] = useState({});
  const [showIntegrationKeys, setShowIntegrationKeys] = useState({});

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
        minimumAge: 20
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    lastBackup: '2025-01-13 14:30:00',
    databaseSize: '2.4 GB',
    diskUsage: '45%',
    memoryUsage: '67%',
    uptime: '7 days, 14 hours',
    activeUsers: 23,
    totalOrders: 1247,
    totalProducts: 89
  });

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
        setApiKeys(apiKeysData);
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
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleNestedSettingChange = (section, subSection, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [key]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleApiKeyChange = (key, value) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleGatewayKeyVisibility = (gatewayId, key) => {
    setShowGatewayKeys(prev => ({
      ...prev,
      [`${gatewayId}-${key}`]: !prev[`${gatewayId}-${key}`]
    }));
  };

  const handleGatewayChange = (gatewayId, field, value) => {
    setPaymentGateways(prev => 
      prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, [field]: value }
          : gateway
      )
    );
    setHasUnsavedChanges(true);
  };

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
        handleGatewayChange(gatewayId, 'isEnabled', isEnabled);
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
        setEditingGateway(null);
        setHasUnsavedChanges(false);
        toast.success('Payment gateway updated successfully');
      } else {
        throw new Error('Failed to update payment gateway');
      }
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast.error('Failed to update payment gateway');
    }
  };

  const testGatewayConnection = async (gatewayId) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.testResult.success) {
          toast.success(data.data.testResult.message);
        } else {
          toast.error(data.data.testResult.message);
        }
      } else {
        throw new Error('Failed to test payment gateway');
      }
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      toast.error('Failed to test payment gateway connection');
    }
  };

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
        setHasUnsavedChanges(false);
        toast.success('Integration updated successfully');
      } else {
        throw new Error('Failed to update integration');
      }
    } catch (error) {
      console.error('Error updating integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const testIntegrationConnection = async (integrationId) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.testResult.success) {
          toast.success(data.data.testResult.message);
        } else {
          toast.error(data.data.testResult.message);
        }
      } else {
        throw new Error('Failed to test integration');
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Failed to test integration connection');
    }
  };

  const toggleIntegrationKeyVisibility = (integrationId, key) => {
    setShowIntegrationKeys(prev => ({
      ...prev,
      [`${integrationId}-${key}`]: !prev[`${integrationId}-${key}`]
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save API keys
      const apiKeySettings = Object.entries(apiKeys).map(([key, value]) => ({
        key,
        value,
        category: 'API_KEYS',
        isEncrypted: true,
        isPublic: false
      }));

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: apiKeySettings })
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm(t('adminSettings.confirmReset'))) {
      // Reset to default settings
      toast.success(t('adminSettings.settingsReset'));
      setHasUnsavedChanges(false);
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('adminSettings.passwordsDoNotMatch'));
      return;
    }
    if (passwordData.newPassword.length < settings.security.passwordPolicy.minLength) {
      toast.error(t('adminSettings.passwordTooShort', { min: settings.security.passwordPolicy.minLength }));
      return;
    }
    
    // Simulate password change
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('adminSettings.passwordChanged'));
    }, 1000);
  };

  const handleBackup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowBackupModal(false);
      toast.success(t('adminSettings.backupCompleted'));
    }, 2000);
  };

  const tabs = [
    { id: 'general', name: t('adminSettings.general'), icon: SettingsIcon },
    { id: 'business', name: t('adminSettings.business'), icon: Building },
    { id: 'vat', name: t('adminSettings.vat'), icon: Percent },
    { id: 'api-keys', name: t('adminSettings.apiKeys'), icon: Key },
    { id: 'notifications', name: t('adminSettings.notifications'), icon: Bell },
    { id: 'security', name: t('adminSettings.security'), icon: Shield },
    { id: 'payment-gateways', name: t('adminSettings.paymentGateways'), icon: CreditCard },
    { id: 'integration', name: t('adminSettings.integrations'), icon: Globe },
    { id: 'maintenance', name: t('adminSettings.maintenance'), icon: Server }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.storeName')}</label>
          <input
            type="text"
            value={settings.general.storeName}
            onChange={(e) => handleSettingChange('general', 'storeName', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.storeEmail')}</label>
          <input
            type="email"
            value={settings.general.storeEmail}
            onChange={(e) => handleSettingChange('general', 'storeEmail', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.storeDescription')}</label>
        <textarea
          value={settings.general.storeDescription}
          onChange={(e) => handleSettingChange('general', 'storeDescription', e.target.value)}
          rows={3}
          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.phoneNumber')}</label>
          <input
            type="tel"
            value={settings.general.storePhone}
            onChange={(e) => handleSettingChange('general', 'storePhone', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.currency')}</label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="ISK">{t('adminSettings.currencyISK')}</option>
            <option value="USD">{t('adminSettings.currencyUSD')}</option>
            <option value="EUR">{t('adminSettings.currencyEUR')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.storeAddress')}</label>
        <textarea
          value={settings.general.storeAddress}
          onChange={(e) => handleSettingChange('general', 'storeAddress', e.target.value)}
          rows={2}
          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.language')}</label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="is">{t('adminSettings.languageIcelandic')}</option>
            <option value="en">{t('adminSettings.languageEnglish')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.dateFormat')}</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="DD/MM/YYYY">{t('adminSettings.dateFormatDDMMYYYY')}</option>
            <option value="MM/DD/YYYY">{t('adminSettings.dateFormatMMDDYYYY')}</option>
            <option value="YYYY-MM-DD">{t('adminSettings.dateFormatYYYYMMDD')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('adminSettings.timeFormat')}</label>
          <select
            value={settings.general.timeFormat}
            onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="24h">{t('adminSettings.timeFormat24h')}</option>
            <option value="12h">{t('adminSettings.timeFormat12h')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      {/* Opening Hours */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.openingHours')}</h3>
        <div className="space-y-3">
          {Object.entries(settings.business.openingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, { ...hours, closed: !e.target.checked })}
                    className="rounded mr-2"
                  />
                  <span className="capitalize">{day}</span>
                </label>
              </div>
              {!hours.closed && (
                <>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, { ...hours, open: e.target.value })}
                    className="input w-32"
                  />
                  <span>{t('adminSettings.to')}</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, { ...hours, close: e.target.value })}
                    className="input w-32"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.deliverySettings')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.business.delivery.enabled}
                onChange={(e) => handleNestedSettingChange('business', 'delivery', 'enabled', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.enableDelivery')}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.deliveryFee')}</label>
            <input
              type="number"
              value={settings.business.delivery.deliveryFee}
              onChange={(e) => handleNestedSettingChange('business', 'delivery', 'deliveryFee', parseInt(e.target.value))}
              className="input w-full"
              disabled={!settings.business.delivery.enabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.freeDeliveryThreshold')}</label>
            <input
              type="number"
              value={settings.business.delivery.freeDeliveryThreshold}
              onChange={(e) => handleNestedSettingChange('business', 'delivery', 'freeDeliveryThreshold', parseInt(e.target.value))}
              className="input w-full"
              disabled={!settings.business.delivery.enabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.deliveryRadius')}</label>
            <input
              type="number"
              value={settings.business.delivery.deliveryRadius}
              onChange={(e) => handleNestedSettingChange('business', 'delivery', 'deliveryRadius', parseInt(e.target.value))}
              className="input w-full"
              disabled={!settings.business.delivery.enabled}
            />
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.taxSettings')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.vatRate')} (%)</label>
            <input
              type="number"
              value={settings.business.taxes.vatRate}
              onChange={(e) => handleNestedSettingChange('business', 'taxes', 'vatRate', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.business.taxes.includeVatInPrices}
                onChange={(e) => handleNestedSettingChange('business', 'taxes', 'includeVatInPrices', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.includeVatInPrices')}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVatSettings = () => (
    <div className="space-y-6">
      {/* VAT Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('adminSettings.vatConfiguration')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.vatEnabled')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vat.enabled}
                onChange={(e) => handleSettingChange('vat', 'enabled', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.enableVat')}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.vatRate')} (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.vat.rate}
              onChange={(e) => handleSettingChange('vat', 'rate', parseFloat(e.target.value))}
              className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={!settings.vat.enabled}
            />
          </div>
        </div>
      </div>

      {/* VAT Display Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('adminSettings.vatDisplaySettings')}</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vat.displayInAdmin}
                onChange={(e) => handleSettingChange('vat', 'displayInAdmin', e.target.checked)}
                className="rounded mr-2"
                disabled={!settings.vat.enabled}
              />
              {t('adminSettings.showVatInAdmin')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-6 mt-1">
              {t('adminSettings.showVatInAdminDescription')}
            </p>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vat.includeInCustomerPrice}
                onChange={(e) => handleSettingChange('vat', 'includeInCustomerPrice', e.target.checked)}
                className="rounded mr-2"
                disabled={!settings.vat.enabled}
              />
              {t('adminSettings.includeVatInCustomerPrice')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-6 mt-1">
              {t('adminSettings.includeVatInCustomerPriceDescription')}
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vat.showVatBreakdown}
                onChange={(e) => handleSettingChange('vat', 'showVatBreakdown', e.target.checked)}
                className="rounded mr-2"
                disabled={!settings.vat.enabled}
              />
              {t('adminSettings.showVatBreakdown')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-6 mt-1">
              {t('adminSettings.showVatBreakdownDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* VAT Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.vatInformation')}</p>
            <p>{t('adminSettings.vatInformationDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiKeysSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('adminSettings.apiKeysConfiguration')}</p>
            <p>{t('adminSettings.apiKeysDescription')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Unsplash API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('adminSettings.unsplashApiKey')}
          </label>
          <div className="relative">
            <input
              type={showApiKeys.UNSPLASH_ACCESS_KEY ? 'text' : 'password'}
              value={apiKeys.UNSPLASH_ACCESS_KEY || ''}
              onChange={(e) => handleApiKeyChange('UNSPLASH_ACCESS_KEY', e.target.value)}
              placeholder={t('adminSettings.enterUnsplashApiKey')}
              className="input w-full pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toggleApiKeyVisibility('UNSPLASH_ACCESS_KEY')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKeys.UNSPLASH_ACCESS_KEY ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminSettings.getApiKeyFrom')} <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('adminSettings.unsplashDevelopers')}</a>
          </p>
        </div>

        {/* Pexels API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('adminSettings.pexelsApiKey')}
          </label>
          <div className="relative">
            <input
              type={showApiKeys.PEXELS_API_KEY ? 'text' : 'password'}
              value={apiKeys.PEXELS_API_KEY || ''}
              onChange={(e) => handleApiKeyChange('PEXELS_API_KEY', e.target.value)}
              placeholder={t('adminSettings.enterPexelsApiKey')}
              className="input w-full pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toggleApiKeyVisibility('PEXELS_API_KEY')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKeys.PEXELS_API_KEY ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminSettings.getApiKeyFrom')} <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('adminSettings.pexelsApi')}</a>
          </p>
        </div>

        {/* Pixabay API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('adminSettings.pixabayApiKey')}
          </label>
          <div className="relative">
            <input
              type={showApiKeys.PIXABAY_API_KEY ? 'text' : 'password'}
              value={apiKeys.PIXABAY_API_KEY || ''}
              onChange={(e) => handleApiKeyChange('PIXABAY_API_KEY', e.target.value)}
              placeholder={t('adminSettings.enterPixabayApiKey')}
              className="input w-full pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toggleApiKeyVisibility('PIXABAY_API_KEY')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKeys.PIXABAY_API_KEY ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminSettings.getApiKeyFrom')} <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('adminSettings.pixabayApi')}</a>
          </p>
        </div>

        {/* Google API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('adminSettings.googleApiKey')}
          </label>
          <div className="relative">
            <input
              type={showApiKeys.GOOGLE_API_KEY ? 'text' : 'password'}
              value={apiKeys.GOOGLE_API_KEY || ''}
              onChange={(e) => handleApiKeyChange('GOOGLE_API_KEY', e.target.value)}
              placeholder={t('adminSettings.enterGoogleApiKey')}
              className="input w-full pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toggleApiKeyVisibility('GOOGLE_API_KEY')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKeys.GOOGLE_API_KEY ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminSettings.getApiKeyFrom')} <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('adminSettings.googleCloudConsole')}</a>
          </p>
        </div>

        {/* Google Search Engine ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('adminSettings.googleSearchEngineId')}
          </label>
          <input
            type="text"
            value={apiKeys.GOOGLE_SEARCH_ENGINE_ID || ''}
            onChange={(e) => handleApiKeyChange('GOOGLE_SEARCH_ENGINE_ID', e.target.value)}
            placeholder={t('adminSettings.enterGoogleSearchEngineId')}
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminSettings.createCustomSearchEngine')} <a href="https://cse.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('adminSettings.googleCustomSearch')}</a>
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.importantNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.apiKeysImportantNote1')}</li>
              <li>{t('adminSettings.apiKeysImportantNote2')}</li>
              <li>{t('adminSettings.apiKeysImportantNote3')}</li>
              <li>{t('adminSettings.apiKeysImportantNote4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.passwordPolicy')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.minimumLength')}</label>
            <input
              type="number"
              value={settings.security.passwordPolicy.minLength}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.passwordPolicy.requireUppercase}
                onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.requireUppercase')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.passwordPolicy.requireLowercase}
                onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.requireLowercase')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.passwordPolicy.requireNumbers}
                onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.requireNumbers')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.passwordPolicy.requireSpecialChars}
                onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                className="rounded mr-2"
              />
              {t('adminSettings.requireSpecialChars')}
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.sessionSecurity')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.sessionTimeout')}</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSettings.failedLoginAttempts')}</label>
            <input
              type="number"
              value={settings.security.failedLoginAttempts}
              onChange={(e) => handleSettingChange('security', 'failedLoginAttempts', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.accountSecurity')}</h3>
        <div className="space-y-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Key className="h-4 w-4 mr-2" />
            {t('adminSettings.changePassword')}
          </button>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              className="rounded mr-2"
            />
            {t('adminSettings.enableTwoFactorAuth')}
          </label>
        </div>
      </div>
    </div>
  );

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

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {paymentGateways.map((gateway) => (
                 <div key={gateway.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
                   {/* Card Header */}
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center space-x-4">
                       {gateway.logoUrl && (
                         <div className="w-12 h-12 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                           <img
                             src={gateway.logoUrl}
                             alt={gateway.displayName}
                             className="w-8 h-8 object-contain"
                           />
                         </div>
                       )}
                       <div className="min-w-0 flex-1">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                           {gateway.displayName}
                         </h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                           {gateway.provider}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-3">
                       <button
                         onClick={() => testGatewayConnection(gateway.id)}
                         className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                         title={t('adminSettings.testConnection')}
                       >
                         <Wifi className="h-4 w-4" />
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

                   {/* Status and Environment */}
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${gateway.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         {gateway.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                       </span>
                     </div>
                     <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                       {gateway.environment}
                     </span>
                   </div>

                   {/* Supported Features Preview */}
                   <div className="mb-6">
                     <div className="flex flex-wrap gap-2">
                       {gateway.supportedCurrencies?.slice(0, 4).map((currency) => (
                         <span key={currency} className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                           {currency}
                         </span>
                       ))}
                       {gateway.supportedCurrencies?.length > 4 && (
                         <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                           +{gateway.supportedCurrencies.length - 4}
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
                       {t('adminSettings.editSettings')}
                     </button>
                     <button
                       onClick={() => testGatewayConnection(gateway.id)}
                       className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                     >
                       {t('adminSettings.test')}
                     </button>
                   </div>
                 </div>
               ))}
             </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.importantNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.paymentGatewayNote1')}</li>
              <li>{t('adminSettings.paymentGatewayNote2')}</li>
              <li>{t('adminSettings.paymentGatewayNote3')}</li>
              <li>{t('adminSettings.paymentGatewayNote4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {integration.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {integration.provider}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => testIntegrationConnection(integration.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title={t('adminSettings.testConnection')}
                >
                  <Wifi className="h-4 w-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={(e) => handleIntegrationToggle(integration.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {integration.description}
            </p>

            {/* Status and Environment */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${integration.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {integration.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                </span>
              </div>
              <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                {integration.environment}
              </span>
            </div>

            {/* Last Sync Info */}
            {integration.lastSync && (
              <div className="mb-4">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {integration.lastError && (
              <div className="mb-4">
                <div className="flex items-center text-xs text-red-500 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Error: {integration.lastError}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingIntegrationData(integration);
                  setShowIntegrationModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.configure')}
              </button>
              <button
                onClick={() => testIntegrationConnection(integration.id)}
                className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.test')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.integrationNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.integrationNote1')}</li>
              <li>{t('adminSettings.integrationNote2')}</li>
              <li>{t('adminSettings.integrationNote3')}</li>
              <li>{t('adminSettings.integrationNote4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationEditModal = () => (
    showIntegrationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('adminSettings.configureIntegration')} - {editingIntegrationData.displayName}
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

          <div className="p-6 space-y-6">
            {/* Basic Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('adminSettings.basicConfiguration')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.baseUrl')}
                  </label>
                  <input
                    type="url"
                    value={editingIntegrationData.baseUrl || ''}
                    onChange={(e) => setEditingIntegrationData({...editingIntegrationData, baseUrl: e.target.value})}
                    placeholder={t('adminPlaceholders.enterImageUrl')}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.environment')}
                  </label>
                  <select
                    value={editingIntegrationData.environment || 'sandbox'}
                    onChange={(e) => setEditingIntegrationData({...editingIntegrationData, environment: e.target.value})}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="sandbox">{t('adminSettings.sandbox')}</option>
                    <option value="production">{t('adminSettings.production')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* API Credentials */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('adminSettings.apiCredentials')}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.apiKey')}
                  </label>
                  <div className="relative">
                    <input
                      type={showIntegrationKeys[`${editingIntegrationData.id}-apiKey`] ? 'text' : 'password'}
                      value={editingIntegrationData.apiKey || ''}
                      onChange={(e) => setEditingIntegrationData({...editingIntegrationData, apiKey: e.target.value})}
                      placeholder={t('adminPlaceholders.enterApiKey')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleIntegrationKeyVisibility(editingIntegrationData.id, 'apiKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showIntegrationKeys[`${editingIntegrationData.id}-apiKey`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.secretKey')}
                  </label>
                  <div className="relative">
                    <input
                      type={showIntegrationKeys[`${editingIntegrationData.id}-secretKey`] ? 'text' : 'password'}
                      value={editingIntegrationData.secretKey || ''}
                      onChange={(e) => setEditingIntegrationData({...editingIntegrationData, secretKey: e.target.value})}
                      placeholder={t('adminPlaceholders.enterSecretKey')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleIntegrationKeyVisibility(editingIntegrationData.id, 'secretKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showIntegrationKeys[`${editingIntegrationData.id}-secretKey`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.companyId')}
                  </label>
                  <input
                    type="text"
                    value={editingIntegrationData.companyId || ''}
                    onChange={(e) => setEditingIntegrationData({...editingIntegrationData, companyId: e.target.value})}
                    placeholder={t('adminPlaceholders.enterCompanyId')}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.username')}
                  </label>
                  <input
                    type="text"
                    value={editingIntegrationData.username || ''}
                    onChange={(e) => setEditingIntegrationData({...editingIntegrationData, username: e.target.value})}
                    placeholder={t('adminPlaceholders.enterUsername')}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showIntegrationKeys[`${editingIntegrationData.id}-password`] ? 'text' : 'password'}
                      value={editingIntegrationData.password || ''}
                      onChange={(e) => setEditingIntegrationData({...editingIntegrationData, password: e.target.value})}
                      placeholder={t('adminPlaceholders.enterPassword')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleIntegrationKeyVisibility(editingIntegrationData.id, 'password')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showIntegrationKeys[`${editingIntegrationData.id}-password`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowIntegrationModal(false);
                setEditingIntegrationData({});
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {t('adminSettings.cancel')}
            </button>
            <button
              onClick={() => {
                handleIntegrationUpdate(editingIntegrationData.id, {
                  baseUrl: editingIntegrationData.baseUrl,
                  apiKey: editingIntegrationData.apiKey,
                  secretKey: editingIntegrationData.secretKey,
                  companyId: editingIntegrationData.companyId,
                  username: editingIntegrationData.username,
                  password: editingIntegrationData.password,
                  environment: editingIntegrationData.environment
                });
                setShowIntegrationModal(false);
                setEditingIntegrationData({});
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {t('adminSettings.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderGatewayEditModal = () => (
    showGatewayModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit {editingGatewayData.displayName} Settings
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

          <div className="p-6 space-y-6">
            {/* Basic Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('adminLabels.basicConfiguration')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.merchantId')}
                  </label>
                  <input
                    type="text"
                    value={editingGatewayData.merchantId || ''}
                    onChange={(e) => setEditingGatewayData({...editingGatewayData, merchantId: e.target.value})}
                    placeholder={t('adminPlaceholders.enterMerchantId')}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.environment')}
                  </label>
                  <select
                    value={editingGatewayData.environment || 'sandbox'}
                    onChange={(e) => setEditingGatewayData({...editingGatewayData, environment: e.target.value})}
                    className="input w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="sandbox">{t('adminSettings.sandbox')}</option>
                    <option value="production">{t('adminSettings.production')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* API Credentials */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('adminLabels.apiCredentials')}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.apiKey')}
                  </label>
                  <div className="relative">
                    <input
                      type={showGatewayKeys[`${editingGatewayData.id}-apiKey`] ? 'text' : 'password'}
                      value={editingGatewayData.apiKey || ''}
                      onChange={(e) => setEditingGatewayData({...editingGatewayData, apiKey: e.target.value})}
                      placeholder={t('adminPlaceholders.enterApiKey')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleGatewayKeyVisibility(editingGatewayData.id, 'apiKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showGatewayKeys[`${editingGatewayData.id}-apiKey`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.secretKey')}
                  </label>
                  <div className="relative">
                    <input
                      type={showGatewayKeys[`${editingGatewayData.id}-secretKey`] ? 'text' : 'password'}
                      value={editingGatewayData.secretKey || ''}
                      onChange={(e) => setEditingGatewayData({...editingGatewayData, secretKey: e.target.value})}
                      placeholder={t('adminPlaceholders.enterSecretKey')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleGatewayKeyVisibility(editingGatewayData.id, 'secretKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showGatewayKeys[`${editingGatewayData.id}-secretKey`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.webhookSecret')}
                  </label>
                  <div className="relative">
                    <input
                      type={showGatewayKeys[`${editingGatewayData.id}-webhookSecret`] ? 'text' : 'password'}
                      value={editingGatewayData.webhookSecret || ''}
                      onChange={(e) => setEditingGatewayData({...editingGatewayData, webhookSecret: e.target.value})}
                      placeholder={t('adminPlaceholders.enterWebhookSecret')}
                      className="input w-full pr-10 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleGatewayKeyVisibility(editingGatewayData.id, 'webhookSecret')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showGatewayKeys[`${editingGatewayData.id}-webhookSecret`] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Features */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('adminLabels.supportedFeatures')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('adminSettings.supportedCurrencies')}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {editingGatewayData.supportedCurrencies?.join(', ') || 'N/A'}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('adminSettings.supportedCountries')}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {editingGatewayData.supportedCountries?.slice(0, 3).join(', ')}
                    {editingGatewayData.supportedCountries?.length > 3 && ` +${editingGatewayData.supportedCountries.length - 3} more`}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('adminSettings.paymentMethods')}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {editingGatewayData.supportedMethods?.slice(0, 3).join(', ')}
                    {editingGatewayData.supportedMethods?.length > 3 && ` +${editingGatewayData.supportedMethods.length - 3} more`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowGatewayModal(false);
                setEditingGatewayData({});
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {t('adminSettings.cancel')}
            </button>
            <button
              onClick={() => {
                handleGatewayUpdate(editingGatewayData.id, {
                  merchantId: editingGatewayData.merchantId,
                  apiKey: editingGatewayData.apiKey,
                  secretKey: editingGatewayData.secretKey,
                  webhookSecret: editingGatewayData.webhookSecret,
                  environment: editingGatewayData.environment
                });
                setShowGatewayModal(false);
                setEditingGatewayData({});
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {t('adminSettings.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderIntegrationsSettings = () => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {integration.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {integration.provider}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => testIntegrationConnection(integration.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title={t('adminSettings.testConnection')}
                >
                  <Wifi className="h-4 w-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={(e) => handleIntegrationToggle(integration.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {integration.description}
            </p>

            {/* Status and Environment */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${integration.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {integration.isEnabled ? t('adminSettings.enabled') : t('adminSettings.disabled')}
                </span>
              </div>
              <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                {integration.environment}
              </span>
            </div>

            {/* Last Sync Info */}
            {integration.lastSync && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('adminSettings.lastSync')}: {new Date(integration.lastSync).toLocaleString()}
                </div>
                {integration.lastError && (
                  <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {t('adminSettings.lastError')}: {integration.lastError}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingIntegrationData(integration);
                  setShowIntegrationModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.editSettings')}
              </button>
              <button
                onClick={() => testIntegrationConnection(integration.id)}
                className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              >
                {t('adminSettings.test')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t('adminSettings.importantNotes')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('adminSettings.integrationKeysEncrypted')}</li>
              <li>{t('adminSettings.testBeforeEnabling')}</li>
              <li>{t('adminSettings.onlyEnabledAvailable')}</li>
              <li>{t('adminSettings.configureWebhooks')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <Server className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.systemVersion')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.version}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <HardDrive className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.databaseSize')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.databaseSize}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.memoryUsage')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.memoryUsage}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.uptime')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.uptime}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.activeUsers')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('adminLabels.totalProducts')}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{systemInfo.totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center">
              <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminSettings.manageConfiguration')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <button
                onClick={handleResetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('adminSettings.reset')}
              </button>
              <button
                onClick={() => setShowBackupModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('adminSettings.backup')}
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('adminSettings.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* System Info */}
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('adminLabels.systemInformation')}</h3>
                {renderSystemInfo()}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {activeTab === 'payment-gateways' ? t('adminSettings.paymentGateways') : `${activeTab} Settings`}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {activeTab === 'payment-gateways' ? t('adminSettings.paymentGatewayDescription') : `Configure your ${activeTab} preferences and settings`}
                </p>
              </div>

              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'business' && renderBusinessSettings()}
              {activeTab === 'vat' && renderVatSettings()}
              {activeTab === 'api-keys' && renderApiKeysSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'payment-gateways' && renderPaymentGateways()}
              {activeTab === 'notifications' && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminLabels.notificationSettings')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Configure email, SMS, and push notification preferences</p>
                </div>
              )}
              {activeTab === 'integration' && renderIntegrationsSettings()}
              {activeTab === 'maintenance' && (
                <div className="text-center py-12">
                  <Server className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminLabels.maintenanceSettings')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Maintenance settings will be available soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderGatewayEditModal()}
      {renderIntegrationEditModal()}
    </AdminLayout>
  );
};

export default Settings;
