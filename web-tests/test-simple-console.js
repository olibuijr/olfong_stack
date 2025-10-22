const { chromium } = require('playwright');

async function testSimpleConsole() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Inject a simple console.log to test if console logging works
    await page.evaluate(() => {
      console.log('TEST: This should appear in console logs');
      console.error('TEST ERROR: This should appear in console logs');
      console.warn('TEST WARNING: This should appear in console logs');
    });
    
    // Wait a bit for the logs to be captured
    await page.waitForTimeout(2000);
    
    // Check console logs
    const logs = [];
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    await page.waitForTimeout(1000);
    
    console.log('\n=== CONSOLE LOGS ===');
    if (logs.length > 0) {
      logs.forEach(log => {
        console.log(`[${log.type.toUpperCase()}] ${log.text}`);
      });
    } else {
      console.log('No console logs captured');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testSimpleConsole();