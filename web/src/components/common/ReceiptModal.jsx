import { useState, useEffect } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { X, Printer, Mail, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceiptSettings } from '../../store/slices/receiptSettingsSlice';
import { sendReceiptEmail } from '../../store/slices/orderSlice';
import Receipt from './Receipt';

const ReceiptModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onEmailSent 
}) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [previewMode, setPreviewMode] = useState('screen'); // screen, print

  const { receiptSettings, loading: settingsLoading } = useSelector(
    state => state.receiptSettings
  );

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isOpen && !receiptSettings) {
      dispatch(fetchReceiptSettings());
    }
  }, [isOpen, receiptSettings, dispatch]);

  const handlePrint = () => {
    setPreviewMode('print');
    setTimeout(() => {
      window.print();
      setPreviewMode('screen');
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (!order?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/receipt/pdf`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t('receipts.pdfDownloadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailReceipt = async () => {
    if (!order?.id || !order?.customer?.email) {
      alert(t('receipts.noEmailAddress'));
      return;
    }

    setIsLoading(true);
    setEmailError(null);
    
    try {
      const result = await dispatch(sendReceiptEmail({
        orderId: order.id,
        email: order.customer.email
      })).unwrap();
      
      setEmailSent(true);
      if (onEmailSent) {
        onEmailSent(result);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.message || t('receipts.emailSendError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('receipts.receiptForOrder')} #{order.orderNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handlePrint}
              className="btn btn-outline flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {t('receipts.print')}
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="btn btn-outline flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isLoading ? t('common.loading') : t('receipts.downloadPdf')}
            </button>
            
            {order.customer?.email && (
              <button
                onClick={handleEmailReceipt}
                disabled={isLoading || emailSent}
                className={`btn flex items-center gap-2 ${
                  emailSent ? 'btn-secondary' : 'btn-primary'
                }`}
              >
                <Mail className="w-4 h-4" />
                {isLoading 
                  ? t('common.sending') 
                  : emailSent 
                    ? t('receipts.emailSent') 
                    : t('receipts.emailReceipt')
                }
              </button>
            )}
          </div>

          {/* Email Status */}
          {emailError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {emailError}
            </div>
          )}

          {emailSent && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {t('receipts.emailSentSuccess')}
            </div>
          )}

          {/* Receipt Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            {settingsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">{t('common.loading')}</div>
              </div>
            ) : receiptSettings ? (
              <div className="max-w-md mx-auto">
                <Receipt
                  order={order}
                  settings={receiptSettings}
                  template={receiptSettings.template}
                  paperSize={receiptSettings.paperSize}
                  showBarcode={receiptSettings.showBarcode}
                  showQrCode={receiptSettings.showQrCode}
                  className={previewMode === 'print' ? 'receipt-print' : ''}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                {t('receipts.settingsNotFound')}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
