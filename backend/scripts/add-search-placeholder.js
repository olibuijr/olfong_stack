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

// Check if translations already exist
const hasEnglish = seedData.langs.some(l => l.key === 'search.placeholder' && l.locale === 'en');
const hasIcelandic = seedData.langs.some(l => l.key === 'search.placeholder' && l.locale === 'is');

if (hasEnglish && hasIcelandic) {
  console.log('✓ search.placeholder translations already exist');
  process.exit(0);
}

// Add English translation
if (!hasEnglish) {
  seedData.langs.push({
    id: generateUUID(),
    key: 'search.placeholder',
    locale: 'en',
    value: 'Search products...'
  });
  console.log('✓ Added English: search.placeholder → "Search products..."');
}

// Add Icelandic translation
if (!hasIcelandic) {
  seedData.langs.push({
    id: generateUUID(),
    key: 'search.placeholder',
    locale: 'is',
    value: 'Leita að vörum...'
  });
  console.log('✓ Added Icelandic: search.placeholder → "Leita að vörum..."');
}

// Save updated seed file
fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

console.log(`\n✅ Seed file updated with search.placeholder`);
console.log(`📊 Total translations: ${seedData.langs.length}`);
