const { chromium } = require('playwright');

async function testTranslationKeys() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to potentially load
    await page.waitForTimeout(5000);
    
    // Check for specific translation keys on the page
    const translationCheck = await page.evaluate(() => {
      const results = {};
      
      // Check for navigation.shop
      const shopElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('navigation.shop')
      );
      results.navigationShop = {
        found: shopElements.length,
        text: shopElements[0]?.textContent || 'Not found'
      };
      
      // Check for productsPage.all
      const allElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('productsPage.all')
      );
      results.productsPageAll = {
        found: allElements.length,
        text: allElements[0]?.textContent || 'Not found'
      };
      
      // Check for common.itemsLabel
      const itemsElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('common.itemsLabel')
      );
      results.commonItemsLabel = {
        found: itemsElements.length,
        text: itemsElements[0]?.textContent || 'Not found'
      };
      
      // Check for home.categories.title
      const categoriesElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('home.categories.title')
      );
      results.homeCategoriesTitle = {
        found: categoriesElements.length,
        text: categoriesElements[0]?.textContent || 'Not found'
      };
      
      // Check for any raw translation keys
      const allRawKeys = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/)
      );
      results.rawKeys = allRawKeys.map(el => el.textContent.trim()).slice(0, 10);
      
      // Check for translated text (Icelandic)
      const icelandicText = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('Verslun') ||
          el.textContent.includes('Allt') ||
          el.textContent.includes('Vörur') ||
          el.textContent.includes('Flokkar')
        )
      );
      results.icelandicText = icelandicText.map(el => el.textContent.trim()).slice(0, 10);
      
      return results;
    });
    
    console.log('\n=== TRANSLATION KEY CHECK ===');
    console.log('Navigation Shop:', translationCheck.navigationShop);
    console.log('Products Page All:', translationCheck.productsPageAll);
    console.log('Common Items Label:', translationCheck.commonItemsLabel);
    console.log('Home Categories Title:', translationCheck.homeCategoriesTitle);
    
    console.log('\n=== RAW TRANSLATION KEYS FOUND ===');
    if (translationCheck.rawKeys.length > 0) {
      translationCheck.rawKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('  No raw translation keys found (good!)');
    }
    
    console.log('\n=== ICELANDIC TRANSLATED TEXT FOUND ===');
    if (translationCheck.icelandicText.length > 0) {
      translationCheck.icelandicText.forEach(text => console.log(`  - ${text}`));
    } else {
      console.log('  No Icelandic text found');
    }
    
    // Check if the page is actually using translations
    const pageAnalysis = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      return {
        hasRawKeys: /[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*/.test(bodyText),
        hasIcelandicText: /Verslun|Allt|Vörur|Flokkar/.test(bodyText),
        bodyTextLength: bodyText.length,
        sampleText: bodyText.substring(0, 500)
      };
    });
    
    console.log('\n=== PAGE ANALYSIS ===');
    console.log('Has raw keys:', pageAnalysis.hasRawKeys);
    console.log('Has Icelandic text:', pageAnalysis.hasIcelandicText);
    console.log('Body text length:', pageAnalysis.bodyTextLength);
    console.log('Sample text:', pageAnalysis.sampleText);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testTranslationKeys();