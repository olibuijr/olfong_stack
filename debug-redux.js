const { chromium } = require('playwright');

async function debugRedux() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    console.log('Checking Redux store state...');
    const reduxState = await page.evaluate(() => {
      // Check if Redux store is available
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        const state = window.__REDUX_DEVTOOLS_EXTENSION__.getState();
        return state;
      }
      
      // Try to access store directly
      if (window.store) {
        return window.store.getState();
      }
      
      // Check for any global state
      return {
        hasReduxDevTools: !!window.__REDUX_DEVTOOLS_EXTENSION__,
        hasStore: !!window.store,
        windowKeys: Object.keys(window).filter(key => key.includes('redux') || key.includes('store'))
      };
    });
    console.log('Redux state:', JSON.stringify(reduxState, null, 2));
    
    console.log('Checking for Redux actions being dispatched...');
    const actions = await page.evaluate(() => {
      // Listen for Redux actions
      const actions = [];
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        const devTools = window.__REDUX_DEVTOOLS_EXTENSION__;
        if (devTools.send) {
          // Try to get recent actions
          try {
            const state = devTools.getState();
            return { state, actions: [] };
          } catch (e) {
            return { error: e.message };
          }
        }
      }
      return { actions };
    });
    console.log('Redux actions:', actions);
    
    console.log('Checking for API calls in network...');
    const networkRequests = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          url: entry.name,
          status: entry.responseStatus,
          duration: entry.duration,
          method: entry.name.includes('POST') ? 'POST' : 'GET'
        }));
    });
    console.log('API requests:', networkRequests);
    
    console.log('Checking for JavaScript errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
    
    console.log('Checking if components are rendering...');
    const componentChecks = await page.evaluate(() => {
      return {
        hasHomeComponent: !!document.querySelector('[data-testid="home"], .home, [class*="home"]'),
        hasCategoryComponent: !!document.querySelector('[data-testid="category"], .category, [class*="category"]'),
        hasBannerComponent: !!document.querySelector('[data-testid="banner"], .banner, [class*="banner"]'),
        hasProductComponent: !!document.querySelector('[data-testid="product"], .product, [class*="product"]'),
        bodyText: document.body.textContent.substring(0, 500),
        hasLoadingSpinner: !!document.querySelector('[class*="loading"], [class*="spinner"]'),
        hasErrorMessages: !!document.querySelector('[class*="error"], [class*="alert"]')
      };
    });
    console.log('Component checks:', componentChecks);
    
    console.log('Checking for React errors...');
    const reactErrors = await page.evaluate(() => {
      // Check for React error boundaries
      const errorBoundaries = document.querySelectorAll('[data-react-error-boundary]');
      return {
        errorBoundaries: errorBoundaries.length,
        errorBoundaryText: Array.from(errorBoundaries).map(el => el.textContent)
      };
    });
    console.log('React errors:', reactErrors);
    
    console.log('Checking for missing translations...');
    const missingTranslations = await page.evaluate(() => {
      // Check if there are missing translation warnings
      const warnings = [];
      const originalWarn = console.warn;
      console.warn = (...args) => {
        warnings.push(args.join(' '));
        originalWarn.apply(console, args);
      };
      
      // Trigger some translation calls
      setTimeout(() => {
        console.warn('Test warning');
      }, 100);
      
      return warnings;
    });
    console.log('Missing translations:', missingTranslations);
    
    console.log('Total console errors found:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugRedux().catch(console.error);