const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption key for sensitive data (should match the one in controller)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

// Helper function to encrypt sensitive data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

async function seedPaymentGateways() {
  console.log('🌱 Starting payment gateways seeding...');

  try {
    // Create Valitor payment gateway
    const valitorGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Valitor' },
      update: {},
      create: {
        name: 'Valitor',
        displayName: 'Valitor Payment Gateway',
        provider: 'valitor',
        isEnabled: false, // Disabled by default
        isActive: true,
        sortOrder: 1,
        config: JSON.stringify({
          apiVersion: 'v1',
          timeout: 30000,
          retryAttempts: 3,
          webhookUrl: '/api/webhooks/valitor',
        }),
        merchantId: null, // To be filled by admin
        apiKey: null, // To be filled by admin
        secretKey: null, // To be filled by admin
        webhookSecret: null, // To be filled by admin
        environment: 'sandbox',
        supportedCurrencies: ['ISK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK', 'SEK'],
        supportedCountries: ['IS', 'DK', 'NO', 'SE', 'FI', 'DE', 'FR', 'GB', 'US'],
        supportedMethods: ['card', 'visa', 'mastercard', 'amex', 'diners', 'jcb'],
        description: 'Icelandic payment gateway supporting major credit cards and local payment methods',
        logoUrl: 'https://www.valitor.com/wp-content/themes/valitor/assets/images/valitor-logo.svg',
        website: 'https://www.valitor.com',
        documentation: 'https://www.valitor.com/developers',
      },
    });

    console.log('✅ Created Valitor payment gateway:', valitorGateway.name);

    // Create Rapyd payment gateway
    const rapydGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Rapyd' },
      update: {},
      create: {
        name: 'Rapyd',
        displayName: 'Rapyd Payment Platform',
        provider: 'rapyd',
        isEnabled: false, // Disabled by default
        isActive: true,
        sortOrder: 2,
        config: JSON.stringify({
          apiVersion: 'v1',
          timeout: 30000,
          retryAttempts: 3,
          webhookUrl: '/api/webhooks/rapyd',
          supportedPaymentTypes: ['card', 'bank_transfer', 'ewallet', 'cash'],
        }),
        merchantId: null, // To be filled by admin
        apiKey: null, // To be filled by admin
        secretKey: null, // To be filled by admin
        webhookSecret: null, // To be filled by admin
        environment: 'sandbox',
        supportedCurrencies: [
          'ISK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK', 'SEK', 'CHF', 'CAD', 'AUD'
        ],
        supportedCountries: [
          'IS', 'DK', 'NO', 'SE', 'FI', 'DE', 'FR', 'GB', 'US', 'CA', 'AU', 'CH',
          'AT', 'BE', 'NL', 'ES', 'IT', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG',
          'HR', 'SI', 'SK', 'LT', 'LV', 'EE'
        ],
        supportedMethods: [
          'card', 'bank_transfer', 'ewallet', 'cash', 'visa', 'mastercard',
          'amex', 'diners', 'jcb', 'discover', 'paypal', 'apple_pay',
          'google_pay', 'alipay', 'wechat_pay', 'klarna', 'afterpay',
          'sepa', 'ideal', 'sofort', 'giropay', 'eps', 'bancontact',
          'p24', 'blik'
        ],
        description: 'Global payment platform supporting 900+ payment methods across 100+ countries',
        logoUrl: 'https://www.rapyd.net/wp-content/themes/rapyd/assets/images/rapyd-logo.svg',
        website: 'https://www.rapyd.net',
        documentation: 'https://docs.rapyd.net',
      },
    });

    console.log('✅ Created Rapyd payment gateway:', rapydGateway.name);

    // Create additional payment gateways for future use
    const stripeGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Stripe' },
      update: {},
      create: {
        name: 'Stripe',
        displayName: 'Stripe Payment Gateway',
        provider: 'stripe',
        isEnabled: false,
        isActive: false, // Not active by default
        sortOrder: 3,
        config: JSON.stringify({
          apiVersion: '2020-08-27',
          timeout: 30000,
          retryAttempts: 3,
          webhookUrl: '/api/webhooks/stripe',
        }),
        merchantId: null,
        apiKey: null,
        secretKey: null,
        webhookSecret: null,
        environment: 'sandbox',
        supportedCurrencies: ['ISK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK', 'SEK'],
        supportedCountries: ['IS', 'DK', 'NO', 'SE', 'FI', 'DE', 'FR', 'GB', 'US'],
        supportedMethods: ['card', 'visa', 'mastercard', 'amex', 'diners', 'jcb'],
        description: 'Popular payment gateway supporting cards and alternative payment methods',
        logoUrl: 'https://js.stripe.com/v3/fingerprinted/img/stripe-logo.svg',
        website: 'https://stripe.com',
        documentation: 'https://stripe.com/docs',
      },
    });

    console.log('✅ Created Stripe payment gateway:', stripeGateway.name);

    const paypalGateway = await prisma.paymentGateway.upsert({
      where: { name: 'PayPal' },
      update: {},
      create: {
        name: 'PayPal',
        displayName: 'PayPal Payment Gateway',
        provider: 'paypal',
        isEnabled: false,
        isActive: false, // Not active by default
        sortOrder: 4,
        config: JSON.stringify({
          apiVersion: 'v2',
          timeout: 30000,
          retryAttempts: 3,
          webhookUrl: '/api/webhooks/paypal',
        }),
        merchantId: null,
        apiKey: null,
        secretKey: null,
        webhookSecret: null,
        environment: 'sandbox',
        supportedCurrencies: ['ISK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK', 'SEK'],
        supportedCountries: ['IS', 'DK', 'NO', 'SE', 'FI', 'DE', 'FR', 'GB', 'US'],
        supportedMethods: ['paypal', 'card', 'visa', 'mastercard', 'amex'],
        description: 'PayPal payment gateway for online payments and digital wallets',
        logoUrl: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg',
        website: 'https://www.paypal.com',
        documentation: 'https://developer.paypal.com/docs',
      },
    });

    console.log('✅ Created PayPal payment gateway:', paypalGateway.name);

    // Create Netgíró payment gateway
    const netgiroGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Netgíró' },
      update: {},
      create: {
        name: 'Netgíró',
        displayName: 'Netgíró Payment Gateway',
        provider: 'netgiro',
        isEnabled: false, // Disabled by default
        isActive: true,
        sortOrder: 5,
        config: JSON.stringify({
          apiVersion: 'v1',
          timeout: 30000,
          retryAttempts: 3,
          webhookUrl: '/api/webhooks/netgiro',
        }),
        merchantId: null, // To be filled by admin
        apiKey: null, // To be filled by admin
        secretKey: null, // To be filled by admin
        webhookSecret: null, // To be filled by admin
        environment: 'sandbox',
        supportedCurrencies: ['ISK', 'EUR', 'USD'],
        supportedCountries: ['IS'],
        supportedMethods: ['card', 'visa', 'mastercard', 'amex', 'diners', 'jcb', 'bank_transfer', 'online_banking'],
        description: 'Icelandic payment gateway providing secure online payment solutions for e-commerce',
        logoUrl: 'https://www.netgiro.is/wp-content/uploads/2021/03/netgiro-logo.png',
        website: 'https://www.netgiro.is',
        documentation: 'https://www.netgiro.is/fyrirtaeki/greidslulausnir/',
      },
    });

    console.log('✅ Created Netgíró payment gateway:', netgiroGateway.name);

    // Create Cash on Delivery payment gateway
    const cashOnDeliveryGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Cash on Delivery' },
      update: {},
      create: {
        name: 'Cash on Delivery',
        displayName: 'Cash on Delivery',
        provider: 'cash_on_delivery',
        isEnabled: true, // Enabled by default for local delivery
        isActive: true,
        sortOrder: 6,
        config: JSON.stringify({
          requiresDelivery: true,
          requiresVerification: true,
          maxAmount: 50000, // Maximum amount for cash on delivery (in ISK)
          supportedDeliveryMethods: ['DELIVERY'],
        }),
        merchantId: null, // Not applicable for cash payments
        apiKey: null, // Not applicable for cash payments
        secretKey: null, // Not applicable for cash payments
        webhookSecret: null, // Not applicable for cash payments
        environment: 'production', // Always production for cash payments
        supportedCurrencies: ['ISK'],
        supportedCountries: ['IS'],
        supportedMethods: ['cash', 'cash_on_delivery'],
        description: 'Pay with cash when your order is delivered to your door',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/157/157933.png',
        website: null,
        documentation: null,
      },
    });

    console.log('✅ Created Cash on Delivery payment gateway:', cashOnDeliveryGateway.name);

    // Create Pay on Pickup payment gateway
    const payOnPickupGateway = await prisma.paymentGateway.upsert({
      where: { name: 'Pay on Pickup' },
      update: {},
      create: {
        name: 'Pay on Pickup',
        displayName: 'Pay on Pickup',
        provider: 'pay_on_pickup',
        isEnabled: true, // Enabled by default for store pickup
        isActive: true,
        sortOrder: 7,
        config: JSON.stringify({
          requiresPickup: true,
          requiresVerification: true,
          maxAmount: 50000, // Maximum amount for pay on pickup (in ISK)
          supportedDeliveryMethods: ['PICKUP'],
        }),
        merchantId: null, // Not applicable for cash payments
        apiKey: null, // Not applicable for cash payments
        secretKey: null, // Not applicable for cash payments
        webhookSecret: null, // Not applicable for cash payments
        environment: 'production', // Always production for cash payments
        supportedCurrencies: ['ISK'],
        supportedCountries: ['IS'],
        supportedMethods: ['cash', 'pay_on_pickup'],
        description: 'Pay with cash when you pick up your order at the store',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/157/157933.png',
        website: null,
        documentation: null,
      },
    });

    console.log('✅ Created Pay on Pickup payment gateway:', payOnPickupGateway.name);

    console.log('🎉 Payment gateways seeding completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Valitor: Disabled (Icelandic payment gateway)');
    console.log('   - Rapyd: Disabled (Global payment platform)');
    console.log('   - Stripe: Inactive (Popular payment gateway)');
    console.log('   - PayPal: Inactive (PayPal payment gateway)');
    console.log('   - Netgíró: Disabled (Icelandic payment gateway)');
    console.log('   - Cash on Delivery: Enabled (Local delivery payment method)');
    console.log('   - Pay on Pickup: Enabled (Store pickup payment method)');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Configure API credentials in admin settings');
    console.log('   2. Enable desired payment gateways');
    console.log('   3. Test payment gateway connections');

  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedPaymentGateways()
    .then(() => {
      console.log('✅ Payment gateways seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Payment gateways seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPaymentGateways };
