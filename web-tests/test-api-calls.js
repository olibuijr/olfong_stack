const { chromium } = require('playwright');

async function testApiCalls() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for any potential API calls
    await page.waitForTimeout(10000);
    
    // Check all network requests
    const allRequests = [];
    page.on('request', request => {
      allRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('response', response => {
      const request = allRequests.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
        request.ok = response.ok();
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log('\n=== ALL NETWORK REQUESTS ===');
    allRequests.forEach(req => {
      console.log(`${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });
    
    // Check if translations are being loaded
    const translationStatus = await page.evaluate(() => {
      return {
        language: localStorage.getItem('language'),
        hasTranslations: !!localStorage.getItem('translations_is'),
        hasEnTranslations: !!localStorage.getItem('translations_en'),
        translationsData: localStorage.getItem('translations_is') ? 
          Object.keys(JSON.parse(localStorage.getItem('translations_is'))).length : 0
      };
    });
    
    console.log('\n=== TRANSLATION STATUS ===');
    console.log(translationStatus);
    
    // Check if the page has any content
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.textContent,
        hasContent: document.body.textContent.length > 100,
        title: document.title
      };
    });
    
    console.log('\n=== PAGE CONTENT ===');
    console.log('Title:', pageContent.title);
    console.log('Has content:', pageContent.hasContent);
    console.log('Body text length:', pageContent.bodyText.length);
    console.log('Body text:', pageContent.bodyText);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testApiCalls();