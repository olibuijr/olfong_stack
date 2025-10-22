const { chromium } = require('playwright');

async function testReactDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Check if React is working and if the LanguageProvider is being rendered
    const reactCheck = await page.evaluate(() => {
      // Check if React is loaded
      const hasReact = !!window.React || !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      // Check if the page has proper React content
      const rootElement = document.querySelector('#root');
      const hasReactContent = rootElement && rootElement.children.length > 0;
      
      // Check if there are any React components with translation-related props
      const reactElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el._reactInternalFiber || el._reactInternalInstance
      );
      
      // Check if the LanguageProvider is being rendered by looking for specific elements
      const hasLanguageProvider = document.querySelector('[data-testid="language-provider"]') !== null;
      
      // Check if there are any elements that might be using the translation system
      const translationElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/);
      });
      
      return {
        hasReact,
        hasReactContent,
        reactElementsCount: reactElements.length,
        hasLanguageProvider,
        translationElementsCount: translationElements.length,
        rootElementExists: !!rootElement,
        rootContentLength: rootElement?.innerHTML?.length || 0
      };
    });
    
    console.log('\n=== REACT DEBUG CHECK ===');
    console.log('Has React:', reactCheck.hasReact);
    console.log('Has React content:', reactCheck.hasReactContent);
    console.log('React elements count:', reactCheck.reactElementsCount);
    console.log('Has LanguageProvider:', reactCheck.hasLanguageProvider);
    console.log('Translation elements count:', reactCheck.translationElementsCount);
    console.log('Root element exists:', reactCheck.rootElementExists);
    console.log('Root content length:', reactCheck.rootContentLength);
    
    // Check if there are any JavaScript errors by looking at the page content
    const errorCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Look for common error patterns
      const hasError = bodyText.includes('Error') || 
                      bodyText.includes('TypeError') || 
                      bodyText.includes('ReferenceError') ||
                      bodyText.includes('SyntaxError') ||
                      bodyText.includes('Uncaught');
      
      // Look for loading indicators
      const hasLoading = bodyText.includes('Loading') || 
                        bodyText.includes('loading') ||
                        bodyText.includes('Hleð');
      
      // Check if the page is actually functional
      const hasFunctionalContent = bodyText.length > 1000 && 
                                  (bodyText.includes('Vín') || bodyText.includes('Bjór'));
      
      return {
        hasError,
        hasLoading,
        hasFunctionalContent,
        bodyTextLength: bodyText.length
      };
    });
    
    console.log('\n=== ERROR CHECK ===');
    console.log('Has error:', errorCheck.hasError);
    console.log('Has loading:', errorCheck.hasLoading);
    console.log('Has functional content:', errorCheck.hasFunctionalContent);
    console.log('Body text length:', errorCheck.bodyTextLength);
    
    // Check if the translation system is working by looking at specific elements
    const translationSystemCheck = await page.evaluate(() => {
      // Look for elements that should be translated
      const navElements = document.querySelectorAll('nav a, nav button');
      const navTexts = Array.from(navElements).map(el => el.textContent.trim());
      
      // Count how many are translated vs raw keys
      const translatedNav = navTexts.filter(text => 
        text && !text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/) && text.length > 0
      );
      
      const rawKeyNav = navTexts.filter(text => 
        text && text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/)
      );
      
      return {
        navTexts,
        translatedNav,
        rawKeyNav,
        translationRatio: translatedNav.length / (translatedNav.length + rawKeyNav.length)
      };
    });
    
    console.log('\n=== TRANSLATION SYSTEM CHECK ===');
    console.log('Navigation texts:', translationSystemCheck.navTexts);
    console.log('Translated nav elements:', translationSystemCheck.translatedNav);
    console.log('Raw key nav elements:', translationSystemCheck.rawKeyNav);
    console.log('Translation ratio:', translationSystemCheck.translationRatio);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testReactDebug();