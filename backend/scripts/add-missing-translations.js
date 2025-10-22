const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to convert key to human readable English text
function keyToText(key) {
  // Remove section prefix (e.g., "adminChat.accessDenied" -> "accessDenied")
  const textKey = key.includes('.') ? key.split('.').pop() : key;
  
  // Convert camelCase to words
  let text = textKey
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
  
  // Capitalize first letter and first letter after periods
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text = text.replace(/\. ([a-z])/g, match => match.toUpperCase());
  
  return text;
}

async function addMissingTranslations() {
  try {
    console.log('Reading missing keys report...');
    const reportPath = path.join(__dirname, '../../logs/missing-keys-report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.error('Missing keys report not found. Please run check-missing-translations.js first.');
      process.exit(1);
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const missingKeys = report.allMissingKeys;
    
    console.log(`Found ${missingKeys.length} missing keys to add`);
    
    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    // Process each missing key
    for (const key of missingKeys) {
      try {
        // Skip invalid keys
        if (!key || !key.match(/^[a-zA-Z0-9._-]+$/)) {
          skippedCount++;
          continue;
        }
        
        // Extract section from key
        const section = key.split('.')[0];
        
        // Generate default English text
        const defaultText = keyToText(key);
        
        // Check if key already exists
        const existing = await prisma.translation.findFirst({
          where: { key }
        });
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        // Create English translation
        await prisma.translation.create({
          data: {
            key,
            section,
            language: 'en',
            value: defaultText,
            description: `Auto-generated from key: ${key}`
          }
        });
        
        // Create Icelandic translation with same text (to be updated later)
        await prisma.translation.create({
          data: {
            key,
            section,
            language: 'is',
            value: defaultText,
            description: `Auto-generated from key: ${key} - NEEDS ICELANDIC TRANSLATION`
          }
        });
        
        addedCount++;
        
        if (addedCount % 50 === 0) {
          console.log(`  Progress: ${addedCount} translations added...`);
        }
      } catch (error) {
        if (error.code !== 'P2002') { // Ignore unique constraint errors
          errors.push({ key, error: error.message });
        }
      }
    }
    
    console.log(`\n✅ Added ${addedCount} missing translations`);
    console.log(`⏭️  Skipped ${skippedCount} invalid or existing keys`);
    
    if (errors.length > 0) {
      console.log(`⚠️  Encountered ${errors.length} errors:`);
      errors.slice(0, 10).forEach(err => {
        console.log(`  - ${err.key}: ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more`);
      }
    }
    
    // Get updated statistics
    const totalTranslations = await prisma.translation.findMany({
      select: { key: true },
      distinct: ['key']
    });
    
    console.log(`\n📊 Updated statistics:`);
    console.log(`  Total unique keys in database: ${totalTranslations.length}`);
    console.log(`  Coverage: ${((totalTranslations.length / report.totalUsedKeys) * 100).toFixed(2)}%`);
    
    // Save summary report
    const summaryPath = path.join(__dirname, '../../logs/add-translations-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      addedCount,
      skippedCount,
      errorsCount: errors.length,
      totalUniqueKeysNow: totalTranslations.length,
      coverage: ((totalTranslations.length / report.totalUsedKeys) * 100).toFixed(2),
      errors: errors.slice(0, 50) // Save first 50 errors
    }, null, 2));
    
    console.log(`\n📄 Summary saved to ${summaryPath}`);
    
  } catch (error) {
    console.error('Error adding missing translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingTranslations();








