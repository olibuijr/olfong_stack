const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'checkoutPage.teyaPayment', en: 'Teya Payment Gateway', is: 'Teya Greiðslugátt' },
  { key: 'checkoutPage.teyaDesc', en: 'Pay securely with Teya payment gateway', is: 'Greiddu á öruggan hátt með greiðslugátt Teya' },
  { key: 'checkoutPage.valitorPayment', en: 'Valitor Payment Gateway', is: 'Valitor Greiðslugátt' },
  { key: 'checkoutPage.valitorDesc', en: 'Pay with Valitor online payment gateway', is: 'Greiddu með greiðslugátt Valitor' },
  { key: 'checkoutPage.cashOnDelivery', en: 'Cash on Delivery', is: 'Póstkrafa' },
  { key: 'checkoutPage.cashOnDeliveryDesc', en: 'Pay with cash when your order is delivered', is: 'Greiðið með reiðufé við afhendingu' },
  { key: 'checkoutPage.payOnPickup', en: 'Pay on Pickup', is: 'Greiðsla við sókn' },
  { key: 'checkoutPage.payOnPickupDesc', en: 'Pay with cash when you pick up your order', is: 'Greiðið með reiðufé þegar pöntunin er sótt' },
  { key: 'adminSettings.displayName', en: 'Display Name', is: 'Birtingarnafn' },
  { key: 'adminSettings.paymentMethod', en: 'Payment method', is: 'Greiðslumáti' },
];

async function addTranslations() {
  console.log('Adding payment gateway translations...\n');
  try {
    for (const { key, en, is } of translations) {
      // Add/update English translation
      await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'en' } },
        update: { value: en },
        create: { key, locale: 'en', value: en }
      });

      // Add/update Icelandic translation
      await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'is' } },
        update: { value: is },
        create: { key, locale: 'is', value: is }
      });

      console.log(`✓ Added/Updated: ${key}`);
    }
    console.log('\n✓ All payment gateway translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
