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

  const { settings: receiptSettings, isLoading: settingsLoading } = useSelector(
    state => state.receiptSettings
  );

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isOpen && !receiptSettings) {
      dispatch(fetchReceiptSettings());
    }
  }, [isOpen, receiptSettings, dispatch]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="flex flex-col flex-1 overflow-hidden px-4 sm:px-6 py-5 sm:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('receipts.receiptForOrder')} #{order.orderNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={handlePrint}
              className="btn btn-outline flex items-center gap-2"
              disabled={isLoading}
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
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
              {emailError}
            </div>
          )}

          {emailSent && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded">
              {t('receipts.emailSentSuccess')}
            </div>
          )}

          {/* Receipt Preview */}
          <div className="flex flex-col flex-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
            {settingsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
              </div>
            ) : receiptSettings ? (
              <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 w-full">
                <div className="w-full h-full flex items-center justify-center">
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
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center overflow-y-auto p-4">
                <div className="max-w-md">
                  <div className="text-center mb-6">
                    <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                      {t('receipts.settingsNotFound')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {t('receipts.configureInSettings')}
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="font-semibold text-red-900 dark:text-red-200 mb-3 text-sm">
                      Required Configuration:
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Company Name (English & Icelandic)</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Company Address (English & Icelandic)</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Company Phone Number</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Company Email Address</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Header Color</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-800 dark:text-red-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                        <span>Paper Size Selection</span>
                      </li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                      <a
                        href="/admin/settings/receipts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
                      >
                        <span>Configure Receipt Settings</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn btn-secondary dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
