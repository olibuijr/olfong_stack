
import QRCode from 'react-qr-code';

const Receipt = ({ 
  order, 
  settings, 
  template = 'modern',
  paperSize = '80mm',
  showBarcode = true,
  showQrCode = true,
  className = ''
}) => {
  
  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('is-IS', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `${formatted} kr.`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('is-IS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getCompanyName = () => {
    return settings.companyNameIs || settings.companyName;
  };

  const getCompanyAddress = () => {
    return settings.companyAddressIs || settings.companyAddress;
  };

  const getFooterText = () => {
    return settings.footerTextIs || settings.footerText;
  };

  const getFromName = () => {
    return settings.fromNameIs || settings.fromName;
  };

  const getLogoStyle = () => {
    const logoInversion = settings.logoInversion || 'none';

    if (logoInversion === 'always') {
      return { filter: 'invert(1)' };
    }

    // For theme-aware, we would need to detect dark mode
    // Since this is just for receipt display, we'll leave it as is
    return {};
  };

  const getLogoUrl = () => {
    if (!settings.logoUrl) return null;

    // If the URL is already absolute (starts with http), return it as is
    if (settings.logoUrl.startsWith('http')) {
      return settings.logoUrl;
    }

    // Otherwise, construct the full URL using the API base URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.8.62:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${settings.logoUrl}`;
  };

  const getHeaderStyle = () => {
    const baseStyle = { color: 'white' };
    if (settings.useGradient && settings.headerGradient) {
      return {
        ...baseStyle,
        background: settings.headerGradient,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      };
    }
    return {
      ...baseStyle,
      backgroundColor: settings.headerColor || '#1e40af',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    };
  };

  // Convert paperSize to a valid CSS class name
  const paperSizeClass = paperSize.toLowerCase().replace(/[^a-z0-9]/g, '');
  const templateClass = template || 'modern';

  return (
    <div
      className={`receipt receipt-${templateClass} receipt-${paperSizeClass} ${className}`}
      style={{
        '--receipt-header-color': settings.headerColor || '#1e40af',
        '--receipt-accent-color': settings.accentColor || '#3b82f6',
        fontFamily: settings.fontFamily || "'Courier New', monospace",
        fontSize: settings.fontSize || '14px',
        padding: 0,
      }}
    >
      {/* Header */}
      <div className="header" style={{...getHeaderStyle(), margin: 0}}>
        {getLogoUrl() && (
          <div className="mb-2 flex justify-center">
            <img
              src={getLogoUrl()}
              alt={getCompanyName()}
              className="h-12"
              style={{ maxHeight: '48px', ...getLogoStyle() }}
            />
          </div>
        )}
        {!getLogoUrl() && (
          <div className="company-name" style={{ color: 'white' }}>
            {getCompanyName()}
          </div>
        )}
        {getCompanyAddress() && (
          <div className="company-details">
            {getCompanyAddress()}
          </div>
        )}
        {settings.companyPhone && (
          <div className="company-details">
            {settings.companyPhone}
          </div>
        )}
        {settings.companyEmail && (
          <div className="company-details">
            {settings.companyEmail}
          </div>
        )}
        {settings.companyWebsite && (
          <div className="company-details">
            {settings.companyWebsite}
          </div>
        )}
        {settings.taxId && (
          <div className="company-details">
            {'VSK nr.'}: {settings.taxId}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="content">
        {/* Order Info */}
        <div className="order-info">
          <div className="order-number">
            {'Pöntun'}: #{order.orderNumber}
          </div>
          <div className="order-details">
            {'Dagsetning'}: {formatDate(order.createdAt)}
          </div>
          {order.customer && (
            <div className="order-details">
              {'Viðskiptavinur'}: {order.customer.name}
            </div>
          )}
          {order.deliveryMethod && (
            <div className="order-details">
              {'Afhendingaraðferð'}: {order.deliveryMethod === 'PICKUP' ? 'Sækja í verslun' : 'Heimsending'}
            </div>
          )}
          {order.deliveryMethod === 'PICKUP' && order.pickupTime && (
            <div className="order-details">
              {'Afhendingartími'}: {order.pickupTime}
            </div>
          )}
          {order.deliveryAddress && (
            <div className="order-details">
              {'Heimilisfang'}: {order.deliveryAddress.address}
            </div>
          )}
          {order.paymentMethod && (
            <div className="order-details">
              {'Greiðsla'}: {order.paymentMethod}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="items">
          {order.items?.map((item, index) => (
            <div key={index} className="item">
              <div className="flex-1">
                <div className="item-name">{item.product?.name}</div>
                {item.quantity > 1 && (
                  <div className="item-details">
                    {item.quantity} x {formatCurrency(item.price || 0)}
                  </div>
                )}
                {item.notes && (
                  <div className="item-details">
                    {'Athugasemd'}: {item.notes}
                  </div>
                )}
              </div>
              <div className="item-price">
                {formatCurrency((item.price || 0) * (item.quantity || 1))}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="totals">
          <div className="total-line">
            <span>{'Vörur'}:</span>
            <span>{formatCurrency(order.subtotal || 0)}</span>
          </div>
          {order.shippingCost > 0 && (
            <div className="total-line">
              <span>{'Sendingarkostnaður'}:</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="total-line">
              <span>{'VSK'}:</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
          )}
          <div className="total-line final">
            <span>{'Samtals'}:</span>
            <span>{formatCurrency(order.totalAmount || 0)}</span>
          </div>
        </div>

        {/* Codes */}
        {(showBarcode || showQrCode) && (
          <div className="codes">
            {showQrCode && (
              <div className="qr-code">
                <div className="text-xs mb-1">
                  {'QR kóði'}
                </div>
                <div className="w-20 h-20 mx-auto flex items-center justify-center">
                  <QRCode
                    value={`${window.location.origin}/orders/${order.id}`}
                    size={80}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
              </div>
            )}
            {showBarcode && (
              <div className="barcode">
                <div className="text-xs mb-1">
                  {'Strikamerki'}
                </div>
                {/* Barcode would be generated here */}
                <div className="h-8 bg-gray-200 mx-auto flex items-center justify-center text-xs">
                  ||||||||||||||||||||
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          {getFooterText() && (
            <div className="footer-text">
              {getFooterText()}
            </div>
          )}
          <div className="company-info">
            {getFromName()} - {getCompanyAddress()}
          </div>
          <div className="company-info">
            {settings.companyPhone} - {settings.companyEmail}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
