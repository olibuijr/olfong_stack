#!/usr/bin/env python3

import json
import os
import subprocess
from pathlib import Path
from collections import defaultdict

BATCH_DIR = Path('/home/olibuijr/Projects/olfong_stack/backend/translation-batches')

# Comprehensive Icelandic translation dictionary
TRANSLATIONS = {
    # CSS and Generic
    '.link-dropdown-container': 'Tengill-fellivalmöguleikar',
    '.relative': 'Afstætt',

    # Numbers and Formats
    '24.00': '24,00',
    '25.00': '25,00',
    '27.50': '27,50',

    # Addresses
    'addresses.add': 'Bæta við heimilisfangi',
    'addresses.city': 'Borg',
    'addresses.country': 'Land',
    'addresses.delete': 'Eyða heimilisfangi',
    'addresses.edit': 'Breyta heimilisfangi',
    'addresses.postalCode': 'Póstnúmer',
    'addresses.street': 'Gata',

    # Admin Access
    'admin.accessDenied': 'Aðgangur ekki leyfður',
    'admin.accessDeniedMessage': 'Þú hefur ekki réttindi til að fá aðgang að þessum gögnum.',

    # Admin Banners
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
    'admin.banners.untitled': 'Ótitlað',

    # Admin Analytics
    'adminAnalytics.analyticsDashboard': 'Greiningartöflur',
    'adminAnalytics.businessInsights': 'Innsýn í viðskipti',
    'adminAnalytics.cancelled': 'Afturkölluð',
    'adminAnalytics.category': 'Flokkur',
    'adminAnalytics.delivered': 'Afhent',
    'adminAnalytics.export': 'Flytja út',
    'adminAnalytics.growth': 'Vöxtur',
    'adminAnalytics.last30Days': 'Síðustu 30 dagar',
    'adminAnalytics.last7Days': 'Síðustu 7 dagar',
    'adminAnalytics.last90Days': 'Síðustu 90 dagar',
    'adminAnalytics.lastYear': 'Síðasta ár',
    'adminAnalytics.loading': 'Hleður...',
    'adminAnalytics.netRevenue': 'Hrein tekjur',
    'adminAnalytics.noData': 'Engin gögn',
    'adminAnalytics.noProducts': 'Engar vörur',
    'adminAnalytics.noRevenueData': 'Engin tekjugögn',
    'adminAnalytics.ofRevenue': 'af tekjum',
    'adminAnalytics.ofVat': 'af VSK',
    'adminAnalytics.orders': 'Pantanir',
    'adminAnalytics.orderStatusDistribution': 'Dreifing pöntunartölfræði',
    'adminAnalytics.pending': 'Bið',
    'adminAnalytics.processing': 'Vinnsla',
    'adminAnalytics.product': 'Vara',
    'adminAnalytics.revenue': 'Tekjur',
    'adminAnalytics.revenueBeforeVat': 'Tekjur fyrir VSK',
    'adminAnalytics.revenueTrend': 'Þróun tekna',
    'adminAnalytics.sales': 'Sala',
    'adminAnalytics.shipped': 'Sendað',
    'adminAnalytics.topPerformer': 'Besti framkvæmandi',
    'adminAnalytics.topPerformingProducts': 'Bestu framleiðandi vörur',
    'adminAnalytics.totalCustomers': 'Heildarvigur viðskiptavina',
    'adminAnalytics.totalOrders': 'Heildarfjöldi pantana',
    'adminAnalytics.totalProducts': 'Heildarvigur vara',
    'adminAnalytics.totalRevenue': 'Heildartek',
    'adminAnalytics.totalVat': 'Heildar VSK',
    'adminAnalytics.unknownCategory': 'Óþekkt flokkur',
    'adminAnalytics.unknownProduct': 'Óþekkt vara',
    'adminAnalytics.vsPreviousPeriod': 'samanborið við fyrri tímabil',

    # Admin Categories
    'adminCategories.active': 'Virk',
    'adminCategories.basicInfo': 'Grunnupplýsingar',
    'adminCategories.cannotDeleteWithProducts': 'Ekki er hægt að eyða flokki sem inniheldur vörur',
    'adminCategories.categoryImageFromProduct': 'Myndaveita flokks',
    'adminCategories.changeImage': 'Breyta mynd',
    'adminCategories.confirmDelete': 'Staðfestu eyðingu',
    'adminCategories.createFirstCategory': 'Búðu til fyrsta flokk',
    'adminCategories.descEn': 'Lýsing (Enska)',
    'adminCategories.descIs': 'Lýsing (Íslenska)',
    'adminCategories.description': 'Lýsing',
    'adminCategories.discountEndDate': 'Endir afsláttarlosunar',

    # Admin Reports
    'adminReports.endDate': 'Lokadagsetning',
    'adminReports.products': 'Vörur',
    'adminReports.productsReport': 'Vöruskýrsla',
    'adminReports.refreshData': 'Endurnýja gögn',
    'adminReports.reportType': 'Tegund skýrslu',
    'adminReports.revenue': 'Tekjur',
    'adminReports.revenueByCategory': 'Tekjur eftir flokki',
    'adminReports.salesReport': 'Söluskýrsla',
    'adminReports.startDate': 'Upphafsdagsetning',
    'adminReports.thisPeriod': 'Þetta tímabil',
    'adminReports.timePeriod': 'Tímabil',
    'adminReports.topCustomersByRevenue': 'Efstu viðskiptavinir eftir tekjum',
    'adminReports.topSellingProducts': 'Mest seldu vörur',
    'adminReports.totalCustomers': 'Heildarfjöldi viðskiptavina',
    'adminReports.totalOrders': 'Heildarfjöldi pantana',
    'adminReports.totalProducts': 'Heildarvigur vara',
    'adminReports.totalRevenue': 'Heildartek',
    'adminReports.vsPreviousPeriod': 'samanborið við fyrri tímabil',

    # Admin Settings
    'adminSettings.accentColor': 'Áherslulitur',
    'adminSettings.accessDenied': 'Aðgangur ekki leyfður',
    'adminSettings.accessKey': 'Aðgangslykilur',
    'adminSettings.addFirstIntegration': 'Bæta við fyrstu samþættingu',
    'adminSettings.addFirstPaymentGateway': 'Bæta við fyrstu greiðslumöttul',
    'adminSettings.addFirstShippingOption': 'Bæta við fyrsti sendingarvalkosti',
    'adminSettings.addIntegration': 'Bæta við samþættingu',
    'adminSettings.addPaymentGateway': 'Bæta við greiðslumöttul',
    'adminSettings.addProfile': 'Bæta við prófíl',
    'adminSettings.addressEnglish': 'Heimilisfang (Enska)',
    'adminSettings.addressIcelandic': 'Heimilisfang (Íslenska)',
    'adminSettings.addShippingOption': 'Bæta við sendingarvalkosti',
    'adminSettings.ageRestriction': 'Aldurstakmörkun',
    'adminSettings.ageRestrictionDescription': 'Aldurstakmörkun lýsing',
    'adminSettings.ageRestrictionNotice': 'Aldurstakmörkun tilkynning',
    'adminSettings.ageRestrictions': 'Aldurtakmörkun',
    'adminSettings.alcoholNicotineAgeDescription': 'Aldur fyrir alkóhól og nikotin',
    'adminSettings.alcoholNicotineProducts': 'Alkóhól- og nikótínvörur',
    'adminSettings.apiKey': 'API-lykill',
    'adminSettings.apiKeys': 'API-lyklar',
    'adminSettings.apiKeysConfiguration': 'Stillingar API-lykla',
    'adminSettings.apiKeysDescription': 'Lýsing API-lykla',
    'adminSettings.apiKeysImportantNote1': 'Mikilvæg athugasemd 1',
    'adminSettings.apiKeysImportantNote2': 'Mikilvæg athugasemd 2',
    'adminSettings.apiKeysImportantNote3': 'Mikilvæg athugasemd 3',
    'adminSettings.apiKeysImportantNote4': 'Mikilvæg athugasemd 4',
    'adminSettings.applicationId': 'Kenni forrit',
    'adminSettings.assignCategories': 'Úthluta flokkum',
    'adminSettings.avgHoursPerDay': 'Meðaltal klukkustunda á dag',
    'adminSettings.backupSettings': 'Öryggisafritun stillinga',
    'adminSettings.baseUrl': 'Grunnvefslóð',
    'adminSettings.business': 'Viðskipti',
    'adminSettings.businessDescription': 'Lýsing á viðskiptum',

    # Cart
    'cart.itemAdded': 'Vara bætt við körfu',
    'cart.items': 'Vörur',
    'cart.title': 'Karfa',
    'cartPage.addItemsToStart': 'Bættu vörum við til að byrja',
    'cartPage.cartDescription': 'Lýsing körfunnar',
    'cartPage.cartItems': 'Vörur í körfu',
    'cartPage.clearCart': 'Tæma körfu',
    'cartPage.continueShopping': 'Halda áfram að versla',
    'cartPage.each': 'hver',
    'cartPage.emptyCart': 'Tóm karfa',
    'cartPage.login': 'Innskrá',
    'cartPage.loginToViewCart': 'Skráðu þig inn til að skoða körfu',
    'cartPage.mustLoginToViewCart': 'Þú verður að skrá þig inn til að skoða körfuna þína',
    'cartPage.noImage': 'Engin mynd',

    # Categories
    'categories.BEER': 'Bjór',
    'categories.BEERS': 'Bjórar',
    'categories.CIDER_RTD': 'Síder RTD',
    'categories.NICOTINE': 'Nikotin',
    'categories.NON_ALCOHOLIC': 'Alkóhóllaust',
    'categories.OFFERS': 'Tilboð',
    'categories.SPIRITS': 'Brennivín',
    'categories.WINE': 'Vín',

    # Category
    'category.fallbackDescription': 'Engin lýsing',

    # Chat
    'chat.customTopic': 'Sérstök efni',
    'chat.customTopicPlaceholder': 'Skrifaðu þitt efni',
    'chat.initializing': 'Frumstilla spjall',
    'chat.noOrders': 'Engar pantanir',
    'chat.selectOrder': 'Veldu pöntun',
    'chat.selectTopic': 'Veldu efni',
    'chat.selectTopicDesc': 'Veldu efni til að hefja spjall',
    'chat.startChat': 'Hefja spjall',
    'chat.title': 'Spjall',
    'chat.topics.delivery': 'Sending',
    'chat.topics.deliveryDesc': 'Spurningar um sendingu',
    'chat.topics.feedback': 'Ábendingar',
    'chat.topics.feedbackDesc': 'Gefðu athugasemdir',
    'chat.topics.general': 'Almennt',
    'chat.topics.generalDesc': 'Almennar spurningar',
    'chat.topics.order': 'Pöntun',
    'chat.topics.orderDesc': 'Spurningar um pöntun',
    'chat.topics.payment': 'Greiðsla',
    'chat.topics.paymentDesc': 'Spurningar um greiðslu',
    'chat.topics.product': 'Vara',
    'chat.topics.productDesc': 'Spurningar um vöru',
    'chat.topics.topic': 'Efni',
    'chat.typeMessage': 'Skrifaðu skilaboð',

    # Checkout
    'checkout.shipping': 'Sending',
    'checkout.total': 'Samtals',
    'checkout.vat': 'VSK',
    'checkoutPage.cashOnDelivery': 'Reiðufé við afhendingu',

    # Receipts
    'receipts.viewReceipt': 'Skoðaðu kvittun',

    # Search
    'search.noResults': 'Engar niðurstöður',
    'search.placeholder': 'Leita að vörum...',
    'search.searching': 'Leita ...',
    'search.viewAllResults': 'Skoðaðu allar niðurstöður',

    # Email
    'smtp.gmail.com': 'smtp.gmail.com',

    # Subcategories
    'subcategories.CHAMPAGNE': 'Kampani',
    'subcategories.COGNAC': 'Kónjak',
    'subcategories.ENERGY_DRINKS': 'Orkudrykkir',
    'subcategories.GIN': 'Gin',
    'subcategories.LIQUEURS_SHOTS': 'Likjórar og shots',
    'subcategories.NICOTINE_PADS': 'Nikótín patched',
    'subcategories.RED_WINE': 'Rautt vín',
    'subcategories.ROSE_WINE': 'Rósamörk vín',
    'subcategories.RUM': 'Romm',
    'subcategories.SODA': 'Sódi',
    'subcategories.SOFT_DRINKS': 'Mjúk drykkir',
    'subcategories.SPARKLING_WINE': 'Glitrandandi vín',
    'subcategories.TEQUILA': 'Tequila',
    'subcategories.VAPE': 'Vape',
    'subcategories.VODKA': 'Vodka',
    'subcategories.WHISKEY': 'Whiskey',
    'subcategories.WHITE_WINE': 'Hvítt vín',
    'subcategories.YELLOW_WINE': 'Gult vín',

    # Subscription
    'subscription.biweekly': 'Annað hvert vikuna',
    'subscription.cancel': 'Hætta við',
    'subscription.createSubscription': 'Búðu til áskrift',
    'subscription.creationFailed': 'Stofnun áskriftar misheppnaðist',
    'subscription.friday': 'Föstudagur',
    'subscription.monday': 'Mánudagur',
    'subscription.monthly': 'Mánaðarlega',
    'subscription.mustBeLoggedIn': 'Þú verður að vera skráð/ur inn',
    'subscription.noPaymentProviderSupport': 'Greiðsluveitandi styður ekki áskrift',
    'subscription.noSpecificDay': 'Engin ákveðin dagur',
    'subscription.saturday': 'Laugardagur',
    'subscription.selectPreferredTimeHelp': 'Veldu ákjósanlega tíma',
    'subscription.specialNotesPlaceholder': 'Bættu við sérkátum athugasemdum',
    'subscription.sunday': 'Sunnudagur',
    'subscription.thursday': 'Fimmtudagur',
    'subscription.tuesday': 'Þriðjudagur',
    'subscription.wednesday': 'Miðvikudagur',
    'subscription.weekly': 'Vikulega',

    # Tooltips
    'tooltips.archive': 'Safn',
    'tooltips.delete': 'Eyða',
    'tooltips.markAsRead': 'Merkja sem lesið',
    'tooltips.markAsUnread': 'Merkja sem ólest',
    'tooltips.unarchive': 'Bakka út úr safni',

    # Website
    'www.olfong.is': 'www.olfong.is',
}

def translate_key(key):
    """Translate a key to Icelandic"""
    if key in TRANSLATIONS:
        return TRANSLATIONS[key]

    # Try using gemini for unknown keys
    try:
        prompt = f'''Translate the following UI text key to professional Icelandic for an e-commerce wine and beer website called "Ölföng". Keep it concise and natural. Return ONLY the Icelandic translation, nothing else.

Key: {key}

Guidelines:
- Use formal, professional Icelandic
- If it's a button label, use active verbs
- For field labels, use clear descriptive text
- For category names (WINE, BEER, SPIRITS), use Icelandic equivalents
- Keep payment provider names (Teya, Valitor) as-is
- Numbers use comma as decimal separator in Icelandic (24,00 not 24.00)'''

        result = subprocess.run(
            ['gemini', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode == 0:
            translation = result.stdout.strip().split('\n')[0]
            if translation:
                return translation
    except Exception as e:
        print(f"Warning: Could not translate {key}: {str(e)}")

    return key

def process_batch(batch_num):
    """Process a single batch file"""
    batch_num_str = str(batch_num).zfill(3)
    input_file = BATCH_DIR / f'batch-{batch_num_str}.json'
    output_file = BATCH_DIR / f'batch-{batch_num_str}-translated.json'

    if not input_file.exists():
        print(f"Error: File not found: {input_file}")
        return None

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            batch_data = json.load(f)

        keys = batch_data.get('keys', [])
        translations_dict = {}

        for key in keys:
            translation = translate_key(key)
            translations_dict[key] = translation

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(translations_dict, f, ensure_ascii=False, indent=2)

        print(f"Batch {batch_num_str}: {len(keys)} keys translated and saved")
        return len(keys)

    except Exception as e:
        print(f"Error processing batch {batch_num_str}: {str(e)}")
        return None

def main():
    print("Starting batch translation process...")
    print(f"Translation directory: {BATCH_DIR}")
    print()

    total_translated = 0
    completed_batches = 0
    failed_batches = []

    for batch_num in range(1, 31):
        result = process_batch(batch_num)
        if result is not None:
            total_translated += result
            completed_batches += 1
        else:
            failed_batches.append(batch_num)

    print()
    print("=" * 60)
    print("TRANSLATION SUMMARY")
    print("=" * 60)
    print(f"Batches processed: {completed_batches}/30")
    print(f"Total keys translated: {total_translated}")
    if failed_batches:
        print(f"Failed batches: {failed_batches}")
    print("=" * 60)

if __name__ == '__main__':
    main()
