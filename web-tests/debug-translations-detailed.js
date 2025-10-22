const { chromium } = require('playwright');

async function debugTranslationsDetailed() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for initial page load...');
    await page.waitForLoadState('networkidle');
    
    // Wait longer for translations to load
    console.log('Waiting for translations to load (10 seconds)...');
    await page.waitForTimeout(10000);
    
    // Check all console logs
    const allLogs = [];
    page.on('console', msg => {
      allLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Check network requests
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const request = networkRequests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.ok = response.ok();
        }
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log('\n=== CONSOLE LOGS ===');
    allLogs.forEach(log => {
      console.log(`[${log.type.toUpperCase()}] ${log.text}`);
    });
    
    console.log('\n=== NETWORK REQUESTS ===');
    networkRequests.forEach(req => {
      console.log(`${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });
    
    // Check translation loading status
    const translationStatus = await page.evaluate(() => {
      return {
        language: localStorage.getItem('language'),
        hasTranslations: !!localStorage.getItem('translations_is'),
        hasEnTranslations: !!localStorage.getItem('translations_en'),
        translationsData: localStorage.getItem('translations_is') ? 
          Object.keys(JSON.parse(localStorage.getItem('translations_is'))).length : 0
      };
    });
    
    console.log('\n=== TRANSLATION STATUS ===');
    console.log(translationStatus);
    
    // Test specific translation keys
    const translationTest = await page.evaluate(() => {
      const testKeys = [
        'navigation.shop',
        'productsPage.all', 
        'common.itemsLabel',
        'home.categories.title'
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
    
    console.log('\n=== TRANSLATION KEY ANALYSIS ===');
    console.log(translationTest);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugTranslationsDetailed();