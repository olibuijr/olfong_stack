const prisma = require('../config/database');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');

class ReceiptService {
  /**
   * Generate receipt HTML for an order
   */
  async generateReceiptHTML(orderId, language = 'en') {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              fullName: true,
              username: true,
              email: true
            }
          },
          address: true,
          shippingOption: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const settings = await prisma.receiptSettings.findFirst();
      if (!settings) {
        throw new Error('Receipt settings not configured');
      }

      return await this.generateReceiptHTMLFromData(order, settings, language);
    } catch (error) {
      console.error('Generate receipt HTML error:', error);
      throw error;
    }
  }

  /**
   * Generate receipt HTML from order data
   */
  async generateReceiptHTMLFromData(order, settings, language = 'en') {
    const isIcelandic = language === 'is';
    const companyName = isIcelandic ? settings.companyNameIs : settings.companyName;
    const companyAddress = isIcelandic ? settings.companyAddressIs : settings.companyAddress;
    const footerText = isIcelandic ? settings.footerTextIs : settings.footerText;

    // Generate QR code if enabled
    let qrCodeDataUrl = '';
    if (settings.showQrCode) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(order.orderNumber, {
          width: 100,
          margin: 1,
          color: {
            dark: settings.headerColor,
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('QR code generation error:', error);
      }
    }

    // Generate barcode if enabled
    let barcodeSvg = '';
    if (settings.showBarcode) {
      try {
        barcodeSvg = await bwipjs.toSVG({
          bcid: 'code128',
          text: order.orderNumber,
          scale: 2,
          height: 20,
          includetext: false
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${isIcelandic ? 'Kvittun' : 'Receipt'} - ${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${settings.fontFamily};
            font-size: ${settings.fontSize};
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 10px;
          }
          
          .receipt {
            max-width: ${settings.paperSize === '80mm' ? '300px' : '100%'};
            margin: 0 auto;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .receipt-${settings.template} {
            /* Template-specific styles will be applied here */
          }
          
          .header {
            background: ${settings.headerColor};
            color: white;
            text-align: center;
            padding: 15px;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .company-details {
            font-size: 12px;
            opacity: 0.9;
            margin: 2px 0;
          }
          
          .content {
            padding: 15px;
          }
          
          .order-info {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .order-number {
            font-weight: bold;
            font-size: 16px;
            color: ${settings.accentColor};
            margin-bottom: 5px;
          }
          
          .order-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #6b7280;
          }
          
          .items {
            margin-bottom: 15px;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px dotted #d1d5db;
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-info {
            flex: 1;
            margin-right: 10px;
          }
          
          .item-name {
            font-weight: 500;
            font-size: 13px;
            margin-bottom: 2px;
          }
          
          .item-details {
            font-size: 11px;
            color: #6b7280;
          }
          
          .item-price {
            font-weight: bold;
            font-size: 13px;
            text-align: right;
            min-width: 60px;
          }
          
          .totals {
            border-top: 2px solid ${settings.accentColor};
            padding-top: 10px;
            margin-top: 15px;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 13px;
          }
          
          .total-line.final {
            font-weight: bold;
            font-size: 16px;
            color: ${settings.headerColor};
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            margin-top: 8px;
          }
          
          .codes {
            text-align: center;
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .qr-code {
            margin-bottom: 10px;
          }
          
          .qr-code img {
            max-width: 100px;
            height: auto;
          }
          
          .barcode {
            margin-top: 10px;
          }
          
          .barcode svg {
            max-width: 200px;
            height: auto;
          }
          
          .footer {
            text-align: center;
            padding: 15px;
            background: #f9fafb;
            font-size: 11px;
            color: #6b7280;
          }
          
          .footer-text {
            margin-bottom: 5px;
          }
          
          .company-info {
            font-size: 10px;
            opacity: 0.8;
          }
          
          /* Print styles */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .receipt {
              border: none;
              border-radius: 0;
              max-width: none;
              width: 100%;
            }
            
            .header {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .no-print {
              display: none !important;
            }
          }
          
          /* Template variations */
          .receipt-modern .header {
            background: linear-gradient(135deg, ${settings.headerColor}, ${settings.accentColor});
          }
          
          .receipt-classic .header {
            background: ${settings.headerColor};
            border-bottom: 3px solid ${settings.accentColor};
          }
          
          .receipt-minimal .header {
            background: white;
            color: ${settings.headerColor};
            border-bottom: 1px solid ${settings.headerColor};
          }
          
          .receipt-minimal .company-name {
            color: ${settings.headerColor};
          }
        </style>
      </head>
      <body>
        <div class="receipt receipt-${settings.template}">
          <div class="header">
            <h1 class="company-name">${companyName}</h1>
            ${companyAddress ? `<div class="company-details">${companyAddress}</div>` : ''}
            ${settings.companyPhone ? `<div class="company-details">${settings.companyPhone}</div>` : ''}
            ${settings.companyEmail ? `<div class="company-details">${settings.companyEmail}</div>` : ''}
            ${settings.taxId ? `<div class="company-details">${isIcelandic ? 'Kennitala' : 'Tax ID'}: ${settings.taxId}</div>` : ''}
          </div>

          <div class="content">
            <div class="order-info">
              <div class="order-number">${isIcelandic ? 'Pöntun' : 'Order'}: ${order.orderNumber}</div>
              <div class="order-details">
                <span>${isIcelandic ? 'Dagsetning' : 'Date'}: ${new Date(order.createdAt).toLocaleDateString()}</span>
                <span>${isIcelandic ? 'Staða' : 'Status'}: ${order.status}</span>
              </div>
            </div>

            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  <div class="item-info">
                    <div class="item-name">${isIcelandic ? item.product.nameIs : item.product.name}</div>
                    <div class="item-details">
                      ${isIcelandic ? 'Magn' : 'Qty'}: ${item.quantity} × ${item.price.toLocaleString()} ISK
                    </div>
                  </div>
                  <div class="item-price">${(item.price * item.quantity).toLocaleString()} ISK</div>
                </div>
              `).join('')}
            </div>

            <div class="totals">
              <div class="total-line">
                <span>${isIcelandic ? 'Vörur' : 'Subtotal'}:</span>
                <span>${(order.totalAmount - (order.deliveryFee || 0)).toLocaleString()} ISK</span>
              </div>
              ${order.deliveryFee > 0 ? `
                <div class="total-line">
                  <span>${isIcelandic ? 'Sending' : 'Delivery'}:</span>
                  <span>${order.deliveryFee.toLocaleString()} ISK</span>
                </div>
              ` : ''}
              <div class="total-line final">
                <span>${isIcelandic ? 'Heildarupphæð' : 'Total'}:</span>
                <span>${order.totalAmount.toLocaleString()} ISK</span>
              </div>
            </div>

            ${(settings.showQrCode && qrCodeDataUrl) || (settings.showBarcode && barcodeSvg) ? `
              <div class="codes">
                ${settings.showQrCode && qrCodeDataUrl ? `
                  <div class="qr-code">
                    <img src="${qrCodeDataUrl}" alt="QR Code" />
                  </div>
                ` : ''}
                ${settings.showBarcode && barcodeSvg ? `
                  <div class="barcode">
                    ${barcodeSvg}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <div class="footer">
            ${footerText ? `<div class="footer-text">${footerText}</div>` : ''}
            <div class="company-info">
              ${settings.companyWebsite ? `${settings.companyWebsite}<br>` : ''}
              ${isIcelandic ? 'Takk fyrir viðskiptin!' : 'Thank you for your business!'}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt PDF
   */
  async generateReceiptPDF(orderId, language = 'en') {
    try {
      const html = await this.generateReceiptHTML(orderId, language);
      return await this.generatePDFFromHTML(html);
    } catch (error) {
      console.error('Generate receipt PDF error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF from HTML
   */
  async generatePDFFromHTML(html) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      
      await browser.close();
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Get receipt template by name
   */
  async getReceiptTemplate(templateName) {
    const templates = {
      modern: 'modern',
      classic: 'classic',
      minimal: 'minimal'
    };
    
    return templates[templateName] || 'modern';
  }
}

module.exports = new ReceiptService();
