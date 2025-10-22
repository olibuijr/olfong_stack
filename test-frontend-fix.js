const { chromium } = require('playwright');

async function testFrontendFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing frontend after translation fix...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    console.log('Checking Redux store...');
    const reduxState = await page.evaluate(() => {
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        return window.__REDUX_DEVTOOLS_EXTENSION__.getState();
      }
      return { hasReduxDevTools: false };
    });
    console.log('Redux state:', reduxState);
    
    console.log('Checking API calls...');
    const apiCalls = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          url: entry.name,
          status: entry.responseStatus,
          method: entry.name.includes('POST') ? 'POST' : 'GET'
        }));
    });
    console.log('API calls:', apiCalls.slice(0, 10)); // First 10 only
    
    console.log('Checking for data...');
    const dataCheck = await page.evaluate(() => {
      return {
        hasCategories: !!document.querySelector('[class*="category"]'),
        hasBanners: !!document.querySelector('[class*="banner"]'),
        hasProducts: !!document.querySelector('[class*="product"]'),
        bodyText: document.body.textContent.substring(0, 200)
      };
    });
    console.log('Data check:', dataCheck);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testFrontendFix().catch(console.error);