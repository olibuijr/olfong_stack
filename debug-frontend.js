const { chromium } = require('playwright');

async function debugFrontend() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'frontend-debug.png' });
    
    console.log('Checking for console errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
    
    console.log('Checking Redux state...');
    const reduxState = await page.evaluate(() => {
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        return window.__REDUX_DEVTOOLS_EXTENSION__.getState();
      }
      return null;
    });
    console.log('Redux state:', reduxState);
    
    console.log('Checking for categories...');
    const categories = await page.$$eval('[data-testid="category"], .category, [class*="category"]', 
      elements => elements.map(el => ({
        text: el.textContent,
        className: el.className,
        id: el.id
      }))
    );
    console.log('Found categories:', categories);
    
    console.log('Checking for banners...');
    const banners = await page.$$eval('[data-testid="banner"], .banner, [class*="banner"]', 
      elements => elements.map(el => ({
        text: el.textContent,
        className: el.className,
        id: el.id
      }))
    );
    console.log('Found banners:', banners);
    
    console.log('Checking for products...');
    const products = await page.$$eval('[data-testid="product"], .product, [class*="product"]', 
      elements => elements.map(el => ({
        text: el.textContent,
        className: el.className,
        id: el.id
      }))
    );
    console.log('Found products:', products);
    
    console.log('Checking API calls...');
    const apiCalls = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          url: entry.name,
          status: entry.responseStatus,
          duration: entry.duration
        }));
    });
    console.log('API calls:', apiCalls);
    
    console.log('Checking for loading states...');
    const loadingElements = await page.$$eval('[class*="loading"], [class*="spinner"], [data-testid="loading"]', 
      elements => elements.map(el => ({
        text: el.textContent,
        className: el.className
      }))
    );
    console.log('Loading elements:', loadingElements);
    
    console.log('Checking page title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Checking for error messages...');
    const errorMessages = await page.$$eval('[class*="error"], [class*="alert"], .toast', 
      elements => elements.map(el => ({
        text: el.textContent,
        className: el.className
      }))
    );
    console.log('Error messages:', errorMessages);
    
    console.log('Console errors found:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugFrontend().catch(console.error);