const { chromium } = require('playwright');

async function testTranslationLoadingDetailed() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to potentially load
    await page.waitForTimeout(10000);
    
    // Check if the LanguageProvider indicator is visible
    const providerCheck = await page.evaluate(() => {
      const indicator = document.getElementById('language-provider-indicator');
      return {
        hasIndicator: !!indicator,
        indicatorText: indicator?.textContent || 'Not found'
      };
    });
    
    console.log('\n=== LANGUAGE PROVIDER CHECK ===');
    console.log('Has indicator:', providerCheck.hasIndicator);
    console.log('Indicator text:', providerCheck.indicatorText);
    
    // Check localStorage for translations
    const translationStatus = await page.evaluate(() => {
      return {
        language: localStorage.getItem('language'),
        hasTranslations: !!localStorage.getItem('translations_is'),
        hasEnTranslations: !!localStorage.getItem('translations_en'),
        translationsData: localStorage.getItem('translations_is') ? 
          Object.keys(JSON.parse(localStorage.getItem('translations_is'))).length : 0,
        allLocalStorageKeys: Object.keys(localStorage),
        missingTranslations: localStorage.getItem('missingTranslations') ? 
          JSON.parse(localStorage.getItem('missingTranslations')).length : 0
      };
    });
    
    console.log('\n=== TRANSLATION STATUS ===');
    console.log('Language:', translationStatus.language);
    console.log('Has translations:', translationStatus.hasTranslations);
    console.log('Has EN translations:', translationStatus.hasEnTranslations);
    console.log('Translations data count:', translationStatus.translationsData);
    console.log('All localStorage keys:', translationStatus.allLocalStorageKeys);
    console.log('Missing translations count:', translationStatus.missingTranslations);
    
    // Check if API calls are being made by looking at network requests
    const networkCheck = await page.evaluate(async () => {
      // Try to make a direct API call to see if it works
      try {
        const response = await fetch('http://localhost:5000/api/translations/language/is');
        const data = await response.json();
        return {
          apiWorking: true,
          apiResponse: {
            success: data.success,
            dataLength: data.data?.length || 0,
            sampleKeys: data.data?.slice(0, 5).map(t => t.key) || []
          }
        };
      } catch (error) {
        return {
          apiWorking: false,
          error: error.message
        };
      }
    });
    
    console.log('\n=== API CHECK ===');
    console.log('API working:', networkCheck.apiWorking);
    if (networkCheck.apiWorking) {
      console.log('API response:', networkCheck.apiResponse);
    } else {
      console.log('API error:', networkCheck.error);
    }
    
    // Check the current state of translations on the page
    const pageTranslationCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Count different types of content
      const rawKeys = (bodyText.match(/[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*/g) || []).length;
      const icelandicWords = ['Verslun', 'Allt', 'Vörur', 'Flokkar', 'Vín', 'Bjór', 'Afhending', 'Innskráning'].filter(word => bodyText.includes(word)).length;
      const englishWords = ['Shop', 'All', 'Items', 'Categories', 'Wine', 'Beer', 'Delivery', 'Login'].filter(word => bodyText.includes(word)).length;
      
      // Look for specific translation patterns
      const specificKeys = ['productsPage.all', 'navigation.shop', 'common.itemsLabel', 'admincategories.subcategories'];
      const foundKeys = specificKeys.filter(key => bodyText.includes(key));
      
      return {
        rawKeys,
        icelandicWords,
        englishWords,
        foundKeys,
        totalLength: bodyText.length,
        hasMixedContent: rawKeys > 0 && icelandicWords > 0
      };
    });
    
    console.log('\n=== PAGE TRANSLATION CHECK ===');
    console.log('Raw translation keys found:', pageTranslationCheck.rawKeys);
    console.log('Icelandic words found:', pageTranslationCheck.icelandicWords);
    console.log('English words found:', pageTranslationCheck.englishWords);
    console.log('Found specific keys:', pageTranslationCheck.foundKeys);
    console.log('Total content length:', pageTranslationCheck.totalLength);
    console.log('Has mixed content:', pageTranslationCheck.hasMixedContent);
    
    // Check if the translation system is working by looking at specific elements
    const elementCheck = await page.evaluate(() => {
      const results = {};
      
      // Check for navigation elements
      const navElements = document.querySelectorAll('nav a, nav button');
      results.navTexts = Array.from(navElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
      
      // Count translated vs raw keys
      const translatedNav = results.navTexts.filter(text => 
        text && !text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/) && text.length > 0
      );
      
      const rawKeyNav = results.navTexts.filter(text => 
        text && text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/)
      );
      
      results.translatedNav = translatedNav;
      results.rawKeyNav = rawKeyNav;
      results.translationRatio = translatedNav.length / (translatedNav.length + rawKeyNav.length);
      
      return results;
    });
    
    console.log('\n=== ELEMENT CHECK ===');
    console.log('Navigation texts:', elementCheck.navTexts);
    console.log('Translated nav elements:', elementCheck.translatedNav);
    console.log('Raw key nav elements:', elementCheck.rawKeyNav);
    console.log('Translation ratio:', elementCheck.translationRatio);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testTranslationLoadingDetailed();