const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const translations = [
  {
    key: 'subscription.selectPreferredTimeHelp',
    locale: 'en',
    value: 'Choose your preferred delivery time'
  },
  {
    key: 'subscription.selectPreferredTimeHelp',
    locale: 'is',
    value: 'Veldu þinn kjósna afhendingartíma'
  },
  {
    key: 'productDetailPage.createSubscription',
    locale: 'en',
    value: 'Create Subscription'
  },
  {
    key: 'productDetailPage.createSubscription',
    locale: 'is',
    value: 'Búa til áskrift'
  },
  {
    key: 'productDetailPage.quantity',
    locale: 'en',
    value: 'Quantity'
  },
  {
    key: 'productDetailPage.quantity',
    locale: 'is',
    value: 'Magn'
  },
  {
    key: 'productDetailPage.deliveryFrequency',
    locale: 'en',
    value: 'Delivery Frequency'
  },
  {
    key: 'productDetailPage.deliveryFrequency',
    locale: 'is',
    value: 'Afhendingartíðni'
  },
  {
    key: 'productDetailPage.preferredDayOptional',
    locale: 'en',
    value: 'Preferred Day (Optional)'
  },
  {
    key: 'productDetailPage.preferredDayOptional',
    locale: 'is',
    value: 'Kjósinn dagur (Valkvætt)'
  },
  {
    key: 'productDetailPage.preferredTimeOptional',
    locale: 'en',
    value: 'Preferred Time (Optional)'
  },
  {
    key: 'productDetailPage.preferredTimeOptional',
    locale: 'is',
    value: 'Kjósinn tími (Valkvætt)'
  },
  {
    key: 'productDetailPage.notesOptional',
    locale: 'en',
    value: 'Notes (Optional)'
  },
  {
    key: 'productDetailPage.notesOptional',
    locale: 'is',
    value: 'Athugasemdir (Valkvætt)'
  },
  {
    key: 'productDetailPage.subscriptionCreated',
    locale: 'en',
    value: 'Subscription created successfully'
  },
  {
    key: 'productDetailPage.subscriptionCreated',
    locale: 'is',
    value: 'Áskrift var búin til með góðum árangri'
  },
  {
    key: 'subscription.weekly',
    locale: 'en',
    value: 'Weekly'
  },
  {
    key: 'subscription.weekly',
    locale: 'is',
    value: 'Vikulega'
  },
  {
    key: 'subscription.biweekly',
    locale: 'en',
    value: 'Biweekly'
  },
  {
    key: 'subscription.biweekly',
    locale: 'is',
    value: 'Tveggja vikna fresti'
  },
  {
    key: 'subscription.monthly',
    locale: 'en',
    value: 'Monthly'
  },
  {
    key: 'subscription.monthly',
    locale: 'is',
    value: 'Mánaðarlega'
  },
  {
    key: 'subscription.noSpecificDay',
    locale: 'en',
    value: 'No specific day'
  },
  {
    key: 'subscription.noSpecificDay',
    locale: 'is',
    value: 'Enginn ákveðinn dagur'
  },
  {
    key: 'subscription.monday',
    locale: 'en',
    value: 'Monday'
  },
  {
    key: 'subscription.monday',
    locale: 'is',
    value: 'Mánudagur'
  },
  {
    key: 'subscription.tuesday',
    locale: 'en',
    value: 'Tuesday'
  },
  {
    key: 'subscription.tuesday',
    locale: 'is',
    value: 'Þriðjudagur'
  },
  {
    key: 'subscription.wednesday',
    locale: 'en',
    value: 'Wednesday'
  },
  {
    key: 'subscription.wednesday',
    locale: 'is',
    value: 'Miðvikudagur'
  },
  {
    key: 'subscription.thursday',
    locale: 'en',
    value: 'Thursday'
  },
  {
    key: 'subscription.thursday',
    locale: 'is',
    value: 'Fimmtudagur'
  },
  {
    key: 'subscription.friday',
    locale: 'en',
    value: 'Friday'
  },
  {
    key: 'subscription.friday',
    locale: 'is',
    value: 'Föstudagur'
  },
  {
    key: 'subscription.saturday',
    locale: 'en',
    value: 'Saturday'
  },
  {
    key: 'subscription.saturday',
    locale: 'is',
    value: 'Laugardagur'
  },
  {
    key: 'subscription.sunday',
    locale: 'en',
    value: 'Sunday'
  },
  {
    key: 'subscription.sunday',
    locale: 'is',
    value: 'Sunnudagur'
  },
  {
    key: 'subscription.cancel',
    locale: 'en',
    value: 'Cancel'
  },
  {
    key: 'subscription.cancel',
    locale: 'is',
    value: 'Hætta við'
  },
  {
    key: 'subscription.createSubscription',
    locale: 'en',
    value: 'Create Subscription'
  },
  {
    key: 'subscription.createSubscription',
    locale: 'is',
    value: 'Búa til áskrift'
  },
  {
    key: 'subscription.specialNotesPlaceholder',
    locale: 'en',
    value: 'Enter any special notes or requests'
  },
  {
    key: 'subscription.specialNotesPlaceholder',
    locale: 'is',
    value: 'Sláðu inn sérstaka athugasemdir eða beiðni'
  },
  {
    key: 'subscription.mustBeLoggedIn',
    locale: 'en',
    value: 'You must be logged in to create a subscription'
  },
  {
    key: 'subscription.mustBeLoggedIn',
    locale: 'is',
    value: 'Þú verður að vera skráð(ur) inn til að búa til áskrift'
  },
  {
    key: 'subscription.noPaymentProviderSupport',
    locale: 'en',
    value: 'No payment provider currently supports subscriptions'
  },
  {
    key: 'subscription.noPaymentProviderSupport',
    locale: 'is',
    value: 'Enginn greiðsluþjónusti styður nú þegar áskriftir'
  },
  {
    key: 'subscription.creationFailed',
    locale: 'en',
    value: 'Failed to create subscription'
  },
  {
    key: 'subscription.creationFailed',
    locale: 'is',
    value: 'Mistókst að búa til áskrift'
  }
];

async function addTranslations() {
  try {
    console.log('Adding subscription translations...\n');

    for (const translation of translations) {
      const existing = await prisma.lang.findFirst({
        where: {
          key: translation.key,
          locale: translation.locale
        }
      });

      if (existing) {
        console.log(`✓ Translation already exists: ${translation.key} (${translation.locale})`);
        continue;
      }

      const created = await prisma.lang.create({
        data: translation
      });

      console.log(`✓ Created: ${created.key} (${created.locale})`);
    }

    console.log('\n✓ All translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
