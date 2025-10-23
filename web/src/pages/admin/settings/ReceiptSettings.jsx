import { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
  Trash2,
  Eye,
  Save,
  Loader2,
  Palette,
  Type,
  Image,
  Settings,
  Printer
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  fetchReceiptSettings,
  updateReceiptSettings,
  uploadReceiptLogo,
  deleteReceiptLogo,
  updateSettingsField
} from '../../../store/slices/receiptSettingsSlice';
import { useLanguage } from '../../../contexts/LanguageContext';
import toast from 'react-hot-toast';

const ReceiptSettings = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { settings, isLoading, uploadProgress } = useSelector((state) => state.receiptSettings);

  const [formData, setFormData] = useState({
    companyName: '',
    companyNameIs: '',
    companyAddress: '',
    companyAddressIs: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    taxId: '',
    headerColor: '#1e40af',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    footerText: '',
    footerTextIs: '',
    showBarcode: true,
    showQrCode: true,
    template: 'modern',
    paperSize: '80mm'
  });

  const [previewMode, setPreviewMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchReceiptSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        companyNameIs: settings.companyNameIs || '',
        companyAddress: settings.companyAddress || '',
        companyAddressIs: settings.companyAddressIs || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        companyWebsite: settings.companyWebsite || '',
        taxId: settings.taxId || '',
        headerColor: settings.headerColor || '#1e40af',
        accentColor: settings.accentColor || '#3b82f6',
        fontFamily: settings.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: settings.fontSize || '14px',
        footerText: settings.footerText || '',
        footerTextIs: settings.footerTextIs || '',
        showBarcode: settings.showBarcode !== undefined ? settings.showBarcode : true,
        showQrCode: settings.showQrCode !== undefined ? settings.showQrCode : true,
        template: settings.template || 'modern',
        paperSize: settings.paperSize || '80mm'
      });
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    dispatch(updateSettingsField({ field, value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('adminSettings.fileSizeTooLarge'));
        return;
      }
      dispatch(uploadReceiptLogo(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateReceiptSettings(formData)).unwrap();
      toast.success(t('adminSettings.receiptSettingsSaved'));
    } catch (error) {
      toast.error(error || t('adminSettings.failedToSaveSettings'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLogo = () => {
    if (window.confirm(t('adminSettings.confirmDeleteLogo'))) {
      dispatch(deleteReceiptLogo());
    }
  };

  const generatePreviewHTML = () => {
    return `
      <div class="receipt receipt-${formData.template}" style="max-width: ${formData.paperSize === '80mm' ? '300px' : '100%'}; margin: 0 auto; font-family: ${formData.fontFamily}; font-size: ${formData.fontSize}; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div class="header" style="background: ${formData.headerColor}; color: white; text-align: center; padding: 15px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">${formData.companyNameIs || formData.companyName}</h1>
          ${formData.companyAddress ? `<div style="font-size: 12px; opacity: 0.9; margin: 2px 0;">${formData.companyAddressIs || formData.companyAddress}</div>` : ''}
          ${formData.companyPhone ? `<div style="font-size: 12px; opacity: 0.9; margin: 2px 0;">${formData.companyPhone}</div>` : ''}
          ${formData.companyEmail ? `<div style="font-size: 12px; opacity: 0.9; margin: 2px 0;">${formData.companyEmail}</div>` : ''}
        </div>
        
        <div class="content" style="padding: 15px;">
          <div class="order-info" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: bold; font-size: 16px; color: ${formData.accentColor}; margin-bottom: 5px;">Pöntun: #12345</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
              <span>Dagsetning: ${new Date().toLocaleDateString()}</span>
              <span>Staða: CONFIRMED</span>
            </div>
          </div>

          <div class="items" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dotted #d1d5db;">
              <div style="flex: 1; margin-right: 10px;">
                <div style="font-weight: 500; font-size: 13px; margin-bottom: 2px;">Vín - Rauðvín</div>
                <div style="font-size: 11px; color: #6b7280;">Magn: 2 × 2,500 ISK</div>
              </div>
              <div style="font-weight: bold; font-size: 13px; text-align: right; min-width: 60px;">5,000 ISK</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dotted #d1d5db;">
              <div style="flex: 1; margin-right: 10px;">
                <div style="font-weight: 500; font-size: 13px; margin-bottom: 2px;">Bjór - Pilsner</div>
                <div style="font-size: 11px; color: #6b7280;">Magn: 1 × 800 ISK</div>
              </div>
              <div style="font-weight: bold; font-size: 13px; text-align: right; min-width: 60px;">800 ISK</div>
            </div>
          </div>

          <div class="totals" style="border-top: 2px solid ${formData.accentColor}; padding-top: 10px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
              <span>Vörur:</span>
              <span>5,800 ISK</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
              <span>Sending:</span>
              <span>500 ISK</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: ${formData.headerColor}; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
              <span>Heildarupphæð:</span>
              <span>6,300 ISK</span>
            </div>
          </div>
        </div>

        <div class="footer" style="text-align: center; padding: 15px; background: #f9fafb; font-size: 11px; color: #6b7280;">
          ${formData.footerTextIs || formData.footerText || 'Takk fyrir viðskiptin!'}
        </div>
      </div>
    `;
  };

  if (isLoading && !settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminSettings.receiptSettings')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('adminSettings.receiptSettingsDescription')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Form */}
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Company Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="input w-full"
                      placeholder="Ölföng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name (Icelandic)
                    </label>
                    <input
                      type="text"
                      value={formData.companyNameIs}
                      onChange={(e) => handleInputChange('companyNameIs', e.target.value)}
                      className="input w-full"
                      placeholder="Ölföng"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address (English)
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="input w-full"
                      placeholder="Reykjavík, Iceland"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address (Icelandic)
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddressIs}
                      onChange={(e) => handleInputChange('companyAddressIs', e.target.value)}
                      className="input w-full"
                      placeholder="Reykjavík, Ísland"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                      className="input w-full"
                      placeholder="+354 555 1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                      className="input w-full"
                      placeholder="info@olfong.is"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      className="input w-full"
                      placeholder="www.olfong.is"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax ID (Kennitala)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="input w-full"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Logo
              </h2>
              
              <div className="space-y-4">
                {settings?.logoUrl ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={settings.logoUrl}
                      alt="Company Logo"
                      className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current logo</p>
                      <button
                        onClick={handleDeleteLogo}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center mt-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t('adminSettings.noLogoUploaded')}</p>
                    <p className="text-sm text-gray-500">{t('adminSettings.uploadLogoDescription')}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.uploadLogo')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('adminSettings.uploadLogoFormats')}</p>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Design Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Design & Colors
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Header Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.headerColor}
                        onChange={(e) => handleInputChange('headerColor', e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.headerColor}
                        onChange={(e) => handleInputChange('headerColor', e.target.value)}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={formData.fontFamily}
                      onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                      className="input w-full"
                    >
                      <option value="Inter, system-ui, sans-serif">Inter</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={formData.fontSize}
                      onChange={(e) => handleInputChange('fontSize', e.target.value)}
                      className="input w-full"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Template & Layout
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['modern', 'classic', 'minimal'].map(template => (
                      <button
                        key={template}
                        onClick={() => handleInputChange('template', template)}
                        className={`p-3 rounded-lg border text-sm font-medium capitalize ${
                          formData.template === template
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paper Size
                  </label>
                  <select
                    value={formData.paperSize}
                    onChange={(e) => handleInputChange('paperSize', e.target.value)}
                    className="input w-full"
                  >
                    <option value="80mm">80mm (Thermal)</option>
                    <option value="A4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showBarcode"
                      checked={formData.showBarcode}
                      onChange={(e) => handleInputChange('showBarcode', e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="showBarcode" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('adminSettings.showBarcode')}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showQrCode"
                      checked={formData.showQrCode}
                      onChange={(e) => handleInputChange('showQrCode', e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="showQrCode" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('adminSettings.showQRCode')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('adminSettings.footerMessages')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.footerTextEnglish')}
                  </label>
                  <textarea
                    value={formData.footerText}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    className="input w-full h-20 resize-none"
                    placeholder={t('adminSettings.footerTextEnPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('adminSettings.footerTextIcelandic')}
                  </label>
                  <textarea
                    value={formData.footerTextIs}
                    onChange={(e) => handleInputChange('footerTextIs', e.target.value)}
                    className="input w-full h-20 resize-none"
                    placeholder={t('adminSettings.footerTextIsPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('adminSettings.saveSettings')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {t('adminSettings.livePreview')}
                </h2>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  {previewMode ? t('adminSettings.screenView') : t('adminSettings.printView')}
                </button>
              </div>

              <div className={`border rounded-lg p-4 ${previewMode ? 'bg-gray-50' : 'bg-white'}`}>
                <div
                  dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                  className={previewMode ? 'transform scale-75 origin-top-left' : ''}
                />
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReceiptSettings;
