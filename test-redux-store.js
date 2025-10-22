const { chromium } = require('playwright');

async function testReduxStore() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing Redux store initialization...');
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      if (msg.type() === 'error') {
        console.log('ERROR:', msg.text());
      }
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    console.log('Checking if Redux store exists...');
    const storeCheck = await page.evaluate(() => {
      return {
        hasRedux: !!window.Redux,
        hasReactRedux: !!window.ReactRedux,
        hasStore: !!window.store,
        hasReduxDevTools: !!window.__REDUX_DEVTOOLS_EXTENSION__,
        windowKeys: Object.keys(window).filter(key => 
          key.includes('redux') || key.includes('store') || key.includes('react')
        ),
        documentTitle: document.title,
        hasReactRoot: !!document.querySelector('[data-reactroot]'),
        bodyContent: document.body.innerHTML.substring(0, 500)
      };
    });
    console.log('Store check:', storeCheck);
    
    console.log('Checking for JavaScript errors...');
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    console.log('Errors found:', errors.length);
    if (errors.length > 0) {
      console.log('First few errors:', errors.slice(0, 5));
    }
    
    console.log('Checking for warnings...');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    console.log('Warnings found:', warnings.length);
    if (warnings.length > 0) {
      console.log('First few warnings:', warnings.slice(0, 5));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testReduxStore().catch(console.error);