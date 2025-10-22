const { chromium } = require('playwright');

async function debugJSErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    
    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Capture page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack
      });
      console.log('Page error:', error.message);
    });
    
    // Capture unhandled promise rejections
    const unhandledRejections = [];
    page.on('unhandledrejection', error => {
      unhandledRejections.push({
        message: error.message,
        stack: error.stack
      });
      console.log('Unhandled rejection:', error.message);
    });
    
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    console.log('Checking if React is loaded...');
    const reactInfo = await page.evaluate(() => {
      return {
        hasReact: !!window.React,
        hasReactDOM: !!window.ReactDOM,
        hasRedux: !!window.Redux,
        hasReactRedux: !!window.ReactRedux,
        hasStore: !!window.store,
        hasReduxDevTools: !!window.__REDUX_DEVTOOLS_EXTENSION__,
        windowKeys: Object.keys(window).filter(key => 
          key.includes('react') || key.includes('redux') || key.includes('store')
        )
      };
    });
    console.log('React info:', reactInfo);
    
    console.log('Checking for JavaScript errors in console...');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    console.log('Error messages:', errorMessages);
    
    console.log('Checking for warnings...');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');
    console.log('Warning messages:', warningMessages);
    
    console.log('Checking for info messages...');
    const infoMessages = consoleMessages.filter(msg => msg.type === 'log');
    console.log('Info messages:', infoMessages.slice(0, 10)); // First 10
    
    console.log('Page errors:', pageErrors);
    console.log('Unhandled rejections:', unhandledRejections);
    
    console.log('Checking if Redux actions are being dispatched...');
    const actionDispatchCheck = await page.evaluate(() => {
      // Try to find Redux store in the DOM
      const storeElement = document.querySelector('[data-reactroot]');
      if (storeElement) {
        // Check if Redux Provider is working
        const provider = storeElement.querySelector('[data-react-provider]');
        return {
          hasReactRoot: !!storeElement,
          hasProvider: !!provider,
          reactRootContent: storeElement.innerHTML.substring(0, 500)
        };
      }
      return { hasReactRoot: false };
    });
    console.log('Redux Provider check:', actionDispatchCheck);
    
    console.log('Checking for missing translation errors...');
    const translationErrors = consoleMessages.filter(msg => 
      msg.text.includes('MISSING_TRANSLATION') || 
      msg.text.includes('translation') ||
      msg.text.includes('i18n')
    );
    console.log('Translation errors:', translationErrors);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugJSErrors().catch(console.error);