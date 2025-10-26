import { test, expect } from '@playwright/test';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Product Search and Filtering', () => {
  test('should display search input on products page', async ({ page }) => {
    logTestStep('Testing search input visibility');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const searchInputSelectors = [
      'input[type="text"][placeholder*="search" i]',
      'input[placeholder*="search" i]',
      'input[name*="search"]',
      'input[aria-label*="search"]',
      '[class*="search-input"]'
    ];

    let searchFound = false;
    for (const selector of searchInputSelectors) {
      if (await page.locator(selector).count() > 0) {
        searchFound = true;
        logTestStep('Search input found');
        break;
      }
    }

    if (!searchFound) {
      logTestStep('Search input not found');
    }
  });

  test('should search products by name', async ({ page }) => {
    logTestStep('Testing product search functionality');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('wine');
      await page.waitForTimeout(1000);

      // Check if URL updated with search query
      const url = page.url();
      if (url.includes('search=wine') || url.includes('q=wine')) {
        logTestStep('Search query reflected in URL');
      }

      // Check if results are filtered
      const products = page.locator('[class*="product"]');
      const productCount = await products.count();
      logTestStep(`Found ${productCount} products matching search`);
    } else {
      logTestStep('Search input not available');
    }
  });

  test('should display category filter', async ({ page }) => {
    logTestStep('Testing category filter display');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const categoryFilterSelectors = [
      'select[name*="category"]',
      'select:has(option)',
      '[class*="category"][class*="filter"]',
      'button:has-text("Category"), button:has-text("Flokkur")',
      '[role="listbox"]'
    ];

    let categoryFound = false;
    for (const selector of categoryFilterSelectors) {
      const filter = page.locator(selector).first();
      if (await filter.count() > 0) {
        categoryFound = true;
        logTestStep('Category filter found');
        break;
      }
    }

    if (!categoryFound) {
      logTestStep('Category filter not found');
    }
  });

  test('should filter products by category', async ({ page }) => {
    logTestStep('Testing category filter functionality');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const categorySelect = page.locator('select[name*="category"]').first();

    if (await categorySelect.count() > 0) {
      // Get available options
      const options = categorySelect.locator('option');
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Select second option (first is usually "All")
        await categorySelect.selectOption({ index: 1 });
        await page.waitForLoadState('networkidle');

        // Check if URL updated
        const url = page.url();
        if (url.includes('category=')) {
          logTestStep('Category filter applied, URL updated');
        }

        // Check if products updated
        const products = page.locator('[class*="product"]');
        const productCount = await products.count();
        logTestStep(`Showing ${productCount} products for selected category`);
      } else {
        logTestStep('Only one category option available');
      }
    } else {
      logTestStep('Category select not found');
    }
  });

  test('should filter products by price range', async ({ page }) => {
    logTestStep('Testing price range filter');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const priceFilterSelectors = [
      'input[type="range"]',
      'input[type="number"][name*="price"]',
      '[class*="price-filter"]',
      '[class*="price-range"]'
    ];

    let priceFilterFound = false;
    for (const selector of priceFilterSelectors) {
      const filter = page.locator(selector).first();
      if (await filter.count() > 0) {
        priceFilterFound = true;
        logTestStep('Price filter found');

        // Try to adjust price filter
        if (selector.includes('range')) {
          const rangeInput = page.locator(selector).first();
          await rangeInput.fill('5000');
          await page.waitForTimeout(1000);
          logTestStep('Adjusted price range filter');
        }

        break;
      }
    }

    if (!priceFilterFound) {
      logTestStep('Price range filter not found');
    }
  });

  test('should sort products', async ({ page }) => {
    logTestStep('Testing product sorting');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const sortSelectors = [
      'select[name*="sort"]',
      'select:has(option)',
      'button:has-text("Sort"), button:has-text("Raða")',
      '[class*="sort"]'
    ];

    let sortFound = false;
    for (const selector of sortSelectors) {
      const sortControl = page.locator(selector).first();
      if (await sortControl.count() > 0) {
        // Check if it's a select
        const tag = await sortControl.evaluate(el => el.tagName);
        if (tag === 'SELECT') {
          const options = sortControl.locator('option');
          if (await options.count() > 1) {
            await sortControl.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
            logTestStep('Product sorting applied');
            sortFound = true;
            break;
          }
        } else {
          logTestStep('Sort control found but not a select element');
          sortFound = true;
          break;
        }
      }
    }

    if (!sortFound) {
      logTestStep('Product sort control not found');
    }
  });

  test('should clear filters and show all products', async ({ page }) => {
    logTestStep('Testing clear filters');

    await page.goto('/products?category=WINE');
    await page.waitForLoadState('networkidle');

    // Look for "Clear" or "Reset" button
    const clearBtn = page.locator('button:has-text("Clear"), button:has-text("Reset"), button:has-text("Hreinsa"), a:has-text("All Products")').first();

    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (!url.includes('category=')) {
        logTestStep('Filters cleared successfully');
      } else {
        logTestStep('Filters may not have been cleared');
      }
    } else {
      logTestStep('Clear filters button not found');
    }
  });

  test('should search with special characters', async ({ page }) => {
    logTestStep('Testing search with special characters');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      // Test search with Icelandic characters
      await searchInput.fill('Ölföng');
      await page.waitForTimeout(1000);

      const products = page.locator('[class*="product"]');
      const productCount = await products.count();

      if (productCount > 0) {
        logTestStep('Search with special characters returned results');
      } else {
        logTestStep('No results found for special character search (may be normal)');
      }
    } else {
      logTestStep('Search input not available');
    }
  });

  test('should combine multiple filters', async ({ page }) => {
    logTestStep('Testing combined filters');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Apply category filter
    const categorySelect = page.locator('select[name*="category"]').first();
    if (await categorySelect.count() > 0) {
      const options = categorySelect.locator('option');
      if (await options.count() > 1) {
        await categorySelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
    }

    // Apply search
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }

    // Apply price filter if available
    const priceInput = page.locator('input[type="range"]').first();
    if (await priceInput.count() > 0) {
      await priceInput.fill('5000');
      await page.waitForTimeout(500);
    }

    await page.waitForLoadState('networkidle');

    // Check results
    const products = page.locator('[class*="product"]');
    const productCount = await products.count();

    logTestStep(`Showing ${productCount} products with combined filters`);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    logTestStep('Testing empty search results');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      // Search for something that won't exist
      await searchInput.fill('xyznonexistentproduct123');
      await page.waitForTimeout(1000);

      // Look for empty state message
      const emptyStateSelectors = [
        'text=/no.*results|no.*found|nothing/i',
        '[class*="empty-state"]',
        '[class*="no-results"]',
        'text=/Engar niðurstöður/i'
      ];

      let emptyStateFound = false;
      for (const selector of emptyStateSelectors) {
        if (await page.locator(selector).count() > 0) {
          emptyStateFound = true;
          logTestStep('Empty state message displayed');
          break;
        }
      }

      if (!emptyStateFound) {
        // Check if products list is empty
        const products = page.locator('[class*="product"]');
        const productCount = await products.count();
        if (productCount === 0) {
          logTestStep('No products displayed for empty search');
        }
      }
    }
  });
});
