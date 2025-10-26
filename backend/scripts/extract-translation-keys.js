const fs = require('fs');
const path = require('path');

// Extract translation keys from a file content
function extractKeysFromFile(content, filename) {
  const keys = new Set();

  // Patterns to match translation usage
  const patterns = [
    /t\(['"`]([a-zA-Z0-9._-]+)['"`]\)/g,           // t('key')
    /t\s*\(\s*['"`]([a-zA-Z0-9._-]+)['"`]\s*\)/g,  // t ( 'key' )
    /{%\s*t\s*\(\s*['"`]([a-zA-Z0-9._-]+)['"`]\s*\)\s*%}/g, // {% t('key') %}
    /aria-label="([a-zA-Z0-9._-]+)"/g,             // aria-label="key"
    /placeholder="([a-zA-Z0-9._-]+)"/g,            // placeholder="key"
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  });

  return Array.from(keys);
}

// Recursively find all files in directory
function findAllFiles(dir, extensions = ['.jsx', '.js', '.tsx', '.ts']) {
  let files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files = files.concat(findAllFiles(fullPath, extensions));
        }
      } else if (extensions.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

// Main extraction logic
async function main() {
  const webSrcDir = path.join(__dirname, '../../web/src');

  console.log('🔍 Extracting translation keys from frontend...');

  const files = findAllFiles(webSrcDir);
  console.log(`📁 Found ${files.length} frontend files`);

  const allKeys = new Map(); // key -> { count, files: [] }

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const keys = extractKeysFromFile(content, file);
      const relativePath = path.relative(webSrcDir, file);

      keys.forEach(key => {
        if (!allKeys.has(key)) {
          allKeys.set(key, { count: 0, files: [] });
        }
        const entry = allKeys.get(key);
        entry.count++;
        entry.files.push(relativePath);
      });
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  });

  // Sort by key name
  const sortedKeys = Array.from(allKeys.keys()).sort();

  console.log(`\n✅ Extracted ${sortedKeys.length} unique translation keys`);

  // Save to file
  const outputFile = path.join(__dirname, '../extracted-keys.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalKeys: sortedKeys.length,
    keys: sortedKeys.map(key => ({
      key,
      count: allKeys.get(key).count,
      files: allKeys.get(key).files
    }))
  }, null, 2));

  console.log(`📄 Keys saved to: ${outputFile}`);

  // Print summary
  console.log('\n📊 Top 20 most used translation keys:');
  const topKeys = sortedKeys
    .map(key => ({ key, count: allKeys.get(key).count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  topKeys.forEach(({ key, count }) => {
    console.log(`  ${key}: ${count} uses`);
  });

  console.log('\n📋 Key categories:');
  const categories = new Map();
  sortedKeys.forEach(key => {
    const category = key.split('.')[0];
    if (!categories.has(category)) {
      categories.set(category, 0);
    }
    categories.set(category, categories.get(category) + 1);
  });

  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} keys`);
    });
}

main().catch(console.error);
