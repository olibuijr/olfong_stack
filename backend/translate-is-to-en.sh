#!/bin/bash

# Translate Icelandic to English using Gemini

for batch_file in translation-batches-en/batch-*-is.json; do
    batch_num=$(basename "$batch_file" -is.json)
    output_file="translation-batches-en/${batch_num}-en.json"
    
    if [ -f "$output_file" ]; then
        echo "Skipping $batch_file (already translated)"
        continue
    fi
    
    echo "Translating $batch_file..."
    
    # Read the batch and create translation prompt
    prompt=$(node -e "
        const fs = require('fs');
        const batch = JSON.parse(fs.readFileSync('$batch_file', 'utf8'));
        const entries = batch.map(t => \`\${t.key}: \${t.value}\`).join('\\n');
        console.log('Translate these Icelandic text entries to English. Return ONLY a valid JSON object with the key as key and English translation as value. Do not include any explanation.\n\n' + entries);
    ")
    
    # Call Gemini and save result
    gemini -p "$prompt" > "$output_file" 2>&1
    
    echo "✓ Saved to $output_file"
    sleep 2  # Rate limiting
done

echo "All batches translated!"
