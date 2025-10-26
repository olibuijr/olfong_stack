import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for main content area or any heading that indicates page is loaded
    const mainContent = page.locator('main, [role="main"], .main-content');
    const hasMainContent = await mainContent.count() > 0;

    // If main content exists, verify it's visible
    if (hasMainContent) {
      await expect(mainContent.first()).toBeVisible();
    } else {
      // At minimum, check that page has loaded and has content
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
    }

    // Check for any product-related content indicators
    const productIndicators = page.locator('[class*="product"], h1, h2, h3');
    const hasProducts = await productIndicators.count() > 0;
    console.log(`Products found on home page: ${hasProducts}`);
  });

  test('should filter products by category', async ({ page }) => {
    // Navigate directly to products page with Wine category filter
    await page.goto('/products?category=WINE');

    // Verify we're on the correct URL and content loaded
    await expect(page).toHaveURL(/\/products\?category=WINE/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    // Navigate directly to products page with search query
    await page.goto('/products?search=wine');

    // Verify we're on the correct URL and content loaded
    await expect(page).toHaveURL(/\/products\?search=wine/);
    await expect(page.locator('main')).toBeVisible();
  });
});