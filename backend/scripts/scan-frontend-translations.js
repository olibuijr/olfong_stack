const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Patterns to match translation calls
const TRANSLATION_PATTERNS = [
  // t('key')
  /t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  // t('section', 'key')
  /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g,
  // tWithFallback('key')
  /tWithFallback\(\s*['"`]([^'"`]+)['"`]\s*[^)]*\)/g,
  // tWithFallback('section', 'key')
  /tWithFallback\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*[^)]*\)/g
];

async function scanDirectory(dirPath, fileExtensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];

  async function scan(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        await scan(fullPath);
      } else if (item.isFile() && fileExtensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  await scan(dirPath);
  return files;
}

function extractTranslationKeys(content) {
  const keys = new Set();

  for (const pattern of TRANSLATION_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[2]) {
        // t('section', 'key') pattern
        const section = match[1];
        const key = match[2];
        const fullKey = `${section}.${key}`;
        keys.add(fullKey);
      } else {
        // t('key') pattern
        const key = match[1];
        keys.add(key);
      }
    }
  }

  return Array.from(keys);
}

async function getExistingKeysFromDatabase() {
  try {
    const translations = await prisma.translation.findMany({
      select: { key: true },
      distinct: ['key']
    });

    return new Set(translations.map(t => t.key));
  } catch (error) {
    console.error('Error fetching existing keys from database:', error);
    return new Set();
  }
}

async function createMissingTranslations(missingKeys) {
  console.log(`📝 Creating ${missingKeys.length} missing translations...`);

  const translations = [];
  const batchSize = 100;

  for (const key of missingKeys) {
    const section = key.split('.')[0];
    const placeholderValue = key.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Create for both languages
    translations.push({
      key,
      section,
      language: 'en',
      value: placeholderValue,
      createdBy: 'system'
    });

    translations.push({
      key,
      section,
      language: 'is',
      value: placeholderValue, // Use English as placeholder for Icelandic too
      createdBy: 'system'
    });
  }

  let createdCount = 0;
  for (let i = 0; i < translations.length; i += batchSize) {
    const batch = translations.slice(i, i + batchSize);

    try {
      const result = await prisma.translation.createMany({
        data: batch,
        skipDuplicates: true
      });

      createdCount += result.count;
      console.log(`   📦 Created batch ${Math.ceil((i + 1) / batchSize)}: ${result.count} translations`);
    } catch (error) {
      console.error(`   ❌ Error creating batch ${Math.ceil((i + 1) / batchSize)}:`, error.message);
    }
  }

  return createdCount;
}

async function scanFrontendTranslations() {
  try {
    console.log('🔍 Starting frontend translation scan...');

    // Path to frontend source
    const frontendPath = path.join(__dirname, '../../web/src');

    // Scan for files
    console.log('📂 Scanning frontend files...');
    const files = await scanDirectory(frontendPath);
    console.log(`📄 Found ${files.length} frontend files to scan`);

    // Extract translation keys from all files
    console.log('🔎 Extracting translation keys...');
    const allKeys = new Set();

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const keys = extractTranslationKeys(content);
        keys.forEach(key => allKeys.add(key));
      } catch (error) {
        console.warn(`⚠️  Could not read file ${file}:`, error.message);
      }
    }

    console.log(`🔑 Found ${allKeys.size} unique translation keys in frontend code`);

    // Get existing keys from database
    console.log('🗄️  Checking existing keys in database...');
    const existingKeys = await getExistingKeysFromDatabase();
    console.log(`📊 Found ${existingKeys.size} existing translation keys in database`);

    // Find missing keys
    const missingKeys = Array.from(allKeys).filter(key => !existingKeys.has(key));
    console.log(`⚠️  Found ${missingKeys.length} missing translation keys`);

    if (missingKeys.length === 0) {
      console.log('✅ All translation keys are already in the database!');
      return;
    }

    // Show some examples
    console.log('\n📝 Examples of missing keys:');
    const examples = missingKeys.slice(0, 10);
    examples.forEach(key => console.log(`   - ${key}`));

    if (missingKeys.length > 10) {
      console.log(`   ... and ${missingKeys.length - 10} more`);
    }

    // Create missing translations
    const createdCount = await createMissingTranslations(missingKeys);

    // Final statistics
    const [totalCount, enCount, isCount] = await Promise.all([
      prisma.translation.count(),
      prisma.translation.count({ where: { language: 'en' } }),
      prisma.translation.count({ where: { language: 'is' } })
    ]);

    console.log(`\n📈 Final statistics:`);
    console.log(`   Total translations: ${totalCount}`);
    console.log(`   English translations: ${enCount}`);
    console.log(`   Icelandic translations: ${isCount}`);
    console.log(`   Created translations: ${createdCount}`);

    console.log('\n✅ Frontend translation scan completed successfully!');
    console.log('💡 Note: Created translations use placeholder values. You should update them with proper translations.');

  } catch (error) {
    console.error('❌ Error during frontend translation scan:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
scanFrontendTranslations();