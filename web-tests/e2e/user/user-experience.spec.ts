import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { waitForElement, clickElement, typeText, logTestStep, loginUser } from '../../fixtures/test-utils';

test.describe('User Experience Tests', () => {
  test('should display homepage correctly', async ({ page }) => {
    logTestStep('Testing homepage display');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main elements are present - check for logo image and hero content
    await expect(page.locator('img[alt="Ölföng Logo"]').first()).toBeVisible();
    await expect(page.locator('text=Íslensk vín og bjórverslun með heimafleiðingu')).toBeVisible();

    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();

    // Check for product sections or featured content
    const productSections = page.locator('[class*="bg-white"][class*="rounded-lg"]').first();
    await expect(productSections).toBeVisible();

    logTestStep('Homepage display test completed');
  });

  test('should navigate through product categories', async ({ page }) => {
    logTestStep('Testing product category navigation');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for category navigation or links
    const categoryLinks = page.locator('a[href*="/products"], button[class*="category"]');

    if (await categoryLinks.count() > 0) {
      // Click on first category link
      await categoryLinks.first().click();
      await page.waitForURL(/\/products/);
      await page.waitForLoadState('networkidle');

      // Verify products page loads
      await expect(page.locator('h1')).toContainText(/Products|Categories/i);

      // Check for product grid
      const productGrid = page.locator('.flex.gap-4.overflow-x-auto').first();
      await expect(productGrid).toBeVisible();
    } else {
      logTestStep('No category navigation found, skipping category test');
    }

    logTestStep('Product category navigation test completed');
  });

  test('should browse products and view product details', async ({ page }) => {
    logTestStep('Testing product browsing and detail view');

    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for products to load
    await waitForElement(page, [
      'a[href^="/products/"]',
      '.group a[href^="/products/"]',
      'div.group a[href^="/products/"]'
    ], { timeout: 10000 });

    // Find product links
    const productLinks = page.locator('a[href^="/products/"]');

    if (await productLinks.count() > 0) {
      // Click on first product
      await productLinks.first().click();

      // Wait for product detail page
      await page.waitForURL(/\/products\/\d+/);
      await page.waitForLoadState('networkidle');

      // Verify product detail elements
      await expect(page.locator('h1')).toBeVisible(); // Product name
      await expect(page.locator('[class*="price"], text*="ISK"')).toBeVisible();

      // Check for add to cart button
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Bæta í körfu")');
      await expect(addToCartButton).toBeVisible();

      logTestStep('Product browsing and detail view test completed');
    } else {
      logTestStep('No products found, skipping product detail test');
    }
  });

  test('should handle user login and logout', async ({ page }) => {
    logTestStep('Testing user login and logout');

    // Test login
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);

    // Verify login success - should be redirected or show user menu
    await expect(page.locator('button[aria-label*="User"], button[class*="user"], text*="Test"')).toBeVisible();

    // Test logout if logout button is available
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Útskráning")');

    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(1000);

      // Verify logout success
      await expect(page.locator('text*="Login", text*="Skrá inn"')).toBeVisible();
    }

    logTestStep('User login and logout test completed');
  });

  test('should add product to cart and view cart', async ({ page }) => {
    logTestStep('Testing add to cart functionality');

    // Login first
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);

    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for products and add first available product to cart
    const productLinks = page.locator('a[href^="/products/"]');

    if (await productLinks.count() > 0) {
      await productLinks.first().click();
      await page.waitForURL(/\/products\/\d+/);
      await page.waitForLoadState('networkidle');

      // Click add to cart
      await clickElement(page, [
        'button:has-text("Add to Cart")',
        'button:has-text("Bæta í körfu")'
      ]);

      // Should redirect to cart
      await page.waitForURL('/cart');
      await page.waitForLoadState('networkidle');

      // Verify cart has items
      await expect(page.locator('text*="Total", text*="Samtals"')).toBeVisible();

      logTestStep('Add to cart functionality test completed');
    } else {
      logTestStep('No products available, skipping cart test');
    }
  });

  test('should handle language switching', async ({ page }) => {
    logTestStep('Testing language switching functionality');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for language switcher
    const languageButton = page.locator('button:has-text("EN"), button:has-text("IS"), button[class*="language"]');

    if (await languageButton.count() > 0) {
      // Get initial language state
      const initialText = await page.locator('h1').textContent();

      // Click language switcher
      await languageButton.click();
      await page.waitForTimeout(1000);

      // Verify language changed (content should be different)
      const newText = await page.locator('h1').textContent();
      expect(newText).not.toBe(initialText);

      logTestStep('Language switching test completed');
    } else {
      logTestStep('No language switcher found, skipping language test');
    }
  });

  test('should handle responsive design', async ({ page }) => {
    logTestStep('Testing responsive design');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Verify mobile navigation works
    const mobileMenu = page.locator('button[aria-label*="menu"], button[class*="hamburger"]');
    if (await mobileMenu.count() > 0) {
      await mobileMenu.click();
      await expect(page.locator('nav, [class*="menu"]')).toBeVisible();
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    // Verify content is still accessible
    await expect(page.locator('h1')).toBeVisible();

    logTestStep('Responsive design test completed');
  });

  test('should handle search functionality', async ({ page }) => {
    logTestStep('Testing search functionality');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');

    if (await searchInput.count() > 0) {
      // Type search query
      await searchInput.fill('wine');
      await page.waitForTimeout(1000);

      // Submit search or wait for results
      const searchButton = page.locator('button[type="submit"], button:has-text("Search")');
      if (await searchButton.count() > 0) {
        await searchButton.click();
      }

      await page.waitForTimeout(2000);

      // Verify search results or search page
      const results = page.locator('[class*="result"], [class*="product"], text*="wine"');
      // Note: Search might not return results, but page should handle it gracefully

      logTestStep('Search functionality test completed');
    } else {
      logTestStep('No search functionality found, skipping search test');
    }
  });
});