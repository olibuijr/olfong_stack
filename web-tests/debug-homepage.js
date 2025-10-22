const { chromium } = require('playwright');

async function debugHomepage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    console.log('Getting page title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Getting all headings...');
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log('Found', headings.length, 'headings');
    
    for (let i = 0; i < headings.length; i++) {
      const text = await headings[i].textContent();
      console.log(`Heading ${i + 1}:`, text);
    }
    
    console.log('Checking for products...');
    const productElements = await page.locator('[data-testid="product"], .product, .card').all();
    console.log('Found', productElements.length, 'product elements');
    
    console.log('Checking for categories...');
    const categoryElements = await page.locator('[data-testid="category"], .category').all();
    console.log('Found', categoryElements.length, 'category elements');
    
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
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugHomepage();