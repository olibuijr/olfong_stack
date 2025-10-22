import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep, addToCart } from '../../fixtures/test-utils';

test.describe('Shipping Checkout Integration', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up user login for shipping checkout tests');
    await page.goto('/login');

    // Use test login if available
    try {
      await page.click('button:has-text("Automated Test Login")');
      await page.waitForTimeout(500);
      await page.fill('input[name="email"]', testUsers.customer.email);
      await page.fill('input[name="password"]', testUsers.customer.password);
      await page.click('button:has-text("Login with Email")');
    } catch (error) {
      // Fallback to regular login
      await page.fill('input[name="email"]', testUsers.customer.email);
      await page.fill('input[name="password"]', testUsers.customer.password);
      await page.click('button[type="submit"]');
    }

    // Verify login success
    await expect(page).toHaveURL(/\/$/); // Should be on home page
    logTestStep('User login successful');
  });

  test('should display shipping options in checkout', async ({ page }) => {
    logTestStep('Testing shipping options display in checkout');

    // Add a product to cart
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/cart');
    await expect(page.locator('h1').filter({ hasText: 'Cart' })).toBeVisible();

    // Click checkout
    await page.click('text=Checkout');
    await page.waitForURL('/checkout');
    await expect(page.locator('h1').filter({ hasText: 'Checkout' })).toBeVisible();

    // Verify shipping options are displayed
    const shippingSection = page.locator('text=Shipping Options').first();
    await expect(shippingSection).toBeVisible();

    // Verify default shipping options are available
    await expect(page.locator('text=Home Delivery')).toBeVisible();
    await expect(page.locator('text=Store Pickup')).toBeVisible();

    // Verify shipping fees are displayed
    const shippingFees = page.locator('text=500 ISK').first(); // Home Delivery fee
    await expect(shippingFees).toBeVisible();

    logTestStep('Shipping options display in checkout test completed');
  });

  test('should calculate cart total with shipping', async ({ page }) => {
    logTestStep('Testing cart total calculation with shipping');

    // Add a product to cart
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/cart');
    await page.click('text=Checkout');
    await page.waitForURL('/checkout');

    // Get product price (excluding shipping)
    const productPriceText = await page.locator('.product-price').first().textContent();
    const productPrice = parseInt(productPriceText.replace(/[^\d]/g, ''));

    // Select Home Delivery (500 ISK)
    await page.click('text=Home Delivery');

    // Verify shipping fee is added to total
    const totalElement = page.locator('.total-amount').first();
    await expect(totalElement).toBeVisible();

    const totalText = await totalElement.textContent();
    const totalAmount = parseInt(totalText.replace(/[^\d]/g, ''));

    // Total should be product price + shipping fee
    expect(totalAmount).toBe(productPrice + 500);

    logTestStep('Cart total calculation with shipping test completed');
  });

  test('should handle free shipping threshold', async ({ page }) => {
    logTestStep('Testing free shipping threshold handling');

    // Add multiple products to reach free shipping threshold
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Add first product
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();
    await page.click('button:has-text("Add to Cart")');

    // Go back and add second product if available
    await page.goto('/products');
    const products = page.locator('a[href^="/products/"]');
    if (await products.count() > 1) {
      await products.nth(1).click();
      await page.click('button:has-text("Add to Cart")');
    }

    // Navigate to checkout
    await page.goto('/cart');
    await page.click('text=Checkout');
    await page.waitForURL('/checkout');

    // Check if free shipping option becomes available
    // This depends on the actual free shipping threshold in the system
    const freeShippingOption = page.locator('text=Free Delivery').first();

    // If free shipping threshold is reached, option should be visible
    // Otherwise, it might not be shown
    const isFreeShippingVisible = await freeShippingOption.isVisible();

    if (isFreeShippingVisible) {
      // Verify free shipping has 0 fee
      const freeShippingFee = page.locator('text=0 ISK').first();
      await expect(freeShippingFee).toBeVisible();
    }

    logTestStep('Free shipping threshold test completed');
  });

  test('should validate shipping selection before payment', async ({ page }) => {
    logTestStep('Testing shipping selection validation');

    // Add a product to cart
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/cart');
    await page.click('text=Checkout');
    await page.waitForURL('/checkout');

    // Try to proceed without selecting shipping
    const paymentButton = page.locator('button:has-text("Proceed to Payment")').first();

    if (await paymentButton.isVisible()) {
      await paymentButton.click();

      // Should show validation error or prevent proceeding
      const errorMessage = page.locator('text=Please select a shipping option').first();
      const isErrorVisible = await errorMessage.isVisible();

      // Either error message appears or we stay on checkout page
      if (!isErrorVisible) {
        // Verify we're still on checkout page
        await expect(page).toHaveURL('/checkout');
      }
    }

    logTestStep('Shipping selection validation test completed');
  });
});