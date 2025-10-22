const { chromium } = require('playwright');

async function debugTranslations() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to load
    await page.waitForTimeout(3000);
    
    console.log('Checking translation loading...');
    
    // Check if translations are loaded in localStorage
    const translations = await page.evaluate(() => {
      return {
        isTranslations: localStorage.getItem('translations_is'),
        enTranslations: localStorage.getItem('translations_en'),
        language: localStorage.getItem('language')
      };
    });
    
    console.log('LocalStorage translations:', {
      hasIsTranslations: !!translations.isTranslations,
      hasEnTranslations: !!translations.enTranslations,
      currentLanguage: translations.language
    });
    
    // Check network requests for translations
    const translationRequests = [];
    page.on('request', request => {
      if (request.url().includes('/translations/')) {
        translationRequests.push({
          url: request.url(),
          method: request.method(),
          status: 'pending'
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/translations/')) {
        const request = translationRequests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.ok = response.ok();
        }
      }
    });
    
    // Navigate to products page to trigger more translation requests
    await page.goto('http://localhost:3001/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Translation requests:', translationRequests);
    
    // Check for specific translation keys that should be working
    const translationTests = [
      'navigation.shop',
      'productsPage.all',
      'home.categories.title',
      'home.why.title',
      'common.itemsLabel'
    ];
    
    console.log('Testing specific translation keys...');
    for (const key of translationTests) {
      const result = await page.evaluate((key) => {
        // Try to find elements with this translation key
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.includes(key)
        );
        return {
          key,
          found: elements.length,
          text: elements.map(el => el.textContent).slice(0, 3)
        };
      }, key);
      
      console.log(`Key "${key}":`, result);
    }
    
    // Check console for translation-related errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('translation')) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('Translation-related errors:', errors);
    
    // Check if translation service is working
    const translationServiceTest = await page.evaluate(async () => {
      try {
        // Try to call the translation service directly
        const response = await fetch('/api/translations/language/is');
        const data = await response.json();
        return {
          success: data.success,
          count: data.data ? data.data.length : 0,
          sample: data.data ? data.data.slice(0, 3) : []
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Translation service test:', translationServiceTest);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugTranslations();