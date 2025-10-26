const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTeyaGateway() {
  try {
    // Check if Teya already exists
    const existing = await prisma.paymentGateway.findUnique({
      where: { name: 'Teya' }
    });

    if (existing) {
      console.log('Teya gateway already exists, updating with bilingual names...');
      await prisma.paymentGateway.update({
        where: { name: 'Teya' },
        data: {
          displayNameEn: 'Teya Payment Gateway',
          displayNameIs: 'Teya Greiðslugátt',
          isEnabled: true,
          isActive: true
        }
      });
    } else {
      console.log('Creating Teya payment gateway...');
      await prisma.paymentGateway.create({
        data: {
          name: 'Teya',
          displayName: 'Teya Payment Gateway',
          displayNameEn: 'Teya Payment Gateway',
          displayNameIs: 'Teya Greiðslugátt',
          provider: 'teya',
          isEnabled: true,
          isActive: true,
          sortOrder: 8,
          environment: 'sandbox',
          supportedCurrencies: ['ISK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK', 'SEK', 'CHF', 'CAD', 'AUD'],
          supportedCountries: ['IS', 'DK', 'NO', 'SE', 'FI', 'DE', 'FR', 'GB', 'US', 'CA', 'AU', 'CH'],
          supportedMethods: ['card', 'visa', 'mastercard', 'amex', 'diners', 'jcb', 'discover', 'maestro', 'visa_electron', 'bank_transfer', 'sepa', 'klarna', 'afterpay', 'paypal', 'apple_pay', 'google_pay'],
          description: 'Icelandic payment gateway supporting major credit cards and international payment methods',
          logoUrl: 'https://www.teya.com/wp-content/themes/teya/assets/images/teya-logo.svg'
        }
      });
    }

    console.log('✓ Teya payment gateway configured successfully!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTeyaGateway();
