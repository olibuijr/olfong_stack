const { chromium } = require('playwright');

async function testTranslationLoading() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to potentially load
    await page.waitForTimeout(10000);
    
    // Check if translations are being loaded by looking at localStorage
    const translationStatus = await page.evaluate(() => {
      return {
        language: localStorage.getItem('language'),
        hasTranslations: !!localStorage.getItem('translations_is'),
        hasEnTranslations: !!localStorage.getItem('translations_en'),
        translationsData: localStorage.getItem('translations_is') ? 
          Object.keys(JSON.parse(localStorage.getItem('translations_is'))).length : 0,
        allLocalStorageKeys: Object.keys(localStorage)
      };
    });
    
    console.log('\n=== TRANSLATION STATUS ===');
    console.log(translationStatus);
    
    // Check if the page has any translated content
    const contentCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Look for specific translation patterns
      const icelandicWords = ['Verslun', 'Allt', 'Vörur', 'Flokkar', 'Vín', 'Bjór', 'Afhending', 'Innskráning'];
      const englishWords = ['Shop', 'All', 'Items', 'Categories', 'Wine', 'Beer', 'Delivery', 'Login'];
      
      const foundIcelandic = icelandicWords.filter(word => bodyText.includes(word));
      const foundEnglish = englishWords.filter(word => bodyText.includes(word));
      
      // Look for raw translation keys
      const rawKeys = bodyText.match(/[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*/g) || [];
      
      return {
        foundIcelandic,
        foundEnglish,
        rawKeys: rawKeys.slice(0, 10),
        bodyTextLength: bodyText.length,
        hasMixedContent: foundIcelandic.length > 0 && rawKeys.length > 0
      };
    });
    
    console.log('\n=== CONTENT CHECK ===');
    console.log('Found Icelandic words:', contentCheck.foundIcelandic);
    console.log('Found English words:', contentCheck.foundEnglish);
    console.log('Raw translation keys:', contentCheck.rawKeys);
    console.log('Body text length:', contentCheck.bodyTextLength);
    console.log('Has mixed content (translated + raw keys):', contentCheck.hasMixedContent);
    
    // Check if the translation system is working by looking for specific elements
    const elementCheck = await page.evaluate(() => {
      const results = {};
      
      // Check for navigation elements
      const navLinks = document.querySelectorAll('nav a, nav button');
      results.navTexts = Array.from(navLinks).map(el => el.textContent.trim()).filter(text => text.length > 0);
      
      // Check for category elements
      const categoryElements = document.querySelectorAll('[class*="category"], [class*="Category"]');
      results.categoryTexts = Array.from(categoryElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
      
      // Check for any elements that might contain translated text
      const allElements = document.querySelectorAll('*');
      const translatedElements = Array.from(allElements).filter(el => {
        const text = el.textContent?.trim();
        return text && 
               text.length > 0 && 
               text.length < 50 && 
               !text.includes('.') && 
               !text.match(/^[0-9.,]+$/) &&
               !text.includes('import') &&
               !text.includes('window');
      });
      
      results.sampleTranslatedTexts = translatedElements.slice(0, 20).map(el => el.textContent.trim());
      
      return results;
    });
    
    console.log('\n=== ELEMENT CHECK ===');
    console.log('Navigation texts:', elementCheck.navTexts);
    console.log('Category texts:', elementCheck.categoryTexts);
    console.log('Sample translated texts:', elementCheck.sampleTranslatedTexts);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testTranslationLoading();