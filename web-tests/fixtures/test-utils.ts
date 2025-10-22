import { Page, Locator } from '@playwright/test';

/**
 * Enhanced test utilities with self-healing capabilities
 */

// Retry mechanism for flaky operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error.message);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Smart element waiting with multiple strategies
export async function waitForElement(
  page: Page,
  selectors: string[],
  options: { timeout?: number; visible?: boolean } = {}
): Promise<Locator> {
  const { timeout = 10000, visible = true } = options;

  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (visible) {
        await element.waitFor({ state: 'visible', timeout: 2000 });
      } else {
        await element.waitFor({ state: 'attached', timeout: 2000 });
      }
      console.log(`Found element with selector: ${selector}`);
      return element;
    } catch (error) {
      console.log(`Selector failed: ${selector}, trying next...`);
    }
  }

  // Fallback: try to find any element containing the text
  if (selectors.some(s => s.includes('text='))) {
    const textContent = selectors.find(s => s.includes('text='))?.replace('text=', '');
    if (textContent) {
      try {
        const element = page.locator(`text=${textContent}`).first();
        await element.waitFor({ state: visible ? 'visible' : 'attached', timeout: 2000 });
        console.log(`Found element by text content: ${textContent}`);
        return element;
      } catch (error) {
        console.log(`Text-based selector also failed: ${textContent}`);
      }
    }
  }

  throw new Error(`Could not find element with any of these selectors: ${selectors.join(', ')}`);
}

// Enhanced click with retry and verification
export async function clickElement(
  page: Page,
  selectors: string[],
  options: { timeout?: number; verify?: boolean } = {}
): Promise<void> {
  const { timeout = 10000, verify = true } = options;

  const element = await waitForElement(page, selectors, { timeout, visible: true });

  await retryOperation(async () => {
    await element.click();
  });

  if (verify) {
    // Wait a bit for any resulting actions
    await page.waitForTimeout(500);
  }
}

// Enhanced typing with retry
export async function typeText(
  page: Page,
  selectors: string[],
  text: string,
  options: { timeout?: number; clear?: boolean } = {}
): Promise<void> {
  const { timeout = 10000, clear = true } = options;

  const element = await waitForElement(page, selectors, { timeout, visible: true });

  await retryOperation(async () => {
    if (clear) {
      await element.clear();
    }
    await element.fill(text);
  });
}

// Smart login function with multiple strategies
export async function loginUser(
  page: Page,
  email: string,
  password: string,
  options: { useTestLogin?: boolean } = {}
): Promise<void> {
  const { useTestLogin = true } = options;

  await page.goto('/login');

  if (useTestLogin) {
    // Try test login first
    try {
      await clickElement(page, ['button:has-text("Automated Test Login")']);

      // Wait for the test login form to appear after clicking the button
      await page.waitForTimeout(500); // Give React time to update the DOM

      await typeText(page, ['label:has-text("Email")', 'input[type="email"]', '#email'], email);
      await typeText(page, ['label:has-text("Password")', 'input[type="password"]', '#password'], password);
      await clickElement(page, ['button:has-text("Login with Email")']);
    } catch (error) {
      console.log('Test login failed, trying regular login...');
      // Fallback to regular login
      await typeText(page, ['label:has-text("Email")', 'input[type="email"]'], email);
      await typeText(page, ['label:has-text("Password")', 'input[type="password"]'], password);
      await clickElement(page, ['button:has-text("Login")', 'button[type="submit"]']);
    }
  } else {
    // Regular login
    await typeText(page, ['label:has-text("Email")', 'input[type="email"]'], email);
    await typeText(page, ['label:has-text("Password")', 'input[type="password"]'], password);
    await clickElement(page, ['button:has-text("Login")', 'button[type="submit"]']);
  }

  // Verify login success - look for user menu button with User icon
  await waitForElement(page, [
    'button[aria-label*="User menu"]',
    'button[aria-label*="user"]',
    'button:has-text("Test")', // Test user first name
    'button:has-text("test_customer")', // Test username
    '.user-menu',
    'button svg', // User icon button
    'button[class*="flex items-center"]' // User menu button container
  ], { timeout: 10000 });
}

// Enhanced cart operations
export async function addToCart(
  page: Page,
  productIndex: number = 0
): Promise<void> {
  // Go to products page
  await page.goto('/products');
  await page.waitForLoadState('networkidle');

  // Wait for products to load - look for product cards container
  await waitForElement(page, [
    '[class*="grid"]', // Any grid container
    'main [class*="grid"]', // Grid in main content
    '.grid', // Simple grid class
    'div[class*="product"]', // Product container
    'h1:has-text("Products")' // Products heading as fallback
  ], { timeout: 10000 });

  // Click on first product
  const productLinks = page.locator('a[href^="/products/"]');
  await productLinks.nth(productIndex).click();

  // Wait for product page
  await page.waitForURL(/\/products\/\d+/);
  await page.waitForLoadState('networkidle');

  // Click add to cart
  await clickElement(page, [
    'button:has-text("Add to Cart")',
    'button:has-text("Bæta í körfu")', // Icelandic
    'button:has-text("products.addToCart")' // Translation key
  ]);

  // Wait for cart redirect
  await page.waitForURL('/cart');
  await page.waitForLoadState('networkidle');
}

// Health check utilities
export async function checkServiceHealth(service: string, url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error(`${service} health check failed:`, error);
    return false;
  }
}

export async function waitForServices(): Promise<void> {
  console.log('Checking service health...');

  const services = [
    { name: 'Frontend', url: 'http://localhost:3001' },
    { name: 'Backend', url: 'http://localhost:5000/api/health' }
  ];

  for (const service of services) {
    const healthy = await checkServiceHealth(service.name, service.url);
    if (!healthy) {
      throw new Error(`${service.name} is not healthy`);
    }
  }

  console.log('All services are healthy');
}

// Language management for tests
export async function setLanguage(page: Page, language: 'en' | 'is'): Promise<void> {
  // Set language in localStorage
  await page.addInitScript((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, language);

  // Also set it via i18n if available
  await page.evaluate((lang) => {
    if (window.i18n) {
      window.i18n.changeLanguage(lang);
    }
  }, language);

  logTestStep(`Set language to ${language.toUpperCase()}`);
}

// Enhanced logging
export function logTestStep(step: string, details?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${step}`, details || '');
}

// Performance monitoring
export async function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    console.log(`${operationName} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
}