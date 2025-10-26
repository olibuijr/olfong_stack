#!/usr/bin/env python3

import json
from pathlib import Path
import subprocess
import sys

BATCH_DIR = Path('/home/olibuijr/Projects/olfong_stack/backend/translation-batches')

# Comprehensive translation map - will be built from all unique keys
TRANSLATIONS_MAP = {}

def translate_key_with_gemini(key):
    """Use gemini to translate a single key"""
    try:
        prompt = f'''Translate this UI text key to professional Icelandic for "Ölföng", an e-commerce wine and beer website.
Key context: {key}

Guidelines:
- Use formal, professional Icelandic
- For UI labels: clear, concise descriptive text
- For buttons: active verbs
- For settings: descriptive labels
- For payment providers: keep original names (Teya, Valitor)
- For numbers: use comma as decimal separator (24,00 not 24.00)
- For categories: use Icelandic equivalents (WINE->Vín, BEER->Bjór, SPIRITS->Brennivín)
- For common UI terms:
  * Save = Vista
  * Delete = Eyða
  * Edit = Breyta
  * Add = Bæta við
  * View = Skoðaðu
  * Submit = Senda
  * Cancel = Hætta við
  * Settings = Stillingar
  * Profile = Prófíl

Return ONLY the Icelandic translation text, nothing else.'''

        result = subprocess.run(
            ['gemini', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode == 0:
            translation = result.stdout.strip().split('\n')[0].strip()
            if translation and len(translation) > 0:
                return translation
    except Exception as e:
        pass

    return None

def main():
    print("="*60)
    print("COMPREHENSIVE ICELANDIC TRANSLATION GENERATOR")
    print("="*60)

    # Step 1: Collect all unique keys
    print("\nStep 1: Collecting all unique keys from batches...")
    all_keys = []
    key_to_batches = {}

    for i in range(1, 31):
        batch_file = BATCH_DIR / f'batch-{str(i).zfill(3)}.json'
        if batch_file.exists():
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)
                keys = batch_data.get('keys', [])
                all_keys.extend(keys)
                for key in keys:
                    if key not in key_to_batches:
                        key_to_batches[key] = []
                    key_to_batches[key].append(i)

    print(f"Found {len(all_keys)} total keys")
    print(f"Found {len(key_to_batches)} unique keys")

    # Step 2: Load existing translations from batch files
    print("\nStep 2: Loading existing translations...")
    existing_translations = {}

    for i in range(1, 31):
        trans_file = BATCH_DIR / f'batch-{str(i).zfill(3)}-translated.json'
        if trans_file.exists():
            with open(trans_file, 'r', encoding='utf-8') as f:
                trans = json.load(f)
                for key, value in trans.items():
                    if key not in existing_translations or value != key:
                        existing_translations[key] = value

    print(f"Loaded {len(existing_translations)} existing translations")

    # Step 3: Identify keys that still need translation
    untranslated = {}
    for key in key_to_batches:
        if key not in existing_translations or existing_translations[key] == key:
            untranslated[key] = None

    print(f"Found {len(untranslated)} untranslated keys")
    print(f"Already translated: {len(existing_translations) - len(untranslated)}")

    # Step 4: Generate translations for untranslated keys
    print("\nStep 3: Generating translations (this may take a few minutes)...")
    translated_count = 0
    failed_count = 0

    sorted_untranslated = sorted(untranslated.keys())

    for idx, key in enumerate(sorted_untranslated, 1):
        translation = translate_key_with_gemini(key)

        if translation:
            untranslated[key] = translation
            existing_translations[key] = translation
            translated_count += 1
            if idx % 50 == 0:
                print(f"  Translated {idx}/{len(sorted_untranslated)} keys...")
        else:
            existing_translations[key] = key  # Fallback to key itself
            failed_count += 1

    print(f"Translation complete: {translated_count} translated, {failed_count} fallback to key")

    # Step 4: Write updated translations back to batch files
    print("\nStep 4: Updating batch translation files...")

    for i in range(1, 31):
        batch_file = BATCH_DIR / f'batch-{str(i).zfill(3)}.json'
        trans_file = BATCH_DIR / f'batch-{str(i).zfill(3)}-translated.json'

        if batch_file.exists():
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)

            keys = batch_data.get('keys', [])
            batch_translations = {}

            for key in keys:
                if key in existing_translations:
                    batch_translations[key] = existing_translations[key]
                else:
                    batch_translations[key] = key

            with open(trans_file, 'w', encoding='utf-8') as f:
                json.dump(batch_translations, f, ensure_ascii=False, indent=2)

    print(f"Updated all 30 batch translation files")

    # Step 5: Create summary
    print("\n" + "="*60)
    print("TRANSLATION SUMMARY")
    print("="*60)
    print(f"Total unique keys: {len(key_to_batches)}")
    print(f"Total keys (with duplicates): {len(all_keys)}")
    print(f"Keys with translations: {len(existing_translations)}")
    print(f"Keys newly translated: {translated_count}")
    print(f"Keys with fallback: {failed_count}")
    print("="*60)
    print("\nAll batch files have been updated with translations!")
    print(f"Output location: {BATCH_DIR}")

if __name__ == '__main__':
    main()
