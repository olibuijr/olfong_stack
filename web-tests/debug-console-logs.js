const { chromium } = require('playwright');

async function debugConsoleLogs() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for any potential API calls
    await page.waitForTimeout(5000);
    
    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Capture network requests
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
    
    console.log('\n=== CONSOLE MESSAGES ===');
    if (consoleMessages.length > 0) {
      consoleMessages.forEach(msg => {
        console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
      });
    } else {
      console.log('No console messages captured');
    }
    
    console.log('\n=== NETWORK REQUESTS ===');
    if (networkRequests.length > 0) {
      networkRequests.forEach(req => {
        console.log(`${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
      });
    } else {
      console.log('No API requests made');
    }
    
    // Check if the LanguageProvider is actually being called
    const languageProviderCheck = await page.evaluate(() => {
      // Try to access the translation context through the window object
      return {
        hasWindowStore: !!window.store,
        hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
        hasLanguageContext: !!window.React?.createContext,
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage)
      };
    });
    
    console.log('\n=== LANGUAGE PROVIDER CHECK ===');
    console.log(languageProviderCheck);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugConsoleLogs();