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

  // Placeholder render functions - to be implemented
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <SettingsIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.generalSettings')}</h3>
        <p className="text-gray-600 dark:text-gray-400">General store settings will be available soon.</p>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Building className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.businessSettings')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Business settings will be available soon.</p>
      </div>
    </div>
  );

  const renderVatSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Percent className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.vatSettings')}</h3>
        <p className="text-gray-600 dark:text-gray-400">VAT settings will be available soon.</p>
      </div>
    </div>
  );

  const renderApiKeysSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Key className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.apiKeys')}</h3>
        <p className="text-gray-600 dark:text-gray-400">API key management will be available soon.</p>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.notifications')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Notification settings will be available soon.</p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.security')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Security settings will be available soon.</p>
      </div>
    </div>
  );

  const renderPaymentGateways = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.paymentGateways')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Payment gateway settings will be available soon.</p>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Wifi className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.integrations')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Integration settings will be available soon.</p>
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Server className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings.maintenance')}</h3>
        <p className="text-gray-600 dark:text-gray-400">Maintenance settings will be available soon.</p>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.version')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.version}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.lastBackup')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.lastBackup}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.databaseSize')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.databaseSize}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.diskUsage')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.diskUsage}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.memoryUsage')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.memoryUsage}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.uptime')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.uptime}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.activeUsers')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.activeUsers}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.totalOrders')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.totalOrders}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminLabels.totalProducts')}:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.totalProducts}</span>
      </div>
    </div>
  );

  // Placeholder modal functions
  const renderGatewayEditModal = () => null;
  const renderIntegrationEditModal = () => null;
  const renderShippingEditModal = () => null;

  // Placeholder handler functions
  const handleSaveSettings = () => {
    toast.success(t('adminSettings.settingsSaved'));
    setHasUnsavedChanges(false);
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
              onClick={() => setShowBackupModal(true)}
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
        {settingsCategories.map((category, categoryIndex) => (
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
