const { chromium } = require('playwright');

async function debugNetwork() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing network connectivity...');
    
    // Test basic connectivity
    const basicTest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Basic API test:', basicTest);
    
    // Test translation endpoint with different approaches
    const translationTests = await page.evaluate(async () => {
      const results = [];
      
      // Test 1: Direct fetch
      try {
        const response = await fetch('http://localhost:5000/api/translations/language/is');
        const data = await response.json();
        results.push({ method: 'direct_fetch', success: true, status: response.status, dataLength: data.data?.length });
      } catch (error) {
        results.push({ method: 'direct_fetch', success: false, error: error.message });
      }
      
      // Test 2: Fetch with explicit headers
      try {
        const response = await fetch('http://localhost:5000/api/translations/language/is', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        results.push({ method: 'with_headers', success: true, status: response.status, dataLength: data.data?.length });
      } catch (error) {
        results.push({ method: 'with_headers', success: false, error: error.message });
      }
      
      // Test 3: Fetch with CORS headers
      try {
        const response = await fetch('http://localhost:5000/api/translations/language/is', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        results.push({ method: 'with_cors', success: true, status: response.status, dataLength: data.data?.length });
      } catch (error) {
        results.push({ method: 'with_cors', success: false, error: error.message });
      }
      
      return results;
    });
    
    console.log('Translation API tests:', translationTests);
    
    // Check browser console for errors
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

debugNetwork();