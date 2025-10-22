const { chromium } = require('playwright');

async function debugProducts() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to products page...');
    await page.goto('http://localhost:3001/products');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'debug-products.png', fullPage: true });
    
    console.log('Getting page title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Checking for products...');
    const productElements = await page.locator('[data-testid="product"], .product, .card').all();
    console.log('Found', productElements.length, 'product elements');
    
    console.log('Checking for categories...');
    const categoryElements = await page.locator('[data-testid="category"], .category').all();
    console.log('Found', categoryElements.length, 'category elements');
    
    console.log('Checking for loading states...');
    const loadingElements = await page.locator('.loading, .spinner, [data-testid="loading"]').all();
    console.log('Found', loadingElements.length, 'loading elements');
    
    console.log('Checking for error messages...');
    const errorElements = await page.locator('.error, [data-testid="error"]').all();
    console.log('Found', errorElements.length, 'error elements');
    
    console.log('Checking for translation keys...');
    const translationKeys = await page.locator('text=/\\w+\\.\\w+/').all();
    console.log('Found', translationKeys.length, 'potential translation keys');
    
    for (let i = 0; i < Math.min(translationKeys.length, 10); i++) {
      const text = await translationKeys[i].textContent();
      console.log(`Translation key ${i + 1}:`, text);
    }
    
    console.log('Checking console errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('Console errors:', errors);
    
    console.log('Checking network requests...');
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('API requests:', requests);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugProducts();