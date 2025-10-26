const fs = require('fs');
const path = require('path');

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const seedFile = path.join(__dirname, '../prisma/database-export.json');
const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

const translations = [
  {
    key: 'adminSettings.paymentGatewayEnabled',
    en: 'Payment gateway enabled',
    is: 'Greiðslugatið virkjað'
  },
  {
    key: 'adminSettings.paymentGatewayDisabled',
    en: 'Payment gateway disabled',
    is: 'Greiðslugatið óvirkjað'
  },
  {
    key: 'adminSettings.errorLoadingPaymentGateways',
    en: 'Error loading payment gateways',
    is: 'Villa við að hlaða greiðslugötum'
  },
  {
    key: 'adminSettings.errorTogglingPaymentGateway',
    en: 'Error toggling payment gateway',
    is: 'Villa við að breyta stöðu greiðslugats'
  },
  {
    key: 'adminSettings.paymentGatewayTestFailed',
    en: 'Payment gateway test failed: {{message}}',
    is: 'Prófun greiðslugats mistókst: {{message}}'
  },
  {
    key: 'adminSettings.errorTestingPaymentGateway',
    en: 'Error testing payment gateway',
    is: 'Villa við prófun greiðslugats'
  },
  {
    key: 'adminSettings.errorSavingPaymentGateway',
    en: 'Error saving payment gateway',
    is: 'Villa við að vista greiðslugat'
  },
  {
    key: 'adminSettings.pleaseSelectProvider',
    en: 'Please select a provider',
    is: 'Vinsamlegast veldu veitanda'
  },
  {
    key: 'adminSettings.connectionTestSuccessful',
    en: 'Connection test successful',
    is: 'Tengingarprófun tókst'
  },
  {
    key: 'adminSettings.connectionTestFailed',
    en: 'Connection test failed',
    is: 'Tengingarprófun mistókst'
  },
  {
    key: 'adminSettings.errorUpdatingPaymentGateway',
    en: 'Error updating payment gateway',
    is: 'Villa við uppfærslu greiðslugats'
  }
];

let addedCount = 0;

for (const translation of translations) {
  // Check if both translations exist
  const hasEnglish = seedData.langs.some(l => l.key === translation.key && l.locale === 'en');
  const hasIcelandic = seedData.langs.some(l => l.key === translation.key && l.locale === 'is');

  if (!hasEnglish) {
    seedData.langs.push({
      id: generateUUID(),
      key: translation.key,
      locale: 'en',
      value: translation.en
    });
    console.log(`✓ Added English: ${translation.key} → "${translation.en}"`);
    addedCount++;
  }

  if (!hasIcelandic) {
    seedData.langs.push({
      id: generateUUID(),
      key: translation.key,
      locale: 'is',
      value: translation.is
    });
    console.log(`✓ Added Icelandic: ${translation.key} → "${translation.is}"`);
    addedCount++;
  }
}

// Save updated seed file
fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

console.log(`\n✅ Seed file updated with payment gateway toast translations`);
console.log(`📊 Added ${addedCount} translation entries`);
console.log(`📊 Total translations: ${seedData.langs.length}`);
