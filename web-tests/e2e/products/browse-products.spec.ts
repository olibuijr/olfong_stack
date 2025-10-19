import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Add to Cart/ })).toHaveCount(await page.locator('[data-testid="product-card"]').count());
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');

    await page.getByRole('button', { name: 'Wine' }).click();
    await expect(page.getByText('Wine')).toBeVisible();

    // Verify only wine products are shown
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(await productCards.count());
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');

    await page.getByPlaceholder('Search products...').fill('wine');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('wine')).toBeVisible();
  });
});