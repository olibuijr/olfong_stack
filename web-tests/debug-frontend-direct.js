const { chromium } = require('playwright');

async function debugFrontendDirect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to load
    await page.waitForTimeout(5000);
    
    // Check if translations are loaded
    const translationStatus = await page.evaluate(() => {
      return {
        language: localStorage.getItem('language'),
        hasTranslations: !!localStorage.getItem('translations_is'),
        translationsData: localStorage.getItem('translations_is') ? JSON.parse(localStorage.getItem('translations_is')) : null
      };
    });
    
    console.log('Translation status:', translationStatus);
    
    // Check console logs for translation-related messages
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('translation') || msg.text().includes('LanguageProvider')) {
        logs.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });
    
    await page.waitForTimeout(3000);
    console.log('Translation-related logs:', logs);
    
    // Test specific translation keys
    const translationTest = await page.evaluate(() => {
      // Try to access the translation function directly
      const testKeys = ['navigation.shop', 'productsPage.all', 'home.categories.title'];
      const results = {};
      
      testKeys.forEach(key => {
        // Look for elements with this text
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.includes(key)
        );
        results[key] = {
          found: elements.length,
          sampleText: elements[0]?.textContent?.substring(0, 100) || 'Not found'
        };
      });
      
      return results;
    });
    
    console.log('Translation key tests:', translationTest);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugFrontendDirect();