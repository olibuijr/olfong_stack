import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings as SettingsIcon, Save, RefreshCw, ArrowLeft, Store, Globe, Mail, Phone, MapPin, Clock, DollarSign, Calendar, Info, AlertCircle, CheckCircle, Key, Eye, EyeOff, Building, Copy, Sparkles, Server, Lock, User, TestTube, Loader2, Percent, Trash2, Plus, X } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchSMTPSettings, updateSMTPSettings, testSMTPConnection, updateSettingsField } from '../../../store/slices/smtpSettingsSlice';

const GeneralSettings = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings: smtpSettings, testResult, isTesting } = useSelector((state) => state.smtpSettings);

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'Ölföng',
    storeDescription: 'Icelandic wine and beer shop with home delivery',
    storeEmail: 'info@olfong.is',
    storePhone: '+354 555 1234',
    storeAddress: 'Laugavegur 123, 101 Reykjavík, Iceland',
    language: 'is',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [availableCurrencies, setAvailableCurrencies] = useState([
    { code: 'ISK', symbol: 'kr', name: t('adminSettings.currencyISK'), isActive: true },
    { code: 'USD', symbol: '$', name: t('adminSettings.currencyUSD'), isActive: false },
    { code: 'EUR', symbol: '€', name: t('adminSettings.currencyEUR'), isActive: false }
  ]);

  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [newCurrencyForm, setNewCurrencyForm] = useState({ code: '', symbol: '', name: '' });

  // Business Settings state
  const [businessSettings, setBusinessSettings] = useState({
    openingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '22:00', closed: false },
      saturday: { open: '12:00', close: '23:59', closed: false },
      sunday: { open: '12:00', close: '23:59', closed: false }
    },
    ageRestriction: {
      enabled: true,
      nicotineAge: 18,
      alcoholNicotineAge: 20,
      generalProducts: 0
    }
  });
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  // SMTP Settings state
  const [smtpFormData, setSmtpFormData] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Ölföng',
    fromNameIs: 'Ölföng',
    isEnabled: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});

  // VAT state
  const [vatSettings, setVatSettings] = useState({
    enabled: true,
    rate: 24,
    country: 'IS',
    displayInAdmin: true,
    includeInCustomerPrice: true,
    showVatBreakdown: false
  });

  // VAT Profiles state
  const [vatProfiles, setVatProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    nameIs: '',
    description: '',
    descriptionIs: '',
    vatRate: 24,
    isDefault: false,
    categoryIds: []
  });
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load general settings
      const generalResponse = await fetch('/api/settings?category=GENERAL', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (generalResponse.ok) {
        const data = await generalResponse.json();
        const generalSettings = {};
        data.data.settings.GENERAL?.forEach(setting => {
          generalSettings[setting.key] = setting.value || '';
        });

        setSettings(prev => ({
          ...prev,
          ...generalSettings
        }));
      }

      // Load API keys if on API keys tab
      if (activeTab === 'apiKeys') {
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
      }

      // Load business settings if on business or ageRestrictions tab
      if (activeTab === 'business' || activeTab === 'ageRestrictions') {
        const businessResponse = await fetch('/api/settings?category=BUSINESS', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (businessResponse.ok) {
          const data = await businessResponse.json();
          const businessData = {};
          data.data.settings.BUSINESS?.forEach(setting => {
            if (setting.key === 'openingHours') {
              businessData.openingHours = JSON.parse(setting.value);
            } else if (setting.key === 'ageRestrictionEnabled') {
              businessData.ageRestriction = { ...businessData.ageRestriction, enabled: setting.value === 'true' };
            } else if (setting.key === 'nicotineAge') {
              businessData.ageRestriction = { ...businessData.ageRestriction, nicotineAge: parseInt(setting.value) };
            } else if (setting.key === 'alcoholNicotineAge') {
              businessData.ageRestriction = { ...businessData.ageRestriction, alcoholNicotineAge: parseInt(setting.value) };
            } else if (setting.key === 'generalProductsAge') {
              businessData.ageRestriction = { ...businessData.ageRestriction, generalProducts: parseInt(setting.value) };
            }
          });

          setBusinessSettings(prev => ({
            ...prev,
            ...businessData
          }));
        }
      }

      // Load SMTP settings if on SMTP tab
      if (activeTab === 'smtp') {
        dispatch(fetchSMTPSettings());
      }

      // Load currencies if on currencies tab
      if (activeTab === 'currencies') {
        await loadCurrenciesFromDB();
      }

      // Load VAT settings if on VAT tab
      if (activeTab === 'vat') {
        const vatResponse = await fetch('/api/settings?category=VAT', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (vatResponse.ok) {
          const data = await vatResponse.json();
          const vatData = {};
          data.data.settings.VAT?.forEach(setting => {
            if (setting.key === 'vatEnabled') {
              vatData.enabled = setting.value === 'true';
            } else if (setting.key === 'vatRate') {
              vatData.rate = parseFloat(setting.value) || 0;
            } else if (setting.key === 'vatCountry') {
              vatData.country = setting.value;
            } else if (setting.key === 'vatDisplayInAdmin') {
              vatData.displayInAdmin = setting.value === 'true';
            } else if (setting.key === 'vatIncludeInCustomerPrice') {
              vatData.includeInCustomerPrice = setting.value === 'true';
            } else if (setting.key === 'vatShowBreakdown') {
              vatData.showVatBreakdown = setting.value === 'true';
            }
          });

          setVatSettings(prev => ({
            ...prev,
            ...vatData
          }));
        }

        // Load VAT Profiles and Categories
        await loadVatProfiles();
        await loadCategories();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrenciesFromDB = async () => {
    try {
      const response = await fetch('/api/settings?category=CURRENCY', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const currencySettings = data.data.settings.CURRENCY || [];

        if (currencySettings.length > 0) {
          try {
            const currencies = JSON.parse(currencySettings[0].value);
            setAvailableCurrencies(currencies);
          } catch (e) {
            console.warn('Failed to parse currencies:', e);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load currencies:', error);
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

  const handleAddCurrency = () => {
    if (!newCurrencyForm.code || !newCurrencyForm.symbol || !newCurrencyForm.name) {
      toast.error('Please fill in all currency fields');
      return;
    }

    // Check if currency code already exists
    if (availableCurrencies.some(c => c.code === newCurrencyForm.code)) {
      toast.error('Currency code already exists');
      return;
    }

    const newCurrency = {
      code: newCurrencyForm.code.toUpperCase(),
      symbol: newCurrencyForm.symbol,
      name: newCurrencyForm.name,
      isActive: false
    };

    setAvailableCurrencies([...availableCurrencies, newCurrency]);
    setNewCurrencyForm({ code: '', symbol: '', name: '' });
    setShowAddCurrency(false);
    setHasUnsavedChanges(true);
    toast.success('Currency added. Don\'t forget to save!');
  };

  const handleRemoveCurrency = (code) => {
    const currency = availableCurrencies.find(c => c.code === code);

    // Prevent removing active currency
    if (currency?.isActive) {
      toast.error('Cannot remove active currency. Set another currency as active first.');
      return;
    }

    setAvailableCurrencies(availableCurrencies.filter(c => c.code !== code));
    setHasUnsavedChanges(true);
    toast.success('Currency removed. Don\'t forget to save!');
  };

  const handleSetActiveCurrency = (code) => {
    setAvailableCurrencies(availableCurrencies.map(c => ({
      ...c,
      isActive: c.code === code
    })));
    setHasUnsavedChanges(true);
  };

  const handleSaveCurrencies = async () => {
    if (!availableCurrencies.some(c => c.isActive)) {
      toast.error('Please set an active currency');
      return;
    }

    setIsSaving(true);
    try {
      const settingsToSave = [
        {
          key: 'currencies',
          value: JSON.stringify(availableCurrencies),
          category: 'CURRENCY',
          description: 'Available currencies in the system',
          isPublic: true
        },
        {
          key: 'currencySymbol',
          value: availableCurrencies.find(c => c.isActive)?.symbol || 'kr',
          category: 'GENERAL',
          description: 'Active currency symbol',
          isPublic: true
        },
        {
          key: 'currencyCode',
          value: availableCurrencies.find(c => c.isActive)?.code || 'ISK',
          category: 'GENERAL',
          description: 'Active currency code',
          isPublic: true
        }
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
        throw new Error('Failed to save currencies');
      }

      toast.success('Currencies saved successfully');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving currencies:', error);
      toast.error('Failed to save currencies');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'storeName', value: settings.storeName, category: 'GENERAL', description: 'Store name', isPublic: true },
        { key: 'storeDescription', value: settings.storeDescription, category: 'GENERAL', description: 'Store description', isPublic: true },
        { key: 'storeEmail', value: settings.storeEmail, category: 'GENERAL', description: 'Store email', isPublic: true },
        { key: 'storePhone', value: settings.storePhone, category: 'GENERAL', description: 'Store phone number', isPublic: true },
        { key: 'storeAddress', value: settings.storeAddress, category: 'GENERAL', description: 'Store address', isPublic: true },
        { key: 'language', value: settings.language, category: 'GENERAL', description: 'Default language', isPublic: true },
        { key: 'dateFormat', value: settings.dateFormat, category: 'GENERAL', description: 'Date format', isPublic: true },
        { key: 'timeFormat', value: settings.timeFormat, category: 'GENERAL', description: 'Time format', isPublic: true }
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

  // API Keys functions
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

      toast.success(t('adminSettings.settingsSaved'));
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

  // Business Settings functions
  const handleSaveBusinessSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'openingHours', value: JSON.stringify(businessSettings.openingHours), category: 'BUSINESS', description: 'Store opening hours' },
        { key: 'ageRestrictionEnabled', value: businessSettings.ageRestriction.enabled.toString(), category: 'BUSINESS', description: 'Age restriction enabled' },
        { key: 'nicotineAge', value: businessSettings.ageRestriction.nicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for nicotine products' },
        { key: 'alcoholNicotineAge', value: businessSettings.ageRestriction.alcoholNicotineAge.toString(), category: 'BUSINESS', description: 'Minimum age for alcohol and nicotine products' },
        { key: 'generalProductsAge', value: businessSettings.ageRestriction.generalProducts.toString(), category: 'BUSINESS', description: 'Minimum age for general products' }
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
    } finally {
      setIsSaving(false);
    }
  };

  const copyHoursToAll = (sourceDay) => {
    const sourceHours = businessSettings.openingHours[sourceDay];
    const newOpeningHours = {};
    Object.keys(businessSettings.openingHours).forEach(day => {
      newOpeningHours[day] = { ...sourceHours };
    });
    setBusinessSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    setShowCopyMenu(false);
    toast.success(t('adminSettings.copiedHoursToAllDays').replace('{day}', getDayName(sourceDay)));
  };

  const setWeekdayHours = () => {
    const newOpeningHours = { ...businessSettings.openingHours };
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
      newOpeningHours[day] = { open: '10:00', close: '22:00', closed: false };
    });
    setBusinessSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    toast.success(t('adminSettings.setWeekdayHoursSuccess'));
  };

  const setWeekendHours = () => {
    const newOpeningHours = { ...businessSettings.openingHours };
    ['saturday', 'sunday'].forEach(day => {
      newOpeningHours[day] = { open: '12:00', close: '23:59', closed: false };
    });
    setBusinessSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    toast.success(t('adminSettings.setWeekendHoursSuccess'));
  };

  const set24Hours = () => {
    const newOpeningHours = {};
    Object.keys(businessSettings.openingHours).forEach(day => {
      newOpeningHours[day] = { open: '00:00', close: '23:59', closed: false };
    });
    setBusinessSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    toast.success(t('adminSettings.set24hSuccess'));
  };

  const getDayName = (day) => {
    const dayNames = {
      monday: t('adminSettings.monday'),
      tuesday: t('adminSettings.tuesday'),
      wednesday: t('adminSettings.wednesday'),
      thursday: t('adminSettings.thursday'),
      friday: t('adminSettings.friday'),
      saturday: t('adminSettings.saturday'),
      sunday: t('adminSettings.sunday')
    };
    return dayNames[day] || day;
  };

  const calculateDuration = (hours) => {
    if (hours.closed) return null;
    const openH = parseInt(hours.open.split(':')[0]);
    const openM = parseInt(hours.open.split(':')[1]);
    const closeH = parseInt(hours.close.split(':')[0]);
    const closeM = parseInt(hours.close.split(':')[1]);
    const durationMinutes = (closeH * 60 + closeM) - (openH * 60 + openM);
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return { hours: h, minutes: m, total: durationMinutes / 60 };
  };

  // VAT Settings functions
  // Load VAT Profiles
  const loadVatProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const response = await fetch('/api/vat-profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVatProfiles(data.data?.profiles || []);
      }
    } catch (error) {
      console.error('Error loading VAT profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Load Categories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data?.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Save VAT Profile
  const handleSaveVatProfile = async () => {
    try {
      if (!profileFormData.name || !profileFormData.nameIs) {
        toast.error('Name and Icelandic name are required');
        return;
      }

      setIsSaving(true);
      const url = editingProfile
        ? `/api/vat-profiles/${editingProfile.id}`
        : '/api/vat-profiles';

      const response = await fetch(url, {
        method: editingProfile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: profileFormData.name,
          nameIs: profileFormData.nameIs,
          description: profileFormData.description,
          descriptionIs: profileFormData.descriptionIs,
          vatRate: parseFloat(profileFormData.vatRate),
          isDefault: profileFormData.isDefault,
          categoryIds: profileFormData.categoryIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save VAT profile');
      }

      toast.success(editingProfile ? 'VAT profile updated' : 'VAT profile created');
      await loadVatProfiles();
      setShowProfileForm(false);
      setEditingProfile(null);
      setProfileFormData({
        name: '',
        nameIs: '',
        description: '',
        descriptionIs: '',
        vatRate: 24,
        isDefault: false,
        categoryIds: []
      });
    } catch (error) {
      console.error('Error saving VAT profile:', error);
      toast.error('Failed to save VAT profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete VAT Profile
  const handleDeleteVatProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/vat-profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete VAT profile');
      }

      toast.success('VAT profile deleted');
      await loadVatProfiles();
    } catch (error) {
      console.error('Error deleting VAT profile:', error);
      toast.error('Failed to delete VAT profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit VAT Profile
  const handleEditVatProfile = (profile) => {
    setEditingProfile(profile);
    setProfileFormData({
      name: profile.name,
      nameIs: profile.nameIs,
      description: profile.description || '',
      descriptionIs: profile.descriptionIs || '',
      vatRate: profile.vatRate,
      isDefault: profile.isDefault,
      categoryIds: profile.categories?.map(c => c.id) || []
    });
    setShowProfileForm(true);
  };

  const handleSaveVatSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'vatEnabled', value: vatSettings.enabled.toString(), category: 'VAT', description: 'VAT enabled', isPublic: true },
        { key: 'vatRate', value: vatSettings.rate.toString(), category: 'VAT', description: 'VAT rate', isPublic: true },
        { key: 'vatCountry', value: vatSettings.country, category: 'VAT', description: 'VAT country', isPublic: true },
        { key: 'vatDisplayInAdmin', value: vatSettings.displayInAdmin.toString(), category: 'VAT', description: 'Show VAT in admin', isPublic: true },
        { key: 'vatIncludeInCustomerPrice', value: vatSettings.includeInCustomerPrice.toString(), category: 'VAT', description: 'Include VAT in customer price', isPublic: true },
        { key: 'vatShowBreakdown', value: vatSettings.showVatBreakdown.toString(), category: 'VAT', description: 'Show VAT breakdown', isPublic: true }
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
        throw new Error('Failed to save VAT settings');
      }

      toast.success(t('adminSettings.settingsSaved'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving VAT settings:', error);
      toast.error('Failed to save VAT settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVatInputChange = (field, value) => {
    setVatSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // SMTP Settings functions
  useEffect(() => {
    if (smtpSettings && activeTab === 'smtp') {
      setSmtpFormData({
        host: smtpSettings.host || '',
        port: smtpSettings.port || 587,
        secure: smtpSettings.secure || false,
        username: smtpSettings.username || '',
        password: '',
        fromEmail: smtpSettings.fromEmail || '',
        fromName: smtpSettings.fromName || 'Ölföng',
        fromNameIs: smtpSettings.fromNameIs || 'Ölföng',
        isEnabled: smtpSettings.isEnabled || false
      });
    }
  }, [smtpSettings, activeTab]);

  const handleSmtpInputChange = (field, value) => {
    setSmtpFormData(prev => ({ ...prev, [field]: value }));
    dispatch(updateSettingsField({ field, value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSmtp = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateSMTPSettings(smtpFormData)).unwrap();
      toast.success('SMTP settings saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error(error || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpFormData.host || !smtpFormData.username || !smtpFormData.password || !smtpFormData.fromEmail) {
      toast.error('Please fill in all required fields before testing');
      return;
    }

    try {
      await dispatch(testSMTPConnection(smtpFormData)).unwrap();
      if (testResult?.success) {
        toast.success('SMTP test successful!');
      }
    } catch (error) {
      toast.error(error || 'SMTP test failed');
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
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">{t('admin.accessDenied')}</h1>
            <p className="text-gray-700 dark:text-gray-300">{t('admin.accessDeniedMessage')}</p>
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
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6">
           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
             <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
               <Link
                 to="/admin/settings"
                 className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 mt-0.5"
               >
                 <ArrowLeft className="w-5 h-5" />
               </Link>
               <div className="flex-1 min-w-0">
                 <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap leading-tight">
                   <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                   <span>{t('adminSettings.generalSettings')}</span>
                 </h1>
                 <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">{t('adminSettings.generalDescription')}</p>
               </div>
             </div>
             <div className="flex flex-col xs:flex-row items-center justify-end gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 w-full sm:w-auto">
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
                 onClick={() => {
                   if (activeTab === 'business' || activeTab === 'ageRestrictions') {
                     handleSaveBusinessSettings();
                   } else if (activeTab === 'apiKeys') {
                     // API Keys are saved individually
                     toast.info('API keys are saved individually');
                   } else if (activeTab === 'smtp') {
                     handleSaveSmtp();
                   } else if (activeTab === 'vat') {
                     handleSaveVatSettings();
                   } else if (activeTab === 'currencies') {
                     handleSaveCurrencies();
                   } else {
                     handleSaveSettings();
                   }
                 }}
                 disabled={isSaving || !hasUnsavedChanges}
                 className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
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
       </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex gap-1 sm:gap-2 lg:gap-4 px-2 sm:px-4 lg:px-6 min-w-max sm:min-w-full" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.general')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('apiKeys')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'apiKeys'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.apiKeys')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'business'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.openingHours') || 'Opnunartímar'}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ageRestrictions')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'ageRestrictions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.ageRestrictions') || 'Aldurstakmörk'}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('smtp')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'smtp'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.smtp')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('vat')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'vat'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Percent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.vat')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('currencies')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'currencies'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('adminSettings.currencies') || 'Currencies'}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
           <div className="space-y-6">
            {activeTab === 'general' ? (
            // General Settings Content
            <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Store className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">{t('adminSettings.storeInformation')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('adminSettings.storeInformationDesc')}</p>
              </div>
                <div className="p-4 xl:p-6 2xl:p-8 space-y-4 xl:space-y-6 2xl:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('adminSettings.storeName')} <span className="text-red-500">*</span>
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
                      {t('adminSettings.storeEmail')} <span className="text-red-500">*</span>
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
                      {t('adminSettings.phoneNumber')} <span className="text-red-500">*</span>
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
                      {t('adminSettings.storeAddress')} <span className="text-red-500">*</span>
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
                      {t('adminSettings.storeDescription')}
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
                  <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">{t('adminSettings.preferences')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('adminSettings.preferencesDesc')}</p>
              </div>
                <div className="p-4 xl:p-6 2xl:p-8 space-y-4 xl:space-y-6 2xl:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4 xl:gap-6 2xl:gap-8">
                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings.language')}
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="is">{t('adminSettings.languageIcelandic')}</option>
                          <option value="en">{t('adminSettings.languageEnglish')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings.dateFormat')}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="DD/MM/YYYY">{t('adminSettings.dateFormatDDMMYYYY')}</option>
                          <option value="MM/DD/YYYY">{t('adminSettings.dateFormatMMDDYYYY')}</option>
                          <option value="YYYY-MM-DD">{t('adminSettings.dateFormatYYYYMMDD')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="2xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings.timeFormat')}
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={settings.timeFormat}
                          onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="24h">{t('adminSettings.timeFormat24h')}</option>
                          <option value="12h">{t('adminSettings.timeFormat12h')}</option>
                        </select>
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
                   <h4 className="text-sm xl:text-base font-medium text-blue-900 dark:text-blue-100 mb-2">{t('adminSettings.needHelp')}</h4>
                   <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                     {t('adminSettings.settingsControlDesc')}
                   </p>
                   <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                     <li>• {t('adminSettings.storeNameAppears')}</li>
                     <li>• {t('adminSettings.currencyAffects')}</li>
                     <li>• {t('adminSettings.languageSets')}</li>
                     <li>• {t('adminSettings.dateTimeFormats')}</li>
                   </ul>
                 </div>
               </div>
             </div>
            </>
          ) : activeTab === 'apiKeys' ? (
            // API Keys Tab Content
            <>
              <div className="flex items-center mb-6">
                <Key className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
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
                    <div className="flex-1 relative">
                      <input
                        type={showApiKeys.unsplash ? "text" : "password"}
                        placeholder={t('adminSettings.enterUnsplashApiKey')}
                        value={apiKeys.unsplash || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({ ...prev, unsplash: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      onClick={() => handleSaveApiKey('unsplash', apiKeys.unsplash || '')}
                      disabled={isSaving || !hasUnsavedChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
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
                    <div className="flex-1 relative">
                      <input
                        type={showApiKeys.pexels ? "text" : "password"}
                        placeholder={t('adminSettings.enterPexelsApiKey')}
                        value={apiKeys.pexels || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({ ...prev, pexels: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
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
                    <div className="flex-1 relative">
                      <input
                        type={showApiKeys.pixabay ? "text" : "password"}
                        placeholder={t('adminSettings.enterPixabayApiKey')}
                        value={apiKeys.pixabay || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({ ...prev, pixabay: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
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
                      <div className="flex-1 relative">
                        <input
                          type={showApiKeys.google ? "text" : "password"}
                          placeholder={t('adminSettings.enterGoogleApiKey')}
                          value={apiKeys.google || ''}
                          onChange={(e) => {
                            setApiKeys(prev => ({ ...prev, google: e.target.value }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
                      </button>
                    </div>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder={t('adminSettings.enterGoogleSearchEngineId')}
                        value={apiKeys.googleSearchEngineId || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({ ...prev, googleSearchEngineId: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={() => handleSaveApiKey('googleSearchEngineId', apiKeys.googleSearchEngineId || '')}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.test')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RunPod API Key */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          RunPod API Key
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Required for AI product image generation (FLUX models)
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
                        type={showApiKeys.runpodApiKey ? "text" : "password"}
                        placeholder="Enter RunPod API key (rpa_...)"
                        value={apiKeys.runpodApiKey || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({ ...prev, runpodApiKey: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility('runpodApiKey')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showApiKeys.runpodApiKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveApiKey('runpodApiKey', apiKeys.runpodApiKey || '')}
                      disabled={isSaving || !hasUnsavedChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('adminSettings.save')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Get your API key from{' '}
                    <a
                      href="https://runpod.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      RunPod Dashboard
                    </a>
                  </p>
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
            </>
          ) : activeTab === 'business' ? (
            // Business Settings Content
            <>
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.quickActions')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={setWeekdayHours}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('adminSettings.setWeekdayHours')}</span>
                    </button>
                    <button
                      onClick={setWeekendHours}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('adminSettings.setWeekendHours')}</span>
                    </button>
                    <button
                      onClick={set24Hours}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('adminSettings.operation24h')}</span>
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowCopyMenu(!showCopyMenu)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('adminSettings.copyHours')}</span>
                      </button>
                      {showCopyMenu && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                          {Object.keys(businessSettings.openingHours).map(day => (
                            <button
                              key={day}
                              onClick={() => copyHoursToAll(day)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors capitalize"
                            >
                              {t('adminSettings.copy')} {getDayName(day)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
                  <div className="flex items-center mb-6">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.openingHours')}</h3>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(businessSettings.openingHours).map(([day, hours]) => {
                      const duration = calculateDuration(hours);

                      return (
                        <div key={day} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                          {/* Day Name */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {getDayName(day)}
                            </label>
                          </div>

                          {/* Opening Time */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={hours.open}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow typing and validate format
                                if (value === '' || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || /^([0-1]?[0-9]?|2[0-3]?)(:([0-5]?[0-9]?)?)?$/.test(value)) {
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    openingHours: {
                                      ...prev.openingHours,
                                      [day]: { ...hours, open: value }
                                    }
                                  }));
                                  setHasUnsavedChanges(true);
                                }
                              }}
                              disabled={hours.closed}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 font-mono"
                              title={t('adminSettings.openingTime')}
                              placeholder="HH:MM"
                              pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                            />
                          </div>

                          {/* Separator */}
                          <div className="col-span-1 text-center">
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                          </div>

                          {/* Closing Time */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={hours.close}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow typing and validate format
                                if (value === '' || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || /^([0-1]?[0-9]?|2[0-3]?)(:([0-5]?[0-9]?)?)?$/.test(value)) {
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    openingHours: {
                                      ...prev.openingHours,
                                      [day]: { ...hours, close: value }
                                    }
                                  }));
                                  setHasUnsavedChanges(true);
                                }
                              }}
                              disabled={hours.closed}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 font-mono"
                              title={t('adminSettings.closingTime')}
                              placeholder="HH:MM"
                              pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                            />
                          </div>

                          {/* Duration */}
                          <div className="col-span-2 text-center">
                            {duration ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {duration.hours}h {duration.minutes}m
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>

                          {/* Closed Checkbox */}
                          <div className="col-span-1 flex justify-end">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hours.closed}
                                onChange={(e) => {
                                  setBusinessSettings(prev => ({
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
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{t('adminSettings.closed')}</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly Summary */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('adminSettings.weeklySummary')}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('adminSettings.openDays')}</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {Object.values(businessSettings.openingHours).filter(h => !h.closed).length}/7
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('adminSettings.totalHoursPerWeek')}</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {Object.values(businessSettings.openingHours).reduce((total, hours) => {
                                const duration = calculateDuration(hours);
                                return total + (duration?.total || 0);
                              }, 0).toFixed(1)}h
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('adminSettings.avgHoursPerDay')}</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {(Object.values(businessSettings.openingHours).reduce((total, hours) => {
                                const duration = calculateDuration(hours);
                                return total + (duration?.total || 0);
                              }, 0) / Object.values(businessSettings.openingHours).filter(h => !h.closed).length).toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 flex justify-end">
                  <button
                    onClick={handleSaveBusinessSettings}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? t('common.saving') : t('adminSettings.saveChanges')}
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'ageRestrictions' ? (
            // Age Restrictions Content
            <>
              {/* Age Restriction */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
                  <div className="flex items-center mb-6">
                    <AlertCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminSettings.ageRestriction')}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableAgeRestriction"
                        checked={businessSettings.ageRestriction.enabled}
                        onChange={(e) => {
                          setBusinessSettings(prev => ({
                            ...prev,
                            ageRestriction: { ...prev.ageRestriction, enabled: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="enableAgeRestriction" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.enableRestrictions')}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminSettings.nicotineProducts')} ({t('adminSettings.years')})
                        </label>
                        <input
                          type="number"
                          value={businessSettings.ageRestriction.nicotineAge}
                          onChange={(e) => {
                            setBusinessSettings(prev => ({
                              ...prev,
                              ageRestriction: { ...prev.ageRestriction, nicotineAge: parseInt(e.target.value) || 18 }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          disabled={!businessSettings.ageRestriction.enabled}
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
                          value={businessSettings.ageRestriction.alcoholNicotineAge}
                          onChange={(e) => {
                            setBusinessSettings(prev => ({
                              ...prev,
                              ageRestriction: { ...prev.ageRestriction, alcoholNicotineAge: parseInt(e.target.value) || 20 }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          disabled={!businessSettings.ageRestriction.enabled}
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
                          value={businessSettings.ageRestriction.generalProducts}
                          onChange={(e) => {
                            setBusinessSettings(prev => ({
                              ...prev,
                              ageRestriction: { ...prev.ageRestriction, generalProducts: parseInt(e.target.value) || 0 }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          disabled={!businessSettings.ageRestriction.enabled}
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

              {/* Save Button */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 flex justify-end">
                  <button
                    onClick={handleSaveBusinessSettings}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {t('adminSettings.saveChanges')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'smtp' ? (
            // SMTP Settings Content
            <>
              {/* SMTP Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">
                          {t('adminSettings.smtpSettings')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {t('adminSettings.smtp.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpFormData.isEnabled}
                          onChange={(e) => handleSmtpInputChange('isEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('adminSettings.smtp.enableSmtp')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Server Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings.smtp.host')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={smtpFormData.host}
                          onChange={(e) => handleSmtpInputChange('host', e.target.value)}
                          placeholder="smtp.gmail.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.smtp.hostHelp')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('adminSettings.smtp.port')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={smtpFormData.port}
                        onChange={(e) => handleSmtpInputChange('port', parseInt(e.target.value) || 587)}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.smtp.portHelp')}
                      </p>
                    </div>
                  </div>

                  {/* Security */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smtpFormData.secure}
                        onChange={(e) => handleSmtpInputChange('secure', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Lock className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.smtp.useSecure')}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                      {t('adminSettings.smtp.secureHelp')}
                    </p>
                  </div>

                  {/* Authentication */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t('adminSettings.smtp.authCredentials')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.smtp.username')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={smtpFormData.username}
                            onChange={(e) => handleSmtpInputChange('username', e.target.value)}
                            placeholder="your-email@example.com"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.smtp.password')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={smtpFormData.password}
                            onChange={(e) => handleSmtpInputChange('password', e.target.value)}
                            placeholder="Enter SMTP password"
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('adminSettings.smtp.passwordHelp')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sender Information */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {t('adminSettings.smtp.senderInfo')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.smtp.fromEmail')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={smtpFormData.fromEmail}
                            onChange={(e) => handleSmtpInputChange('fromEmail', e.target.value)}
                            placeholder="noreply@olfong.is"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('adminSettings.smtp.fromEmailHelp')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.smtp.fromNameEn')}
                        </label>
                        <input
                          type="text"
                          value={smtpFormData.fromName}
                          onChange={(e) => handleSmtpInputChange('fromName', e.target.value)}
                          placeholder="Ölföng"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.smtp.fromNameIs')}
                        </label>
                        <input
                          type="text"
                          value={smtpFormData.fromNameIs}
                          onChange={(e) => handleSmtpInputChange('fromNameIs', e.target.value)}
                          placeholder="Ölföng"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleTestSmtp}
                        disabled={isTesting || !smtpFormData.host || !smtpFormData.username || !smtpFormData.password || !smtpFormData.fromEmail}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('adminSettings.smtp.testingConnection')}
                          </>
                        ) : (
                          <>
                            <TestTube className="w-4 h-4 mr-2" />
                            {t('adminSettings.smtp.testConnection')}
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSaveSmtp}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? t('common.saving') : t('adminSettings.smtp.saveSettings')}
                      </button>
                    </div>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div className={`p-4 rounded-md ${
                      testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-start">
                        {testResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`text-sm font-medium ${
                            testResult.success
                              ? 'text-green-900 dark:text-green-100'
                              : 'text-red-900 dark:text-red-100'
                          }`}>
                            {testResult.success ? t('adminSettings.smtp.connectionSuccess') : t('adminSettings.smtp.connectionFailed')}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            testResult.success
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            {testResult.message || (testResult.success
                              ? t('adminSettings.smtp.connectionSuccessMsg')
                              : t('adminSettings.smtp.connectionFailedMsg')
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuration Help */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {t('adminSettings.smtp.commonProviders')}
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <div>
                        <strong>Gmail:</strong> {t('adminSettings.smtp.providerGmail')}
                      </div>
                      <div>
                        <strong>Outlook/Office365:</strong> {t('adminSettings.smtp.providerOutlook')}
                      </div>
                      <div>
                        <strong>Yahoo:</strong> {t('adminSettings.smtp.providerYahoo')}
                      </div>
                      <div>
                        <strong>SendGrid:</strong> {t('adminSettings.smtp.providerSendGrid')}
                      </div>
                      <div>
                        <strong>Mailgun:</strong> {t('adminSettings.smtp.providerMailgun')}
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                      {t('adminSettings.smtp.gmailTip')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'vat' ? (
            // VAT Settings Content
            <>
              {/* VAT Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">
                        {t('adminSettings.vatConfiguration')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {t('adminSettings.vatInformationDescription')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* VAT Enable Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.vatEnabled')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.enableVatForStore')}
                      </p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vatSettings.enabled}
                        onChange={(e) => handleVatInputChange('enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>
                  </div>

                  {vatSettings.enabled && (
                    <>
                      {/* VAT Rate - Dropdown from available VAT Profiles */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.vatRate')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={vatSettings.rate}
                          onChange={(e) => handleVatInputChange('rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select a VAT profile...</option>
                          {vatProfiles.map((profile) => (
                            <option key={profile.id} value={profile.vatRate}>
                              {profile.name} ({profile.nameIs}) - {profile.vatRate}%
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('adminSettings.vatRateDescription')}
                        </p>
                      </div>

                      {/* VAT Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.country')}
                        </label>
                        <select
                          value={vatSettings.country}
                          onChange={(e) => handleVatInputChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="IS">{t('adminSettings.iceland')}</option>
                          <option value="EU">{t('adminSettings.euCountries')}</option>
                          <option value="OTHER">{t('adminSettings.otherCountries')}</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* VAT Display Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('adminSettings.vatDisplaySettings')}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Show VAT in Admin */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="displayInAdmin"
                      checked={vatSettings.displayInAdmin}
                      onChange={(e) => handleVatInputChange('displayInAdmin', e.target.checked)}
                      disabled={!vatSettings.enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 mt-1 disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <label htmlFor="displayInAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.showVatInAdmin')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.showVatInAdminDescription')}
                      </p>
                    </div>
                  </div>

                  {/* Include VAT in Customer Price */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="includeInCustomerPrice"
                      checked={vatSettings.includeInCustomerPrice}
                      onChange={(e) => handleVatInputChange('includeInCustomerPrice', e.target.checked)}
                      disabled={!vatSettings.enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 mt-1 disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <label htmlFor="includeInCustomerPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.includeVatInCustomerPrice')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.includeVatInCustomerPriceDescription')}
                      </p>
                    </div>
                  </div>

                  {/* Show VAT Breakdown */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="showVatBreakdown"
                      checked={vatSettings.showVatBreakdown}
                      onChange={(e) => handleVatInputChange('showVatBreakdown', e.target.checked)}
                      disabled={!vatSettings.enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 mt-1 disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <label htmlFor="showVatBreakdown" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('adminSettings.showVatBreakdown')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('adminSettings.showVatBreakdownDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* VAT Profiles */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('adminSettings.vatProfiles')}
                    </h3>
                    <button
                      onClick={() => {
                        setShowProfileForm(!showProfileForm);
                        setEditingProfile(null);
                        setProfileFormData({
                          name: '',
                          nameIs: '',
                          description: '',
                          descriptionIs: '',
                          vatRate: 24,
                          isDefault: false,
                          categoryIds: []
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      {showProfileForm ? t('adminSettings.cancel') : t('adminSettings.addProfile')}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {showProfileForm && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        {editingProfile ? t('adminSettings.editVatProfile') : t('adminSettings.createNewVatProfile')}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.nameEnglish')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={profileFormData.name}
                            onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                            placeholder="e.g., Standard Rate"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.nameIcelandic')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={profileFormData.nameIs}
                            onChange={(e) => setProfileFormData({ ...profileFormData, nameIs: e.target.value })}
                            placeholder="e.g., Venjuleg hlutföll"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.vatRatePercent')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={profileFormData.vatRate}
                            onChange={(e) => setProfileFormData({ ...profileFormData, vatRate: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              checked={profileFormData.isDefault}
                              onChange={(e) => setProfileFormData({ ...profileFormData, isDefault: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('adminSettings.setAsDefault')}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.descriptionEnglish')}
                        </label>
                        <textarea
                          value={profileFormData.description}
                          onChange={(e) => setProfileFormData({ ...profileFormData, description: e.target.value })}
                          placeholder="e.g., Standard VAT rate for most products"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.descriptionIcelandic')}
                        </label>
                        <textarea
                          value={profileFormData.descriptionIs}
                          onChange={(e) => setProfileFormData({ ...profileFormData, descriptionIs: e.target.value })}
                          placeholder="e.g., Venjuleg VSK hlutfall fyrir flestar vörur"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('adminSettings.assignCategories')}
                        </label>
                        <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-800">
                          {categories.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('adminSettings.noCategoriesAvailable')}</p>
                          ) : (
                            <div className="space-y-2">
                              {categories.map(category => (
                                <label key={category.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={profileFormData.categoryIds.includes(category.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setProfileFormData({
                                          ...profileFormData,
                                          categoryIds: [...profileFormData.categoryIds, category.id]
                                        });
                                      } else {
                                        setProfileFormData({
                                          ...profileFormData,
                                          categoryIds: profileFormData.categoryIds.filter(id => id !== category.id)
                                        });
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {category.name} {category.nameIs ? `(${category.nameIs})` : ''}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveVatProfile}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                        >
                          {isSaving ? t('adminSettings.saving') : t('adminSettings.saveProfile')}
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileForm(false);
                            setEditingProfile(null);
                          }}
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 text-sm font-medium transition-colors"
                        >
                          {t('adminSettings.cancel')}
                        </button>
                      </div>
                    </div>
                  )}

                  {isLoadingProfiles ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                    </div>
                  ) : vatProfiles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">{t('adminSettings.noVatProfilesCreated')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vatProfiles.map(profile => (
                        <div key={profile.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {profile.name}
                                </h4>
                                {profile.isDefault && (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {profile.nameIs}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                <span className="font-medium">{t('adminSettings.vatRateLabel')}</span> {profile.vatRate}%
                              </p>
                              {profile.categories.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {t('adminSettings.categories')}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {profile.categories.map(cat => (
                                      <span
                                        key={cat.id}
                                        className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md border border-gray-200 dark:border-gray-600"
                                      >
                                        {cat.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditVatProfile(profile)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                              >
                                {t('adminSettings.edit')}
                              </button>
                              <button
                                onClick={() => handleDeleteVatProfile(profile.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={isSaving}
                              >
                                {t('adminSettings.delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* VAT Information Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {t('adminSettings.vatInformation')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('adminSettings.vatInformationDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'currencies' ? (
            // Currencies Settings Content
            <>
              {/* Active Currency */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white">
                        {t('adminSettings.currencyManagement')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {t('adminSettings.currencyManagementDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Active Currency Indicator */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          {t('adminSettings.activeCurrency')}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {availableCurrencies.find(c => c.isActive)?.name} ({availableCurrencies.find(c => c.isActive)?.code}) - {availableCurrencies.find(c => c.isActive)?.symbol}
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {availableCurrencies.find(c => c.isActive)?.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Available Currencies Grid */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{t('adminSettings.availableCurrencies')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableCurrencies.map((currency) => (
                        <div
                          key={currency.code}
                          className={`p-4 border rounded-lg transition-colors duration-200 ${
                            currency.isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {currency.symbol}
                                </span>
                                <span className="text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">
                                  {currency.code}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {currency.name}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-col">
                              {!currency.isActive && (
                                <button
                                  onClick={() => handleSetActiveCurrency(currency.code)}
                                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  {t('adminSettings.setActive')}
                                </button>
                              )}
                              {currency.code !== 'ISK' && !currency.isActive && (
                                <button
                                  onClick={() => handleRemoveCurrency(currency.code)}
                                  className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" />
                                  {t('common.remove')}
                                </button>
                              )}
                              {currency.isActive && (
                                <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-center">
                                  {t('adminSettings.active')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Currency Section */}
                  {showAddCurrency ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">{t('adminSettings.addNewCurrency')}</h4>
                        <button
                          onClick={() => setShowAddCurrency(false)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.currencyCode')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength="3"
                            value={newCurrencyForm.code}
                            onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., USD"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.currencySymbol')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength="5"
                            value={newCurrencyForm.symbol}
                            onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, symbol: e.target.value })}
                            placeholder="e.g., $"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('adminSettings.currencyName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCurrencyForm.name}
                            onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, name: e.target.value })}
                            placeholder="e.g., US Dollar"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCurrency}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          {t('adminSettings.addNewCurrency')}
                        </button>
                        <button
                          onClick={() => setShowAddCurrency(false)}
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium text-sm"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddCurrency(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      {t('adminSettings.addNewCurrency')}
                    </button>
                  )}
                </div>
              </div>

              {/* Currency Information */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {t('adminSettings.currencyManagementGuide')}
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• {t('adminSettings.onlyOneCurrency')}</li>
                      <li>• {t('adminSettings.currencySymbolDisplay')}</li>
                      <li>• {t('adminSettings.cannotDeleteActive')}</li>
                      <li>• {t('adminSettings.currencyChangesSaved')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : null}
            </div>
         </div>
       </div>
      </div>
     </AdminLayout>
  );
};

export default GeneralSettings;
