const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const batchDir = 'translation-batches-en';

async function translateBatch(batchNum) {
  const inputFile = path.join(batchDir, `batch-${String(batchNum).padStart(3, '0')}-is.json`);
  const outputFile = path.join(batchDir, `batch-${String(batchNum).padStart(3, '0')}-en.json`);

  if (!fs.existsSync(inputFile)) {
    console.log(`❌ File not found: ${inputFile}`);
    return false;
  }

  if (fs.existsSync(outputFile)) {
    console.log(`⏭️  Already translated: batch-${String(batchNum).padStart(3, '0')}`);
    return true;
  }

  try {
    const batch = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Create prompt
    const entries = batch.map(t => `"${t.key}": "${t.value}"`).join('\n');
    const prompt = `You are a professional English translator. Translate these Icelandic UI text entries to English. Return ONLY valid JSON with each key mapped to its English translation. No markdown, no explanations, just pure JSON.

${entries}`;

    console.log(`\n📝 Translating batch ${batchNum} (${batch.length} entries)...`);

    // Use file-based approach for safety
    const promptFile = path.join(batchDir, `batch-${String(batchNum).padStart(3, '0')}-prompt.txt`);
    fs.writeFileSync(promptFile, prompt);

    // Call gemini with file
    const result = execSync(`gemini -p "$(cat ${promptFile})"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      shell: '/bin/bash'
    });

    // Save the output
    fs.writeFileSync(outputFile, result);
    console.log(`✅ Batch ${batchNum} translated and saved`);

    // Clean up prompt file
    fs.unlinkSync(promptFile);

    return true;
  } catch (error) {
    console.error(`❌ Error translating batch ${batchNum}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🌐 Starting Icelandic to English translation...\n');

  let completed = 0;
  for (let i = 1; i <= 15; i++) {
    const success = await translateBatch(i);
    if (success) completed++;

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Translation complete! ${completed}/15 batches processed`);
}

main().catch(console.error);
