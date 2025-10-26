#!/usr/bin/env python3
"""
Comprehensive translation script for all 1498 UI keys to Icelandic.
This script translates keys in batches of 50 and saves results.
"""

import json
import subprocess
import sys
from pathlib import Path

BATCH_DIR = Path('/home/olibuijr/Projects/olfong_stack/backend/translation-batches')
OUTPUT_DIR = Path('/home/olibuijr/Projects/olfong_stack/backend/translated-data')

# Ensure output directory exists
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

def translate_batch_with_gemini(keys):
    """Translate a batch of keys using Gemini API"""
    prompt = f'''Translate these UI text keys to professional Icelandic for an e-commerce wine/beer website called "Ölföng".

Return ONLY a valid JSON object mapping each key to its Icelandic translation.
Use formal, professional language appropriate for UI labels.
Keep payment provider names unchanged (Teya, Valitor).
Use Icelandic equivalents for categories (WINE→Vín, BEER→Bjór, SPIRITS→Brennivín, etc).

Keys to translate:
{json.dumps(keys, ensure_ascii=False)}

Return ONLY the JSON object, no other text.'''

    try:
        result = subprocess.run(
            ['gemini', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            # Extract JSON from response
            output = result.stdout.strip()
            if '{' in output:
                start = output.find('{')
                end = output.rfind('}') + 1
                json_str = output[start:end]
                return json.loads(json_str)
    except Exception as e:
        print(f"Error translating batch: {e}")

    return {}

def main():
    print("=" * 70)
    print("COMPREHENSIVE ICELANDIC TRANSLATION FOR ÖLFÖNG")
    print("=" * 70)

    # Load all batches and collect all keys
    all_keys = []
    batch_indices = {}  # Track which batch each key comes from

    for i in range(1, 31):
        batch_file = BATCH_DIR / f'batch-{str(i).zfill(3)}.json'
        if batch_file.exists():
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)
                keys = batch_data.get('keys', [])
                all_keys.extend(keys)
                for key in keys:
                    batch_indices[key] = i

    print(f"\n📊 Total keys to translate: {len(all_keys)}")
    print(f"📦 Batches: {len(set(batch_indices.values()))}")

    # Translate in chunks of 50
    translations = {}
    chunk_size = 50
    total_chunks = (len(all_keys) + chunk_size - 1) // chunk_size

    for chunk_num in range(total_chunks):
        start_idx = chunk_num * chunk_size
        end_idx = min(start_idx + chunk_size, len(all_keys))
        chunk_keys = all_keys[start_idx:end_idx]

        print(f"\n⏳ Translating chunk {chunk_num + 1}/{total_chunks} ({len(chunk_keys)} keys)...", end='', flush=True)

        chunk_translations = translate_batch_with_gemini(chunk_keys)

        if chunk_translations:
            translations.update(chunk_translations)
            print(f" ✅ ({len(chunk_translations)} translated)")
        else:
            print(" ⚠️  Empty result")

    print(f"\n✅ Translation complete: {len(translations)}/{len(all_keys)} keys")

    # Save all translations to a single file
    output_file = OUTPUT_DIR / 'all-translations-is.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)

    print(f"💾 Saved to: {output_file}")

    # Create database format (key, locale, value)
    db_translations = []
    for key, value in translations.items():
        db_translations.append({
            'key': key,
            'locale': 'is',
            'value': value
        })

    # Sort by key for consistency
    db_translations.sort(key=lambda x: x['key'])

    db_file = OUTPUT_DIR / 'translations-for-database.json'
    with open(db_file, 'w', encoding='utf-8') as f:
        json.dump(db_translations, f, ensure_ascii=False, indent=2)

    print(f"💾 Database format saved to: {db_file}")
    print(f"   ({len(db_translations)} translations)")

    print("\n" + "=" * 70)
    print("TRANSLATION PROCESS COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    main()
