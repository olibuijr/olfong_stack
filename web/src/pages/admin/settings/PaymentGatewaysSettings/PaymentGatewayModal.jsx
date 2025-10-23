import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, TestTube } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const PaymentGatewayModal = ({ 
  isOpen, 
  onClose, 
  gatewayData, 
  onSave 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    displayName: '',
    provider: '',
    description: '',
    environment: 'sandbox',
    isEnabled: false,
    supportedMethods: [],
    // Common fields
    merchantId: '',
    apiKey: '',
    secretKey: '',
    webhookSecret: '',
    // Provider-specific fields
    accessKey: '', // Rapyd
    publishableKey: '', // Stripe
    clientId: '', // PayPal
    clientSecret: '', // PayPal
    applicationId: '', // Netgiro
    paymentGatewayId: '', // Teya
    privateKey: '', // Teya
    publicKey: '', // Teya
    // Additional configuration
    config: {}
  });
  const [showSecrets, setShowSecrets] = useState({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    if (gatewayData && isOpen) {
      setFormData({
        displayName: gatewayData.displayName || '',
        provider: gatewayData.provider || '',
        description: gatewayData.description || '',
        environment: gatewayData.environment || 'sandbox',
        isEnabled: gatewayData.isEnabled || false,
        supportedMethods: gatewayData.supportedMethods || [],
        // Common fields
        merchantId: gatewayData.merchantId || '',
        apiKey: gatewayData.apiKey || '',
        secretKey: gatewayData.secretKey || '',
        webhookSecret: gatewayData.webhookSecret || '',
        // Provider-specific fields
        accessKey: gatewayData.accessKey || '',
        publishableKey: gatewayData.publishableKey || '',
        clientId: gatewayData.clientId || '',
        clientSecret: gatewayData.clientSecret || '',
        applicationId: gatewayData.applicationId || '',
        paymentGatewayId: gatewayData.paymentGatewayId || '',
        privateKey: gatewayData.privateKey || '',
        publicKey: gatewayData.publicKey || '',
        // Additional configuration
        config: gatewayData.config || {}
      });
    } else if (isOpen) {
      setFormData({
        displayName: '',
        provider: '',
        description: '',
        environment: 'sandbox',
        isEnabled: false,
        supportedMethods: [],
        merchantId: '',
        apiKey: '',
        secretKey: '',
        webhookSecret: '',
        accessKey: '',
        publishableKey: '',
        clientId: '',
        clientSecret: '',
        applicationId: '',
        paymentGatewayId: '',
        privateKey: '',
        publicKey: '',
        config: {}
      });
    }
  }, [gatewayData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      toast.error(t('adminSettings.errorSavingPaymentGateway'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const testConnection = async () => {
    if (!formData.provider) {
      toast.error(t('adminSettings.pleaseSelectProvider'));
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(`/api/payment-gateways/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: formData.provider,
          environment: formData.environment,
          ...formData
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(t('adminSettings.connectionTestSuccessful'));
      } else {
        toast.error(result.message || t('adminSettings.connectionTestFailed'));
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error(t('adminSettings.connectionTestFailed'));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getProviderFields = () => {
    const provider = formData.provider;
    
    switch (provider) {
      case 'valitor':
        return [
          { name: 'merchantId', label: t('adminSettings.merchantId'), type: 'text', required: true, placeholder: t('adminSettings.enterMerchantId') },
          { name: 'apiKey', label: t('adminSettings.apiKey'), type: 'password', required: true, placeholder: t('adminSettings.enterApiKey') },
          { name: 'secretKey', label: t('adminSettings.secretKey'), type: 'password', required: true, placeholder: t('adminSettings.enterSecretKey') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      case 'rapyd':
        return [
          { name: 'accessKey', label: t('adminSettings.accessKey'), type: 'password', required: true, placeholder: t('adminSettings.enterAccessKey') },
          { name: 'secretKey', label: t('adminSettings.secretKey'), type: 'password', required: true, placeholder: t('adminSettings.enterSecretKey') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      case 'stripe':
        return [
          { name: 'publishableKey', label: t('adminSettings.publishableKey'), type: 'password', required: true, placeholder: t('adminSettings.enterPublishableKey') },
          { name: 'secretKey', label: t('adminSettings.secretKey'), type: 'password', required: true, placeholder: t('adminSettings.enterSecretKey') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      case 'paypal':
        return [
          { name: 'clientId', label: t('adminSettings.clientId'), type: 'password', required: true, placeholder: t('adminSettings.enterClientId') },
          { name: 'clientSecret', label: t('adminSettings.clientSecret'), type: 'password', required: true, placeholder: t('adminSettings.enterClientSecret') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      case 'netgiro':
        return [
          { name: 'applicationId', label: t('adminSettings.applicationId'), type: 'text', required: true, placeholder: t('adminSettings.enterApplicationId') },
          { name: 'secretKey', label: t('adminSettings.secretKey'), type: 'password', required: true, placeholder: t('adminSettings.enterSecretKey') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      case 'teya':
        return [
          { name: 'merchantId', label: t('adminSettings.merchantId'), type: 'text', required: true, placeholder: t('adminSettings.enterMerchantId') },
          { name: 'paymentGatewayId', label: t('adminSettings.paymentGatewayId'), type: 'text', required: true, placeholder: t('adminSettings.enterPaymentGatewayId') },
          { name: 'secretKey', label: t('adminSettings.secretKey'), type: 'password', required: true, placeholder: t('adminSettings.enterSecretKey') },
          { name: 'privateKey', label: t('adminSettings.privateKey'), type: 'password', required: false, placeholder: t('adminSettings.enterPrivateKey') },
          { name: 'publicKey', label: t('adminSettings.publicKey'), type: 'password', required: false, placeholder: t('adminSettings.enterPublicKey') },
          { name: 'webhookSecret', label: t('adminSettings.webhookSecret'), type: 'password', required: false, placeholder: t('adminSettings.enterWebhookSecret') }
        ];
      
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {gatewayData?.id ? t('adminSettings.editPaymentGateway') : t('adminSettings.addPaymentGateway')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.displayName')}
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.provider')}
            </label>
            <select
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">{t('adminSettings.selectPaymentProvider')}</option>
              <option value="valitor">{t('adminSettings.valitor')}</option>
              <option value="rapyd">{t('adminSettings.rapyd')}</option>
              <option value="stripe">{t('adminSettings.stripe')}</option>
              <option value="paypal">{t('adminSettings.paypal')}</option>
              <option value="netgiro">{t('adminSettings.netgiro')}</option>
              <option value="teya">{t('adminSettings.teya')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.environment')}
            </label>
            <select
              name="environment"
              value={formData.environment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sandbox">{t('adminSettings.sandbox')}</option>
              <option value="production">{t('adminSettings.production')}</option>
            </select>
          </div>

          {/* Provider-specific configuration fields */}
          {formData.provider && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {formData.provider ? `${formData.provider.charAt(0).toUpperCase() + formData.provider.slice(1)} ${t('adminSettings.configuration')}` : t('adminSettings.configuration')}
                </h3>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTestingConnection ? t('adminSettings.testing') : t('adminSettings.testConnection')}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getProviderFields().map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showSecrets[field.name] ? 'password' : 'text'}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required={field.required}
                        placeholder={t('adminSettings.enterFieldLabel', { fieldLabel: field.label.toLowerCase() })}
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(field.name)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showSecrets[field.name] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supported Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('adminSettings.supportedPaymentMethods')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'card', 'visa', 'mastercard', 'amex', 'diners', 'jcb',
                'paypal', 'apple_pay', 'google_pay', 'bank_transfer',
                'sepa', 'ideal', 'sofort', 'giropay', 'eps', 'bancontact'
              ].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.supportedMethods.includes(method)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          supportedMethods: [...prev.supportedMethods, method]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          supportedMethods: prev.supportedMethods.filter(m => m !== method)
                        }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isEnabled"
              checked={formData.isEnabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t('adminSettings.enabled')}
            </label>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formData.provider && (
                <p>
                  <strong>Provider:</strong> {formData.provider.charAt(0).toUpperCase() + formData.provider.slice(1)} | 
                  <strong> Environment:</strong> {formData.environment}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                {t('adminSettings.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {gatewayData?.id ? t('adminSettings.updateGateway') : t('adminSettings.createGateway')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

PaymentGatewayModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  gatewayData: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    provider: PropTypes.string,
    description: PropTypes.string,
    environment: PropTypes.string,
    isEnabled: PropTypes.bool,
    supportedMethods: PropTypes.arrayOf(PropTypes.string),
    merchantId: PropTypes.string,
    apiKey: PropTypes.string,
    secretKey: PropTypes.string,
    webhookSecret: PropTypes.string,
    accessKey: PropTypes.string,
    publishableKey: PropTypes.string,
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    applicationId: PropTypes.string,
    paymentGatewayId: PropTypes.string,
    privateKey: PropTypes.string,
    publicKey: PropTypes.string,
    config: PropTypes.object
  }),
  onSave: PropTypes.func.isRequired
};

export default PaymentGatewayModal;