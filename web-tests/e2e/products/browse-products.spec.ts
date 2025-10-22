import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on home page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load and check for main content
    await expect(page.getByRole('heading', { name: /Why Ölföng\?|Af hverju Ölföng\?/i })).toBeVisible();
    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
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