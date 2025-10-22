const { chromium } = require('playwright');

async function testDetailedDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Testing frontend with detailed debugging...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    console.log('Checking for console errors...');
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    console.log('Console errors:', consoleErrors);

    // Check Redux state in detail
    console.log('Checking Redux state in detail...');
    const reduxState = await page.evaluate(() => {
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        return window.__REDUX_DEVTOOLS_EXTENSION__.getState();
      }
      return { hasReduxDevTools: false };
    });
    console.log('Redux state:', reduxState);

    // Check if Redux store is accessible
    console.log('Checking Redux store access...');
    const storeAccess = await page.evaluate(() => {
      try {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
          return { accessible: true, method: 'devtools' };
        }
        if (window.store) {
          return { accessible: true, method: 'window.store', state: window.store.getState() };
        }
        return { accessible: false, reason: 'No store found' };
      } catch (error) {
        return { accessible: false, error: error.message };
      }
    });
    console.log('Store access:', storeAccess);

    // Check for specific elements that should be rendered
    console.log('Checking for specific elements...');
    const elementCheck = await page.evaluate(() => {
      return {
        hasCategorySection: !!document.querySelector('[class*="category"]'),
        hasBannerSection: !!document.querySelector('[class*="banner"]'),
        hasProductSection: !!document.querySelector('[class*="product"]'),
        hasMainContent: !!document.querySelector('main'),
        hasAppRoot: !!document.querySelector('#root'),
        bodyClasses: document.body.className,
        rootContent: document.querySelector('#root')?.innerHTML?.substring(0, 200) || 'No root content'
      };
    });
    console.log('Element check:', elementCheck);

    // Check if data is in the DOM but hidden
    console.log('Checking for hidden data...');
    const hiddenData = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const dataElements = Array.from(elements).filter(el => {
        const text = el.textContent || '';
        return text.includes('Vín') || text.includes('Hvítvín') || text.includes('Rauðvín');
      });
      return {
        count: dataElements.length,
        elements: dataElements.slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.textContent?.substring(0, 50),
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        }))
      };
    });
    console.log('Hidden data check:', hiddenData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testDetailedDebug().catch(console.error);
