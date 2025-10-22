const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingTranslations() {
  try {
    console.log('Reading used keys from file...');
    const usedKeysPath = path.join(__dirname, '../../web/src/used_keys.txt');
    const usedKeysContent = fs.readFileSync(usedKeysPath, 'utf-8');
    
    // Parse keys from file - each line is a key, but filter out empty lines and special chars
    const usedKeys = usedKeysContent
      .split('\n')
      .map(key => key.trim())
      .filter(key => key && key.length > 0 && key.match(/^[a-zA-Z0-9._-]+$/));
    
    console.log(`Found ${usedKeys.length} keys in used_keys.txt`);
    
    // Get all keys from database
    console.log('Fetching translations from database...');
    const dbTranslations = await prisma.translation.findMany({
      select: { key: true, language: true, section: true },
      distinct: ['key']
    });
    
    const dbKeys = new Set(dbTranslations.map(t => t.key));
    console.log(`Found ${dbKeys.size} unique keys in database`);
    
    // Find missing keys
    const missingKeys = usedKeys.filter(key => !dbKeys.has(key));
    console.log(`Found ${missingKeys.length} missing keys`);
    
    // Save missing keys to a log file
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const missingKeysPath = path.join(logsDir, 'missing-keys.json');
    fs.writeFileSync(missingKeysPath, JSON.stringify(missingKeys, null, 2));
    console.log(`Missing keys saved to ${missingKeysPath}`);
    
    // Group missing keys by section
    const missingBySection = {};
    missingKeys.forEach(key => {
      const section = key.split('.')[0];
      if (!missingBySection[section]) {
        missingBySection[section] = [];
      }
      missingBySection[section].push(key);
    });
    
    console.log('\nMissing keys by section:');
    Object.entries(missingBySection).forEach(([section, keys]) => {
      console.log(`\n${section}: ${keys.length} missing`);
      if (keys.length <= 10) {
        keys.forEach(key => console.log(`  - ${key}`));
      } else {
        keys.slice(0, 5).forEach(key => console.log(`  - ${key}`));
        console.log(`  ... and ${keys.length - 5} more`);
      }
    });
    
    // Save detailed report
    const reportPath = path.join(logsDir, 'missing-keys-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      totalUsedKeys: usedKeys.length,
      totalDatabaseKeys: dbKeys.size,
      totalMissingKeys: missingKeys.length,
      percentageCoverage: ((dbKeys.size / usedKeys.length) * 100).toFixed(2),
      missingBySection,
      allMissingKeys: missingKeys
    }, null, 2));
    console.log(`\nDetailed report saved to ${reportPath}`);
    
  } catch (error) {
    console.error('Error checking missing translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingTranslations();








