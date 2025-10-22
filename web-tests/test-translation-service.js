const { chromium } = require('playwright');

async function testTranslationService() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for translations to potentially load
    await page.waitForTimeout(10000);
    
    // Check the current state of the indicator
    const indicatorCheck = await page.evaluate(() => {
      const indicator = document.getElementById('language-provider-indicator');
      return {
        hasIndicator: !!indicator,
        indicatorText: indicator?.textContent || 'Not found',
        indicatorColor: indicator?.style.background || 'Not found'
      };
    });
    
    console.log('\n=== INDICATOR CHECK ===');
    console.log('Has indicator:', indicatorCheck.hasIndicator);
    console.log('Indicator text:', indicatorCheck.indicatorText);
    console.log('Indicator color:', indicatorCheck.indicatorColor);
    
    // Test the translationService directly
    const translationServiceTest = await page.evaluate(async () => {
      try {
        // Test if translationService is available
        const hasTranslationService = typeof window.translationService !== 'undefined';
        
        // Test the API call directly
        const response = await fetch('http://localhost:5000/api/translations/language/is');
        const data = await response.json();
        
        return {
          hasTranslationService,
          apiWorking: true,
          apiResponse: {
            success: data.success,
            dataLength: data.data?.length || 0,
            sampleKeys: data.data?.slice(0, 5).map(t => t.key) || []
          }
        };
      } catch (error) {
        return {
          hasTranslationService: false,
          apiWorking: false,
          error: error.message
        };
      }
    });
    
    console.log('\n=== TRANSLATION SERVICE TEST ===');
    console.log('Has translationService:', translationServiceTest.hasTranslationService);
    console.log('API working:', translationServiceTest.apiWorking);
    if (translationServiceTest.apiWorking) {
      console.log('API response:', translationServiceTest.apiResponse);
    } else {
      console.log('API error:', translationServiceTest.error);
    }
    
    // Check if there are any JavaScript errors by looking at the page content
    const errorCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Look for common error patterns
      const hasError = bodyText.includes('Error') || 
                      bodyText.includes('TypeError') || 
                      bodyText.includes('ReferenceError') ||
                      bodyText.includes('SyntaxError') ||
                      bodyText.includes('Uncaught') ||
                      bodyText.includes('Failed to fetch');
      
      // Check if the page is actually functional
      const hasFunctionalContent = bodyText.length > 1000 && 
                                  (bodyText.includes('Vín') || bodyText.includes('Bjór'));
      
      return {
        hasError,
        hasFunctionalContent,
        bodyTextLength: bodyText.length,
        errorSamples: bodyText.match(/Error|TypeError|ReferenceError|SyntaxError|Uncaught|Failed to fetch/gi) || []
      };
    });
    
    console.log('\n=== ERROR CHECK ===');
    console.log('Has error:', errorCheck.hasError);
    console.log('Has functional content:', errorCheck.hasFunctionalContent);
    console.log('Body text length:', errorCheck.bodyTextLength);
    console.log('Error samples:', errorCheck.errorSamples);
    
    // Check if the translation system is working by looking at specific elements
    const translationSystemCheck = await page.evaluate(() => {
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
      
      // Check if there are any elements that look like they're using the translation system
      const elementsWithKeys = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/);
      });
      
      results.elementsWithKeys = elementsWithKeys.length;
      results.sampleKeys = elementsWithKeys.slice(0, 5).map(el => el.textContent.trim());
      
      return results;
    });
    
    console.log('\n=== TRANSLATION SYSTEM CHECK ===');
    console.log('Navigation texts:', translationSystemCheck.navTexts);
    console.log('Translated nav elements:', translationSystemCheck.translatedNav);
    console.log('Raw key nav elements:', translationSystemCheck.rawKeyNav);
    console.log('Translation ratio:', translationSystemCheck.translationRatio);
    console.log('Elements with raw keys:', translationSystemCheck.elementsWithKeys);
    console.log('Sample raw keys:', translationSystemCheck.sampleKeys);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testTranslationService();