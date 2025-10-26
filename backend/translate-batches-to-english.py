#!/usr/bin/env python3
import json
import os

# Icelandic to English translations mapping
translations = {
    # Batch 1 translations
    "Virkt": "Active",
    "Sala": "Sales",
    "Bæta við heimilisfangi": "Add address",
    "Borg": "City",
    "Land": "Country",
    "Eyða heimilisfangi": "Delete address",
    "Breyta heimilisfangi": "Edit address",
    "Póstnúmer": "Postal code",
    "Gata": "Street",
    "Aðgangur óheimill": "Access denied",
    "Þú hefur ekki heimild til að skoða þessa síðu.": "You do not have permission to view this page.",
    "Virkja": "Activate",
    "Bæta við borða": "Add banner",
    "Bættu við fyrsta borðanum": "Add your first banner",
    "Bæta við á forsíðu": "Add to featured",
    "Myndtexti": "Image text",
    "Vöruflokkur": "Category",
    "Staðfesta eyðingu": "Confirm deletion",
    "Afvirkja": "Deactivate",
    "Lýsing (enska)": "Description (English)",
    "Lýsing (íslenska)": "Description (Icelandic)",
    "Lýsing": "Description",
    "Breyta borða": "Edit banner",
    "Á forsíðu": "Featured",
    "Forsíðuborði": "Featured banner",
    "Forsíðuborðar birtast á aðalsíðu verslunarinnar.": "Featured banners appear on the main store page.",
    "Röðun á forsíðu": "Featured order",
    "Hlaða upp mynd fyrir borðann.": "Upload an image for the banner.",
    "Slóð myndar": "Image URL",
    "Tengill": "Link",
    "Sýsla með myndir": "Manage images",
    "Engir borðar": "No banners",
    "Engir borðar hafa verið búnir til.": "No banners have been created.",
    "Engin lýsing": "No description",
    "Staðsetning": "Position",
    "Vara": "Product",
    "Fjarlægja af forsíðu": "Remove from featured",
    "Velja tengil": "Select link",
    "Velja staðsetningu": "Select position",
    "Röðun": "Sort order",
    "Undirflokkur": "Subcategory",
    "Undirtitill": "Subtitle",
    "Titill": "Title",
    "Titill (enska)": "Title (English)",
    "Titill (íslenska)": "Title (Icelandic)",
    "Án titils": "Untitled",
   "Greiningar mælaborð": "Analytics dashboard",
    "Viðskiptainnsýn": "Business insights",
    "Hætt við": "Cancelled",
    "Flokkur": "Category",
    "Afhent": "Delivered",
    "Flytja út": "Export",
    "Vöxtur": "Growth",
    "Síðustu 30 dagar": "Last 30 days",
    "Síðustu 7 dagar": "Last 7 days",
    "Síðustu 90 dagar": "Last 90 days",
    "Síðasta ár": "Last year",
    "Hleður...": "Loading...",
    "Nettótekjur": "Net revenue",
    "Engin gögn": "No data",
    "Engar vörur": "No products",
    "Engin teknagögn": "No revenue data",
    "af tekjum": "of revenue",
    "af VSK": "of VAT",
    "Dreifing pöntunarstöðu": "Order status distribution",
    "Pantanir": "Orders",
    "Í bið": "Pending",
    "Í vinnslu": "Processing",
    "Tekjur": "Revenue",
    "Tekjur án VSK": "Revenue before VAT",
    "Tekjuþróun": "Revenue trend",
    "Sent": "Shipped",
    "Mest selda": "Top performer",
    "Mest seldu vörur": "Top performing products",
    "Samtals viðskiptavinir": "Total customers",
    "Samtals pantanir": "Total orders",
    "Samtals vörur": "Total products",
    "Samtals tekjur": "Total revenue",
    "Samtals VSK": "Total VAT",
    "Óþekktur flokkur": "Unknown category",
    "Óþekkt vara": "Unknown product",
    "samanborið við fyrra tímabil": "vs. previous period",
    "Grunnupplýsingar": "Basic information",
    "Ekki er hægt að eyða flokki sem inniheldur vörur": "Cannot delete category containing products",
    "Nota mynd úr vöru": "Use image from product",
    "Breyta mynd": "Change image",
    "Stofna fyrsta flokkinn": "Create your first category",
    "Afsláttur gildir til": "Discount valid until",
    "Hér getur þú stillt afslátt fyrir þennan vöruflokk.": "Here you can set a discount for this category.",
    "Afsláttarprósenta": "Discount percentage"
}

def translate_value(icelandic_text):
    """Translate Icelandic text to English"""
    # Direct mapping
    if icelandic_text in translations:
        return translations[icelandic_text]
    
    # If not found in mapping, return the original (this shouldn't happen if mapping is complete)
    return icelandic_text

def process_batch(batch_number):
    """Process a single batch file"""
    input_file = f'/home/olibuijr/Projects/olfong_stack/backend/translation-batches-en/batch-{batch_number:03d}-is.json'
    output_file = f'/home/olibuijr/Projects/olfong_stack/backend/translation-batches-en/batch-{batch_number:03d}-en.json'
    
    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert array to object with translations
    result = {}
    for item in data:
        key = item['key']
        value = item['value']
        result[key] = translate_value(value)
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Processed batch {batch_number}: {len(result)} translations")
    return len(result)

# Process first batch only as a test
total = process_batch(1)
print(f"Total translations: {total}")
