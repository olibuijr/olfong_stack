import { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { 
  Mail, 
  Save, 
  TestTube, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Server,
  Key,
  User,
  Lock
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { 
  fetchSMTPSettings, 
  updateSMTPSettings, 
  testSMTPConnection,
  updateSettingsField 
} from '../../../store/slices/smtpSettingsSlice';
import toast from 'react-hot-toast';

const SMTPSettings = () => {

  const dispatch = useDispatch();
  const { settings, isLoading, testResult, isTesting } = useSelector((state) => state.smtpSettings);

  const [formData, setFormData] = useState({
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSMTPSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        host: settings.host || '',
        port: settings.port || 587,
        secure: settings.secure || false,
        username: settings.username || '',
        password: '', // Never show the actual password
        fromEmail: settings.fromEmail || '',
        fromName: settings.fromName || 'Ölföng',
        fromNameIs: settings.fromNameIs || 'Ölföng',
        isEnabled: settings.isEnabled || false
      });
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    dispatch(updateSettingsField({ field, value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateSMTPSettings(formData)).unwrap();
      toast.success('SMTP settings saved successfully!');
    } catch (error) {
      toast.error(error || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.host || !formData.username || !formData.password || !formData.fromEmail) {
      toast.error('Please fill in all required fields before testing');
      return;
    }

    try {
      await dispatch(testSMTPConnection(formData)).unwrap();
      if (testResult?.success) {
        toast.success('SMTP test successful!');
      }
    } catch (error) {
      toast.error(error || 'SMTP test failed');
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure SMTP settings for sending receipt emails</p>
          </div>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{testResult.message}</p>
              {testResult.details && (
                <div className="mt-2 text-sm">
                  <p><strong>Host:</strong> {testResult.details.host}</p>
                  <p><strong>Port:</strong> {testResult.details.port}</p>
                  <p><strong>Secure:</strong> {testResult.details.secure ? 'Yes' : 'No'}</p>
                  <p><strong>Username:</strong> {testResult.details.username}</p>
                  <p><strong>From Email:</strong> {testResult.details.fromEmail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* SMTP Configuration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                SMTP Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    className="input w-full"
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                    className="input w-full"
                    placeholder="587"
                    min="1"
                    max="65535"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={formData.secure}
                    onChange={(e) => handleInputChange('secure', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="secure" className="text-sm text-gray-700 dark:text-gray-300">
                    Use TLS/SSL (recommended for port 587/465)
                  </label>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Authentication
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="input pl-10 w-full"
                      placeholder="your-email@gmail.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="input pl-10 pr-10 w-full"
                      placeholder="Your app password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For Gmail, use an App Password instead of your regular password
                  </p>
                </div>
              </div>
            </div>

            {/* Sender Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Sender Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                    className="input w-full"
                    placeholder="noreply@olfong.is"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.fromName}
                      onChange={(e) => handleInputChange('fromName', e.target.value)}
                      className="input w-full"
                      placeholder="Ölföng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name (Icelandic)
                    </label>
                    <input
                      type="text"
                      value={formData.fromNameIs}
                      onChange={(e) => handleInputChange('fromNameIs', e.target.value)}
                      className="input w-full"
                      placeholder="Ölföng"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enable/Disable */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                  className="mr-3"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable email sending
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, receipt emails will be sent to customers
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleTest}
                disabled={isTesting || !formData.host || !formData.username || !formData.password || !formData.fromEmail}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </button>

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
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Common SMTP Settings
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Gmail:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Host: smtp.gmail.com</li>
                <li>• Port: 587 (TLS) or 465 (SSL)</li>
                <li>• Username: your-email@gmail.com</li>
                <li>• Password: Use App Password (not your regular password)</li>
              </ul>
            </div>
            <div>
              <strong>Outlook/Hotmail:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Host: smtp-mail.outlook.com</li>
                <li>• Port: 587</li>
                <li>• Username: your-email@outlook.com</li>
                <li>• Password: Your regular password</li>
              </ul>
            </div>
            <div>
              <strong>Yahoo:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Host: smtp.mail.yahoo.com</li>
                <li>• Port: 587 or 465</li>
                <li>• Username: your-email@yahoo.com</li>
                <li>• Password: Use App Password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SMTPSettings;
