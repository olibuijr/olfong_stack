const fs = require('fs');
const path = require('path');

async function main() {
  // Load extracted keys
  const extractedFile = path.join(__dirname, '../extracted-keys.json');
  const extracted = JSON.parse(fs.readFileSync(extractedFile, 'utf8'));

  console.log(`📊 Processing ${extracted.keys.length} keys...`);

  // Filter out invalid keys (very short, numeric, special chars only, etc.)
  const validKeys = extracted.keys.filter(item => {
    const key = item.key;
    // Keep if: contains at least one dot AND is alphanumeric with dots/dashes/underscores AND not all numeric
    return (
      key.includes('.') &&
      /^[a-zA-Z0-9._-]+$/.test(key) &&
      !/^\d+$/.test(key) &&
      key.length > 2
    );
  });

  console.log(`✅ Valid keys: ${validKeys.length} (removed ${extracted.keys.length - validKeys.length} invalid)`);

  // Sort keys alphabetically
  validKeys.sort((a, b) => a.key.localeCompare(b.key));

  // Create batches of 50
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < validKeys.length; i += batchSize) {
    const batchKeys = validKeys.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    batches.push({
      batchNum,
      keys: batchKeys.map(item => item.key)
    });
  }

  console.log(`📦 Created ${batches.length} batches of up to ${batchSize} keys each`);

  // Save batches
  const batchDir = path.join(__dirname, '../translation-batches');
  if (!fs.existsSync(batchDir)) {
    fs.mkdirSync(batchDir, { recursive: true });
  }

  // Create a manifest file
  const manifest = {
    timestamp: new Date().toISOString(),
    totalBatches: batches.length,
    totalKeys: validKeys.length,
    batchSize,
    batches: batches.map(b => ({
      batchNum: b.batchNum,
      keyCount: b.keys.length,
      file: `batch-${String(b.batchNum).padStart(3, '0')}.json`
    }))
  };

  batches.forEach(batch => {
    const batchFile = path.join(batchDir, `batch-${String(batch.batchNum).padStart(3, '0')}.json`);
    fs.writeFileSync(batchFile, JSON.stringify({
      batchNum: batch.batchNum,
      keys: batch.keys,
      keyCount: batch.keys.length
    }, null, 2));
  });

  const manifestFile = path.join(batchDir, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

  console.log(`✅ Batches saved to: ${batchDir}`);
  console.log(`📋 Manifest saved to: ${manifestFile}`);

  // Print summary
  console.log('\n📊 Batch Summary:');
  console.log(`  Total batches: ${manifest.totalBatches}`);
  console.log(`  Total keys: ${manifest.totalKeys}`);
  console.log(`  Batch size: ${batchSize}`);
  console.log(`  Last batch size: ${batches[batches.length - 1].keys.length}`);

  // List all batches
  console.log('\n📦 Batches created:');
  batches.slice(0, 10).forEach(batch => {
    console.log(`  Batch ${batch.batchNum}: ${batch.keys.length} keys`);
  });
  if (batches.length > 10) {
    console.log(`  ... and ${batches.length - 10} more batches`);
  }

  console.log('\n✨ Ready for Icelandic translation!');
}

main().catch(console.error);
