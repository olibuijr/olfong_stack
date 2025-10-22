const { chromium } = require('playwright');

async function testUseEffectDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log('Browser console:', msg.text());
    }
  });

  try {
    console.log('Testing useEffect debug...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Check if the useEffect debug messages appeared
    const logs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    console.log('Console logs:', logs);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testUseEffectDebug().catch(console.error);
