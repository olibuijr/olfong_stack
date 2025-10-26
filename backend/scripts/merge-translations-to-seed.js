const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

async function main() {
  console.log('🔄 Merging translations to seed file...\n');

  // Load database translations (Icelandic)
  const dbTransFile = path.join(__dirname, '../translated-data/translations-for-database.json');
  const dbTranslations = JSON.parse(fs.readFileSync(dbTransFile, 'utf8'));

  console.log(`📊 Loaded ${dbTranslations.length} Icelandic translations`);

  // Load current seed file
  const seedFile = path.join(__dirname, '../prisma/database-export.json');
  const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

  // Get all unique keys from both English and Icelandic
  const allKeys = new Set();
  dbTranslations.forEach(t => allKeys.add(t.key));

  console.log(`📋 Total unique keys to process: ${allKeys.size}`);

  // Create a map of keys to translations
  const translationMap = {};
  dbTranslations.forEach(t => {
    if (!translationMap[t.key]) {
      translationMap[t.key] = {};
    }
    translationMap[t.key].is = t.value;
  });

  // For English, we need to extract from the keys themselves as a fallback
  // First, check if we have existing English translations in seed
  const existingEnglish = {};
  if (seedData.langs && Array.isArray(seedData.langs)) {
    seedData.langs.forEach(lang => {
      if (lang.locale === 'en') {
        existingEnglish[lang.key] = lang.value;
      }
    });
  }

  console.log(`📝 Found ${Object.keys(existingEnglish).length} existing English translations`);

  // Build new language array with both English and Icelandic
  const newLangs = [];

  // Add English translations (existing ones)
  Object.entries(existingEnglish).forEach(([key, value]) => {
    newLangs.push({
      id: generateUUID(),
      key,
      locale: 'en',
      value
    });
  });

  // Add Icelandic translations
  Object.entries(translationMap).forEach(([key, translations]) => {
    newLangs.push({
      id: generateUUID(),
      key,
      locale: 'is',
      value: translations.is
    });
  });

  console.log(`\n✅ Total translations to insert:`);
  console.log(`   English: ${newLangs.filter(l => l.locale === 'en').length}`);
  console.log(`   Icelandic: ${newLangs.filter(l => l.locale === 'is').length}`);

  // Update seed data with new translations
  seedData.langs = newLangs;

  // Save updated seed file
  fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

  console.log(`\n💾 Updated seed file: ${seedFile}`);
  console.log(`\n📊 Seed file now contains:`);
  console.log(`   Users: ${seedData.users ? seedData.users.length : 0}`);
  console.log(`   Translations: ${seedData.langs ? seedData.langs.length : 0}`);
  console.log(`   Payment Gateways: ${seedData.paymentGateways ? seedData.paymentGateways.length : 0}`);

  console.log(`\n🎉 Ready to reseed database!`);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

main().catch(console.error);
