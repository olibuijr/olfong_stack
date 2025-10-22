import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../../contexts/LanguageContext";
import toast from 'react-hot-toast';

// Import sub-components
import PaymentGatewayHeader from './PaymentGatewayHeader';
import PaymentGatewayCard from './PaymentGatewayCard';
import PaymentGatewayEmptyState from './PaymentGatewayEmptyState';
import PaymentGatewayInfoBanner from './PaymentGatewayInfoBanner';
import PaymentGatewayModal from './PaymentGatewayModal';

const PaymentGatewaysSettings = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editingGatewayData, setEditingGatewayData] = useState({});

  useEffect(() => {
    loadPaymentGateways();
  }, [loadPaymentGateways]);

  const loadPaymentGateways = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment-gateways', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentGateways(data.data.gateways || []);
      }
    } catch (error) {
      console.error('Error loading payment gateways:', error);
      toast.error(t('adminSettings', 'errorLoadingPaymentGateways'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleGatewayToggle = async (gatewayId, isEnabled) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': t('adminSettings', 'contentType'),
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
        throw new Error(t('adminSettings', 'errorTogglingPaymentGateway'));
      }
    } catch (error) {
      console.error('Error toggling payment gateway:', error);
      toast.error(t('adminSettings', 'errorTogglingPaymentGateway'));
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
        toast.success(t('adminSettings', 'paymentGatewayTestSuccessful'));
      } else {
        const errorData = await response.json();
        toast.error(t('adminSettings.paymentGatewayTestFailed', { message: errorData.message || 'Unknown error' }));
      }
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      toast.error(t('adminSettings', 'errorTestingPaymentGateway'));
    }
  };


  const handleGatewayEdit = (gateway) => {
    setEditingGatewayData(gateway);
    setShowGatewayModal(true);
  };


  const handleSaveGateway = async (gatewayData) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': t('adminSettings', 'contentType'),
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(gatewayData)
      });

      if (response.ok) {
        await loadPaymentGateways();
        toast.success(t('adminSettings', 'paymentGatewayUpdatedSuccessfully'));
      } else {
        throw new Error(t('adminSettings', 'errorUpdatingPaymentGateway'));
      }
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast.error(t('adminSettings', 'errorUpdatingPaymentGateway'));
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowGatewayModal(false);
    setEditingGatewayData({});
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="text-red-400 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('adminSettings', 'accessDenied')}</h1>
            <p className="text-gray-700">{t('adminSettings', 'noPermissionMessage')}</p>
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
        <PaymentGatewayHeader />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 space-y-6">
            <PaymentGatewayInfoBanner />

            {paymentGateways.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paymentGateways.map((gateway) => (
                    <PaymentGatewayCard
                      key={gateway.id}
                      gateway={gateway}
                      onToggle={handleGatewayToggle}
                      onTest={handleGatewayTest}
                      onEdit={handleGatewayEdit}
                    />
                  ))}
              </div>
            ) : (
              <PaymentGatewayEmptyState />
            )}
          </div>
        </div>

        <PaymentGatewayModal
          isOpen={showGatewayModal}
          onClose={handleCloseModal}
          gatewayData={editingGatewayData}
          onSave={handleSaveGateway}
        />
      </div>
    </AdminLayout>
  );
};

export default PaymentGatewaysSettings;