#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BATCH_DIR = '/home/olibuijr/Projects/olfong_stack/backend/translation-batches';

// Comprehensive Icelandic translation dictionary
const translations = {
  // CSS selectors and generic
  '.link-dropdown-container': 'Tengill-fellivalmöguleikar',
  '.relative': 'Afstætt',

  // Numbers and formats
  '24.00': '24,00',
  '25.00': '25,00',
  '27.50': '27,50',

  // Addresses section
  'addresses.add': 'Bæta við heimilisfangi',
  'addresses.city': 'Borg',
  'addresses.country': 'Land',
  'addresses.delete': 'Eyða heimilisfangi',
  'addresses.edit': 'Breyta heimilisfangi',
  'addresses.postalCode': 'Póstnúmer',
  'addresses.street': 'Gata',

  // Admin access
  'admin.accessDenied': 'Aðgangur ekki leyfður',
  'admin.accessDeniedMessage': 'Þú hefur ekki réttindi til að fá aðgang að þessum gögnum.',

  // Admin banners
  'admin.banners.activate': 'Virkja borða',
  'admin.banners.addBanner': 'Bæta við borða',
  'admin.banners.addFirstBanner': 'Bæta við fyrsta borða',
  'admin.banners.addToFeatured': 'Bæta við vörunum sem birtar eru',
  'admin.banners.altPlaceholder': 'Skrifaðu lýsingu fyrir aðgengileika',
  'admin.banners.altText': 'Annar texti myndar',
  'admin.banners.category': 'Flokkur',
  'admin.banners.confirmDelete': 'Staðfestu eyðingu',
  'admin.banners.deactivate': 'Gera óvirka',
  'admin.banners.descriptionEn': 'Lýsing (Enska)',
  'admin.banners.descriptionIs': 'Lýsing (Íslenska)',
  'admin.banners.descriptionPlaceholder': 'Sláðu inn lýsingu á ensku',
  'admin.banners.descriptionPlaceholderIs': 'Sláðu inn lýsingu á íslensku',
  'admin.banners.editBanner': 'Breyta borða',
  'admin.banners.featured': 'Vöruð',
  'admin.banners.featuredBanner': 'Vöruð borði',
  'admin.banners.featuredBannerHelp': 'Þessi borði birtist á forsíðu',
  'admin.banners.featuredOrder': 'Röð vöruðra borða',
  'admin.banners.imageHelpText': 'Hlaððu upp myndarskrá eða settu inn vefslóð',
  'admin.banners.imageUrl': 'Vefslóð myndar',
  'admin.banners.link': 'Tengill',
  'admin.banners.manageImages': 'Stjórna myndum',
  'admin.banners.noBanners': 'Engir borðar',
  'admin.banners.noBannersDescription': 'Byrjaðu á því að bæta við fyrri borða',
  'admin.banners.noDescription': 'Engin lýsing',
  'admin.banners.position': 'Staðsetning',
  'admin.banners.product': 'Vara',
  'admin.banners.removeFromFeatured': 'Fjarlægja úr vöruðum vörum',
  'admin.banners.selectLink': 'Veldu tengil',
  'admin.banners.selectPosition': 'Veldu staðsetningu',
  'admin.banners.sortOrder': 'Röðunarröð',
  'admin.banners.subcategory': 'Undirflokkur',
  'admin.banners.subtitle': 'Undirrubrik',
  'admin.banners.title': 'Titill',
  'admin.banners.titleEn': 'Titill (Enska)',
  'admin.banners.titleIs': 'Titill (Íslenska)',
  'admin.banners.titlePlaceholder': 'Sláðu inn titil á ensku',
  'admin.banners.titlePlaceholderIs': 'Sláðu inn titil á íslensku',
};

// Function to translate a key using gemini
function translateKey(key) {
  // Check if we already have the translation
  if (translations[key]) {
    return translations[key];
  }

  // For keys we don't have, generate using gemini
  try {
    const prompt = `Translate the following UI text key to professional Icelandic for an e-commerce wine and beer website called "Ölföng". Keep it concise and natural. Return ONLY the Icelandic translation, nothing else.

Key: ${key}

Guidelines:
- Use formal, professional Icelandic
- If it's a button label, use active verbs
- For field labels, use clear descriptive text
- For category names (WINE, BEER, SPIRITS), use Icelandic equivalents
- Keep payment provider names (Teya, Valitor) as-is
- Numbers use comma as decimal separator in Icelandic (24,00 not 24.00)
- Preserve camelCase structure in key name, just translate the meaning`;

    const output = execSync(`gemini -p "${prompt}"`, {
      encoding: 'utf-8',
      timeout: 30000
    }).trim();

    const translation = output.split('\n')[0].trim();
    if (translation && translation.length > 0) {
      translations[key] = translation;
      return translation;
    }
  } catch (error) {
    console.warn(`Warning: Could not translate "${key}": ${error.message}`);
  }

  // Fallback: return the key itself if translation fails
  return key;
}

// Function to process a single batch file
function processBatch(batchNum) {
  const paddedNum = String(batchNum).padStart(3, '0');
  const inputFile = path.join(BATCH_DIR, `batch-${paddedNum}.json`);
  const outputFile = path.join(BATCH_DIR, `batch-${paddedNum}-translated.json`);

  try {
    console.log(`Processing batch ${paddedNum}...`);

    // Read the batch file
    const content = fs.readFileSync(inputFile, 'utf-8');
    const batch = JSON.parse(content);

    const translations_obj = {};
    const keys = batch.keys || [];

    // Translate each key
    for (const key of keys) {
      const translation = translateKey(key);
      translations_obj[key] = translation;
    }

    // Write the output file
    fs.writeFileSync(
      outputFile,
      JSON.stringify(translations_obj, null, 2) + '\n'
    );

    console.log(`  Completed: ${keys.length} translations saved to batch-${paddedNum}-translated.json`);
    return { success: true, count: keys.length };
  } catch (error) {
    console.error(`Error processing batch ${paddedNum}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('Starting batch translation process...\n');

  let totalTranslated = 0;
  let completedBatches = 0;

  // Process all 30 batches sequentially
  for (let i = 1; i <= 30; i++) {
    const result = processBatch(i);
    if (result.success) {
      totalTranslated += result.count;
      completedBatches++;
    }
    // Add a small delay between batches to avoid overwhelming the system
    if (i < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\nTranslation complete!`);
  console.log(`Batches processed: ${completedBatches}/30`);
  console.log(`Total keys translated: ${totalTranslated}`);
}

main().catch(console.error);
