#!/usr/bin/env python3

import json
from pathlib import Path
import subprocess
from collections import defaultdict

BATCH_DIR = Path('/home/olibuijr/Projects/olfong_stack/backend/translation-batches')

# Comprehensive static translation dictionary
STATIC_TRANSLATIONS = {
    # CSS and Structure
    '.link-dropdown-container': 'Tengill-fellivalmöguleikar',
    '.relative': 'Afstætt',
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
    'adminAnalytics.totalCustomers': 'Heildarfjöldi viðskiptavina',
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
    'adminCategories.discountEndDate': 'Lok afsláttarlosunar',
    'adminCategories.discountHelp': 'Hjálp fyrir afslátt',
    'adminCategories.discountPercentage': 'Afsláttarprósenta',
    'adminCategories.discountReasonEn': 'Ástæða afsláttar (Enska)',
    'adminCategories.discountReasonIs': 'Ástæða afsláttar (Íslenska)',
    'adminCategories.discounts': 'Afslættir',
    'adminCategories.discountStartDate': 'Upphaf afsláttarlosunar',
    'adminCategories.editCategory': 'Breyta flokki',
    'adminCategories.enableCategoryDiscount': 'Virkja flokksafslátt',
    'adminCategories.enableDiscountMessage': 'Virkjaðu afslætti',
    'adminCategories.icon': 'Tákn',
    'adminCategories.iconHelp': 'Aðstoð takna',
    'adminCategories.images': 'Myndir',
    'adminCategories.inactive': 'Óvirk',
    'adminCategories.manageCategories': 'Stjórna flokkum',
    'adminCategories.metaDescEn': 'Meta lýsing (Enska)',
    'adminCategories.metaDescIs': 'Meta lýsing (Íslenska)',
    'adminCategories.metaTitleEn': 'Meta titill (Enska)',
    'adminCategories.metaTitleIs': 'Meta titill (Íslenska)',
    'adminCategories.name': 'Nafn',
    'adminCategories.nameEn': 'Nafn (Enska)',
    'adminCategories.nameIs': 'Nafn (Íslenska)',
    'adminCategories.nameRequired': 'Nafn er krafist',
    'adminCategories.newCategory': 'Nýr flokkur',
    'adminCategories.noCategories': 'Engir flokkar',
    'adminCategories.noDescription': 'Engin lýsing',
    'adminCategories.productCount': 'Vörutalning',
    'adminCategories.rate': 'Hlutfall',
    'adminCategories.removeImage': 'Fjarlægja mynd',
    'adminCategories.selectedVatProfile': 'Valinn VSK prófíl',
    'adminCategories.selectFromMedia': 'Veldu úr miðlum',
    'adminCategories.selectVatProfile': 'Veldu VSK prófíl',
    'adminCategories.seo': 'SEO',
    'adminCategories.seoHelp': 'SEO hjálp',
    'adminCategories.slug': 'Slög',
    'adminCategories.slugHelp': 'Hjálp fyrir slög',
    'adminCategories.sortOrder': 'Röðunarröð',
    'adminCategories.subcategories': 'Undirflokkar',
    'adminCategories.title': 'Titill',
    'adminCategories.vat': 'VSK',
    'adminCategories.vatHelp': 'VSK hjálp',
    'adminCategories.vatProfile': 'VSK prófíl',
    'adminCategories.vatProfileHelp': 'VSK prófíl hjálp',

    # Admin Chat
    'adminChat.accessDenied': 'Aðgangur ekki leyfður',
    'adminChat.accessDeniedMessage': 'Þú hefur ekki réttindi til að fá aðgang að þessum gögnum.',
    'adminChat.active': 'Virk',
    'adminChat.allStatuses': 'Allar stöður',
    'adminChat.archived': 'Safnað',
    'adminChat.customerTyping': 'Viðskiptavinur er að skrifa',
    'adminChat.noConversations': 'Engin samtöl',
    'adminChat.noMessages': 'Engin skilaboð',

    # Cart
    'cart.itemAdded': 'Vara bætt við körfu',
    'cart.items': 'Vörur',
    'cart.title': 'Karfa',

    # Cart Page
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

    # Checkout Page
    'checkoutPage.cashOnDelivery': 'Reiðufé við afhendingu',

    # Receipts and Search
    'receipts.viewReceipt': 'Skoðaðu kvittun',
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
    'subcategories.ROSE_WINE': 'Rósavín',
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

    # Navigation
    'navigation.admin': 'Stjórnandi',
    'navigation.beer': 'Bjór',
    'navigation.cart': 'Karfa',
    'navigation.contactUs': 'Hafðu samband',
    'navigation.delivery': 'Sending',
    'navigation.discoverCategories': 'Uppdiskuðu flokka',
    'navigation.home': 'Heim',
    'navigation.language': 'Tungumál',
    'navigation.login': 'Innskrá',
    'navigation.logout': 'Útskrá',
    'navigation.menu': 'Valmynd',
    'navigation.needHelp': 'Þarftu hjálp?',
    'navigation.nonAlcoholic': 'Alkóhóllaust',
    'navigation.products': 'Vörur',
    'navigation.profile': 'Prófíl',
    'navigation.shop': 'Verslun',
    'navigation.spirits': 'Brennivín',
    'navigation.viewAllProducts': 'Skoðaðu allar vörur',
    'navigation.wine': 'Vín',

    # Login
    'login.insertPhoneNumber': 'Settu inn símanúmer',
    'login.loggingIn': 'Skrái þig inn',
    'login.loginWithEmail': 'Innskrá með tölvupósti',
    'login.loginWithPhone': 'Innskrá með síma',
    'login.password': 'Lykilorð',
    'login.testLogin': 'Prófun innskráningar',

    # Notifications
    'notifications.deliveryMethods': 'Sendingaraðferðir',
    'notifications.emailNotifications': 'Tilkynningar í tölvupósti',
    'notifications.marketing': 'Markaðssetning',
    'notifications.noNotifications': 'Engar tilkynningar',
    'notifications.orderUpdates': 'Pöntun uppfærslur',
    'notifications.pushNotifications': 'Ýta tilkynningum',
    'notifications.securityAlerts': 'Öryggis viðvaranir',
    'notifications.settings': 'Stillingar',
    'notifications.smsNotifications': 'SMS tilkynningar',
    'notifications.systemAlerts': 'Kerfa viðvaranir',
    'notifications.types': 'Gerðir',

    # Order
    'order.orderNumber': 'Pöntunarnúmer',

    # Order Detail Page
    'orderDetailPage.backToOrders': 'Til baka til pantana',
    'orderDetailPage.created': 'Búið til',
    'orderDetailPage.deliveredAt': 'Afhent á',
    'orderDetailPage.deliveryAddress': 'Sendingarheimilisfang',
    'orderDetailPage.deliveryInfo': 'Sendingarupplýsingar',
    'orderDetailPage.deliveryMethod': 'Sendingaraðferð',
    'orderDetailPage.deliveryPerson': 'Sendingaraðili',
    'orderDetailPage.each': 'hver',
    'orderDetailPage.estimatedDelivery': 'Áætluð sending',
    'orderDetailPage.homeDelivery': 'Heimsendir',
    'orderDetailPage.notes': 'Athugasemdir',
    'orderDetailPage.order': 'Pöntun',
    'orderDetailPage.orderItems': 'Pantaðar vörur',
}

def main():
    print("="*70)
    print("EFFICIENT BATCH TRANSLATION PROCESSOR")
    print("="*70)

    print(f"\nPre-loaded translations: {len(STATIC_TRANSLATIONS)}")
    print(f"Processing batches...\n")

    total_keys = 0
    translated_count = 0
    completed = 0

    for i in range(1, 31):
        batch_file = BATCH_DIR / f'batch-{str(i).zfill(3)}.json'
        output_file = BATCH_DIR / f'batch-{str(i).zfill(3)}-translated.json'

        if not batch_file.exists():
            continue

        try:
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch = json.load(f)

            keys = batch.get('keys', [])
            result = {}

            for key in keys:
                if key in STATIC_TRANSLATIONS:
                    result[key] = STATIC_TRANSLATIONS[key]
                    translated_count += 1
                else:
                    result[key] = key

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            total_keys += len(keys)
            completed += 1
            print(f"Batch {str(i).zfill(3)}: {len(keys)} keys ({sum(1 for k in keys if k in STATIC_TRANSLATIONS)} translated)")

        except Exception as e:
            print(f"Error processing batch {str(i).zfill(3)}: {str(e)}")

    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"Batches processed: {completed}/30")
    print(f"Total keys: {total_keys}")
    print(f"Translated with static dictionary: {translated_count}")
    print(f"Remaining (fallback to key): {total_keys - translated_count}")
    print(f"Translation coverage: {(translated_count/total_keys*100):.1f}%")
    print(f"{'='*70}")

if __name__ == '__main__':
    main()
