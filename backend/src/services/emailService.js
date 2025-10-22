const { getSMTPTransporter } = require('../controllers/smtpSettingsController');
const prisma = require('../config/database');

class EmailService {
  /**
   * Get SMTP transporter
   */
  async getTransporter() {
    return await getSMTPTransporter();
  }

  /**
   * Send receipt email
   */
  async sendReceiptEmail(orderId, recipientEmail, language = 'en') {
    try {
      const transporter = await this.getTransporter();
      
      // Get order details with all relations
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

      // Get receipt settings
      const receiptSettings = await prisma.receiptSettings.findFirst();
      if (!receiptSettings) {
        throw new Error('Receipt settings not configured');
      }

      // Generate receipt HTML
      const receiptHtml = await this.generateReceiptHTML(order, receiptSettings, language);
      
      // Generate PDF attachment
      const pdfBuffer = await this.generateReceiptPDF(receiptHtml);

      // Prepare email
      const isIcelandic = language === 'is';
      const companyName = isIcelandic ? receiptSettings.companyNameIs : receiptSettings.companyName;
      const fromName = isIcelandic ? receiptSettings.fromNameIs : receiptSettings.fromName;
      
      const emailSubject = isIcelandic 
        ? `Kvittun fyrir pöntun ${order.orderNumber} - ${companyName}`
        : `Receipt for order ${order.orderNumber} - ${companyName}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${receiptSettings.headerColor}; margin: 0;">
              ${isIcelandic ? 'Kvittun' : 'Receipt'}
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">
              ${isIcelandic ? 'Pöntun' : 'Order'}: ${order.orderNumber}
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">
              ${isIcelandic ? 'Pöntunardetails' : 'Order Details'}
            </h3>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>${isIcelandic ? 'Dagsetning' : 'Date'}:</strong> ${new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>${isIcelandic ? 'Staða' : 'Status'}:</strong> ${order.status}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>${isIcelandic ? 'Heildarupphæð' : 'Total Amount'}:</strong> ${order.totalAmount.toLocaleString()} ISK
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">
              ${isIcelandic ? 'Vörur' : 'Items'}
            </h3>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <div>
                  <p style="margin: 0; font-weight: 500;">${isIcelandic ? item.product.nameIs : item.product.name}</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">${isIcelandic ? 'Magn' : 'Qty'}: ${item.quantity}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: 500;">${(item.price * item.quantity).toLocaleString()} ISK</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">${item.price.toLocaleString()} ISK ${isIcelandic ? 'á stk' : 'each'}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid ${receiptSettings.accentColor};">
            <p style="margin: 0; color: #6b7280;">
              ${isIcelandic ? 'Takk fyrir að versla hjá okkur!' : 'Thank you for your business!'}
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
              ${companyName}
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${fromName}" <${receiptSettings.companyEmail}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: `receipt-${order.orderNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Receipt email sent successfully'
      };

    } catch (error) {
      console.error('Send receipt email error:', error);
      throw error;
    }
  }

  /**
   * Generate receipt HTML
   */
  async generateReceiptHTML(order, settings, language = 'en') {
    const isIcelandic = language === 'is';
    const companyName = isIcelandic ? settings.companyNameIs : settings.companyName;
    const companyAddress = isIcelandic ? settings.companyAddressIs : settings.companyAddress;
    const footerText = isIcelandic ? settings.footerTextIs : settings.footerText;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${isIcelandic ? 'Kvittun' : 'Receipt'} - ${order.orderNumber}</title>
        <style>
          body {
            font-family: ${settings.fontFamily};
            font-size: ${settings.fontSize};
            margin: 0;
            padding: 20px;
            background: white;
            color: #000;
          }
          .receipt {
            max-width: 300px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid ${settings.headerColor};
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: ${settings.headerColor};
            margin: 0;
          }
          .company-details {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }
          .order-info {
            margin-bottom: 15px;
          }
          .order-number {
            font-weight: bold;
            font-size: 14px;
          }
          .order-date {
            font-size: 12px;
            color: #666;
          }
          .items {
            margin-bottom: 15px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px dotted #ccc;
          }
          .item-name {
            flex: 1;
            font-size: 12px;
          }
          .item-qty {
            font-size: 10px;
            color: #666;
          }
          .item-price {
            font-weight: bold;
            font-size: 12px;
          }
          .total {
            border-top: 2px solid ${settings.accentColor};
            padding-top: 10px;
            text-align: right;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #666;
          }
          .barcode {
            text-align: center;
            margin: 15px 0;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1 class="company-name">${companyName}</h1>
            ${settings.companyAddress ? `<div class="company-details">${companyAddress}</div>` : ''}
            ${settings.companyPhone ? `<div class="company-details">${settings.companyPhone}</div>` : ''}
            ${settings.companyEmail ? `<div class="company-details">${settings.companyEmail}</div>` : ''}
          </div>

          <div class="order-info">
            <div class="order-number">${isIcelandic ? 'Pöntun' : 'Order'}: ${order.orderNumber}</div>
            <div class="order-date">${isIcelandic ? 'Dagsetning' : 'Date'}: ${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>

          <div class="items">
            ${order.items.map(item => `
              <div class="item">
                <div>
                  <div class="item-name">${isIcelandic ? item.product.nameIs : item.product.name}</div>
                  <div class="item-qty">${isIcelandic ? 'Magn' : 'Qty'}: ${item.quantity} x ${item.price.toLocaleString()} ISK</div>
                </div>
                <div class="item-price">${(item.price * item.quantity).toLocaleString()} ISK</div>
              </div>
            `).join('')}
          </div>

          <div class="total">
            ${isIcelandic ? 'Heildarupphæð' : 'Total'}: ${order.totalAmount.toLocaleString()} ISK
          </div>

          ${settings.showBarcode ? `
            <div class="barcode">
              <div style="font-family: monospace; font-size: 10px;">${order.orderNumber}</div>
            </div>
          ` : ''}

          <div class="footer">
            ${footerText || (isIcelandic ? 'Takk fyrir viðskiptin!' : 'Thank you for your business!')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt PDF
   */
  async generateReceiptPDF(html) {
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
   * Test SMTP connection
   */
  async testConnection(smtpConfig) {
    try {
      const transporter = this.nodemailer.createTransporter(smtpConfig);
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
