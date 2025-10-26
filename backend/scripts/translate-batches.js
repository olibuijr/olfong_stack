const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const batchDir = path.join(__dirname, '../translation-batches');
  const manifestFile = path.join(batchDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));

  console.log(`\n🌐 Starting Icelandic translation for ${manifest.totalBatches} batches...`);
  console.log(`📊 Total keys to translate: ${manifest.totalKeys}\n`);

  const translations = [];
  let completedBatches = 0;

  // Process each batch
  for (const batchInfo of manifest.batches) {
    const batchFile = path.join(batchDir, batchInfo.file);
    const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

    console.log(`\n⏳ Processing Batch ${batchInfo.batchNum}/${manifest.totalBatches}...`);
    console.log(`   Keys: ${batch.keyCount}`);

    try {
      // Create translation request for this batch
      const prompt = createPromptForBatch(batch.keys);

      // Call gemini with the prompt
      const result = execSync(`gemini -p "${prompt.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large responses
      });

      // Parse the JSON result
      let translationData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          translationData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error(`   ❌ Failed to parse translation response for batch ${batchInfo.batchNum}`);
        console.error(`   Raw response: ${result.substring(0, 500)}`);
        process.exit(1);
      }

      // Convert to database format
      Object.entries(translationData).forEach(([englishKey, icelandicValue]) => {
        const key = englishKey; // The key is the English text in this context, but we need the actual key
        // Find the actual key from batch
        batch.keys.forEach(batchKey => {
          translations.push({
            id: generateUUID(),
            key: batchKey,
            locale: 'is',
            value: translationData[batchKey] || icelandicValue
          });
        });
      });

      completedBatches++;
      console.log(`   ✅ Batch ${batchInfo.batchNum} completed`);

    } catch (error) {
      console.error(`   ❌ Error processing batch ${batchInfo.batchNum}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ Completed ${completedBatches}/${manifest.totalBatches} batches`);
  console.log(`📝 Total translations generated: ${translations.length}`);

  // Save translations to file
  const translationsFile = path.join(batchDir, 'all-translations.json');
  fs.writeFileSync(translationsFile, JSON.stringify(translations, null, 2));

  console.log(`💾 Translations saved to: ${translationsFile}`);
}

function createPromptForBatch(keys) {
  const keyList = keys.map((k, i) => `${i + 1}. ${k}`).join('\n');

  return `Create professional Icelandic translations for the following UI text keys. Each key is a translation identifier used in a web application.

Keys to translate:
${keyList}

Return ONLY a valid JSON object where the key is the translation key and the value is the professional Icelandic translation. Do not include any additional text or explanation.

Example format:
{
  "home.title": "Heimasíða",
  "home.welcome": "Velkomin"
}`;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

main().catch(console.error);
