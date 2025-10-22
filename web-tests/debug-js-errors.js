const { chromium } = require('playwright');

async function debugJSErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for any JavaScript to execute
    await page.waitForTimeout(5000);
    
    // Check for JavaScript errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack
      });
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console.error',
          message: msg.text()
        });
      }
    });
    
    // Check if the LanguageProvider is being rendered
    const languageProviderCheck = await page.evaluate(() => {
      // Check if the LanguageProvider component exists in the DOM
      const hasLanguageProvider = document.querySelector('[data-testid="language-provider"]') !== null;
      
      // Check if there are any React components with translation-related props
      const reactElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el._reactInternalFiber || el._reactInternalInstance
      );
      
      return {
        hasLanguageProvider,
        reactElementsCount: reactElements.length,
        pageTitle: document.title,
        hasReactRoot: !!document.querySelector('#root')
      };
    });
    
    console.log('\n=== JAVASCRIPT ERRORS ===');
    if (errors.length > 0) {
      errors.forEach(error => {
        console.log(`[${error.type}] ${error.message}`);
        if (error.stack) {
          console.log('Stack:', error.stack);
        }
      });
    } else {
      console.log('No JavaScript errors found');
    }
    
    console.log('\n=== REACT COMPONENT CHECK ===');
    console.log(languageProviderCheck);
    
    // Check if the translation hook is available
    const translationHookCheck = await page.evaluate(() => {
      try {
        // Try to access the translation context through the window object
        return {
          hasWindowStore: !!window.store,
          hasLanguageContext: !!window.React?.createContext,
          hasTranslationService: !!window.translationService
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n=== TRANSLATION HOOK CHECK ===');
    console.log(translationHookCheck);
    
    // Check if the page is actually loading
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.textContent.substring(0, 200),
        hasRootElement: !!document.querySelector('#root'),
        rootContent: document.querySelector('#root')?.innerHTML?.substring(0, 200)
      };
    });
    
    console.log('\n=== PAGE CONTENT CHECK ===');
    console.log(pageContent);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugJSErrors();