import { test, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ADMIN_PAGES = [
  '/admin',
  '/admin/products',
  '/admin/categories',
  '/admin/orders',
  '/admin/customers',
  '/admin/chat',
  '/admin/analytics',
  '/admin/reports',
  '/admin/notifications',
  '/admin/media',
  '/admin/banners',
  '/admin/translations',
  '/admin/settings/general',
  '/admin/settings/business',
  '/admin/settings/shipping',
  '/admin/settings/vat',
  '/admin/settings/api-keys',
  '/admin/settings/payment-gateways',
];

test.describe('Collect Missing Translations', () => {
  let context: BrowserContext;
  let missingTranslations: Set<string> = new Set();

  test.beforeAll(async ({ browser }) => {
    // Create a persistent context to maintain login
    context = await browser.newContext();
  });

  test('Login to admin', async () => {
    const page = await context.newPage();
    
    // Navigate to login
    await page.goto('http://localhost:3001/admin-login');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[placeholder*="email" i], [data-testid="email-input"]', { timeout: 5000 }).catch(() => null);
    
    // Try to find and fill email input
    const emailInputs = await page.locator('input[type="email"], input[placeholder*="email" i]').all();
    if (emailInputs.length > 0) {
      await emailInputs[0].fill('admin@example.com');
    }
    
    // Try to find and fill password input
    const passwordInputs = await page.locator('input[type="password"], input[placeholder*="password" i]').all();
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill('admin');
    }
    
    // Try to find and click login button
    const loginButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log In")').all();
    if (loginButtons.length > 0) {
      await loginButtons[0].click();
    }
    
    // Wait for navigation
    await page.waitForNavigation({ timeout: 5000 }).catch(() => null);
    await page.waitForLoadState('networkidle').catch(() => null);
    
    await page.close();
  });

  test('Collect missing translations from admin pages', async () => {
    const page = await context.newPage();
    
    // Set up console message listener
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[MISSING_TRANSLATION]')) {
        console.log(`Found: ${text}`);
        // Extract the key from the log message
        const match = text.match(/\[MISSING_TRANSLATION\].*?(?:en|is)\]\s+(\S+)/);
        if (match) {
          missingTranslations.add(match[1]);
        }
      }
    });

    for (const pageUrl of ADMIN_PAGES) {
      try {
        console.log(`\n📄 Visiting: ${pageUrl}`);
        
        await page.goto(`http://localhost:3001${pageUrl}`, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Wait for page to fully load
        await page.waitForLoadState('domcontentloaded');
        
        // Scroll down to trigger any lazy-loaded content
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        
        // Wait a bit for any deferred loading
        await page.waitForTimeout(1000);
        
        console.log(`✅ Page loaded successfully`);
        
      } catch (error) {
        console.log(`⚠️  Error loading ${pageUrl}: ${error.message}`);
      }
    }

    // Save collected missing translations
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const uniqueMissing = Array.from(missingTranslations).sort();
    fs.writeFileSync(
      path.join(logsDir, 'missing-translations-from-pages.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalMissing: uniqueMissing.length,
        missingKeys: uniqueMissing,
        pagesVisited: ADMIN_PAGES.length,
        pages: ADMIN_PAGES
      }, null, 2)
    );

    console.log(`\n📊 Summary:`);
    console.log(`Total missing translations found: ${uniqueMissing.length}`);
    console.log(`Unique keys: ${uniqueMissing.join(', ').substring(0, 200)}...`);

    await page.close();
  });

  test.afterAll(async () => {
    await context?.close();
  });
});
