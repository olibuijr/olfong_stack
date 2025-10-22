import { chromium } from 'playwright';

async function globalSetup() {
  console.log('🌐 Setting up global test configuration...');

  // Set default language to English for tests
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app and set language to English
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('i18nextLng', 'en');
      // Also try to set it via i18n if available
      if (window.i18n) {
        window.i18n.changeLanguage('en');
      }
    });
    console.log('✅ Set default language to English for tests');
  } catch (error) {
    console.log('⚠️ Could not set default language:', error.message);
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;