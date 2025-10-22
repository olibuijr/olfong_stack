const { chromium } = require('playwright');

async function debugTranslationsWithWait() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for initial page load...');
    await page.waitForLoadState('networkidle');
    
    // Wait longer for translations to load
    console.log('Waiting for translations to load (30 seconds)...');
    await page.waitForTimeout(30000);
    
    // Check translation loading status multiple times
    const checkTranslations = async (attempt) => {
      const status = await page.evaluate(() => {
        return {
          language: localStorage.getItem('language'),
          hasTranslations: !!localStorage.getItem('translations_is'),
          hasEnTranslations: !!localStorage.getItem('translations_en'),
          translationsData: localStorage.getItem('translations_is') ? 
            Object.keys(JSON.parse(localStorage.getItem('translations_is'))).length : 0
        };
      });
      
      console.log(`Attempt ${attempt}:`, status);
      return status;
    };
    
    // Check every 5 seconds for up to 60 seconds
    for (let i = 1; i <= 12; i++) {
      const status = await checkTranslations(i);
      if (status.hasTranslations && status.translationsData > 0) {
        console.log('✅ Translations loaded successfully!');
        break;
      }
      if (i < 12) {
        console.log(`⏳ Waiting 5 more seconds... (${i * 5}s total)`);
        await page.waitForTimeout(5000);
      }
    }
    
    // Check console logs for translation loading
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('translation') || 
          msg.text().includes('LanguageProvider') || 
          msg.text().includes('Loading translations') ||
          msg.text().includes('API response')) {
        logs.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('Translation-related logs:', logs);
    
    // Test specific translation keys after waiting
    const translationTest = await page.evaluate(() => {
      const testKeys = [
        'navigation.shop',
        'productsPage.all', 
        'home.categories.title',
        'common.itemsLabel',
        'home.why.title',
        'home.features.wineDescription'
      ];
      
      const results = {};
      
      testKeys.forEach(key => {
        // Look for elements with this exact text (raw key)
        const rawKeyElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.trim() === key
        );
        
        // Look for elements that might contain translated text
        const translatedElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && 
          !el.textContent.includes(key) && 
          !el.textContent.includes('import') &&
          !el.textContent.includes('window') &&
          el.textContent.length > 0 &&
          el.textContent.length < 100
        );
        
        results[key] = {
          rawKeyFound: rawKeyElements.length,
          translatedElements: translatedElements.length,
          sampleRaw: rawKeyElements[0]?.textContent?.substring(0, 50) || 'Not found',
          sampleTranslated: translatedElements.slice(0, 3).map(el => el.textContent.trim()).filter(t => t.length > 0)
        };
      });
      
      return results;
    });
    
    console.log('Translation key analysis:', translationTest);
    
    // Check if any translations are actually working
    const workingTranslations = await page.evaluate(() => {
      // Look for text that might be translated (not raw keys)
      const allText = Array.from(document.querySelectorAll('*'))
        .map(el => el.textContent)
        .filter(text => text && text.trim().length > 0)
        .filter(text => !text.includes('import') && !text.includes('window'))
        .filter(text => !text.includes('.') || !text.match(/^\w+\.\w+$/)) // Not raw keys
        .slice(0, 20); // First 20 meaningful text elements
      
      return allText;
    });
    
    console.log('Sample page text (potentially translated):', workingTranslations);
    
    // Check network requests for translation API calls
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/translations/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/translations/')) {
        const request = networkRequests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.ok = response.ok();
        }
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('Translation API requests:', networkRequests);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugTranslationsWithWait();