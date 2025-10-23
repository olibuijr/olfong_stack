import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Save,
  RefreshCw,
  ArrowLeft,
  Clock,
  Copy,
  Calendar,
  AlertCircle,
  Info,
  Sparkles
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
  const [showCopyMenu, setShowCopyMenu] = useState(false);

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

      toast.success(t('adminSettings.settingsSaved'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick actions for opening hours
  const copyHoursToAll = (sourceDay) => {
    const sourceHours = settings.openingHours[sourceDay];
    const newOpeningHours = {};
    Object.keys(settings.openingHours).forEach(day => {
      newOpeningHours[day] = { ...sourceHours };
    });
    setSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    setShowCopyMenu(false);
    toast.success(t('adminSettings.copiedHoursToAllDays').replace('{day}', getDayName(sourceDay)));
  };

  const setWeekdayHours = () => {
    const newOpeningHours = { ...settings.openingHours };
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
      newOpeningHours[day] = { open: '10:00', close: '22:00', closed: false };
    });
    setSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    toast.success(t('adminSettings.setWeekdayHoursSuccess'));
  };

  const setWeekendHours = () => {
    const newOpeningHours = { ...settings.openingHours };
    ['saturday', 'sunday'].forEach(day => {
      newOpeningHours[day] = { open: '12:00', close: '24:00', closed: false };
    });
    setSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
    setHasUnsavedChanges(true);
    toast.success(t('adminSettings.setWeekendHoursSuccess'));
  };

  const set24Hours = () => {
    const newOpeningHours = {};
    Object.keys(settings.openingHours).forEach(day => {
      newOpeningHours[day] = { open: '00:00', close: '23:59', closed: false };
    });
    setSettings(prev => ({ ...prev, openingHours: newOpeningHours }));
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings.businessSettings')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminSettings.businessDescription')}</p>
              </div>
            </div>
          </div>
        </div>

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
                    {Object.keys(settings.openingHours).map(day => (
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
              {Object.entries(settings.openingHours).map(([day, hours]) => {
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        title={t('adminSettings.openingTime')}
                      />
                    </div>

                    {/* Separator */}
                    <div className="col-span-1 text-center">
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    </div>

                    {/* Closing Time */}
                    <div className="col-span-3">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        title={t('adminSettings.closingTime')}
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
                        {Object.values(settings.openingHours).filter(h => !h.closed).length}/7
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('adminSettings.totalHoursPerWeek')}</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                        {Object.values(settings.openingHours).reduce((total, hours) => {
                          const duration = calculateDuration(hours);
                          return total + (duration?.total || 0);
                        }, 0).toFixed(1)}h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('adminSettings.avgHoursPerDay')}</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                        {(Object.values(settings.openingHours).reduce((total, hours) => {
                          const duration = calculateDuration(hours);
                          return total + (duration?.total || 0);
                        }, 0) / Object.values(settings.openingHours).filter(h => !h.closed).length).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Age Restriction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                    {t('adminSettings.nicotineAgeDescription')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.alcoholNicotineProducts')} ({t('adminSettings.years')})
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
                    {t('adminSettings.alcoholNicotineAgeDescription')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings.generalProducts')} ({t('adminSettings.years')})
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

export default BusinessSettings;
