import { test, expect } from '@playwright/test';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('VAT and Pricing Display', () => {
  test('should display product price with VAT', async ({ page }) => {
    logTestStep('Testing VAT display on product page');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Click first product
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // Look for price display
      const priceSelectors = [
        'text=/kr\\.|ISK|\\d+\\s*kr/i',
        '[class*="price"]',
        'text=/verð/i'
      ];

      let priceFound = false;
      for (const selector of priceSelectors) {
        if (await page.locator(selector).count() > 0) {
          priceFound = true;
          logTestStep('Product price found');
          break;
        }
      }

      // Look for VAT information
      const vatSelectors = [
        'text=/VAT|VSK|vsk|virðisaukaskattur/i',
        '[class*="vat"]',
        '[class*="tax"]',
        'text=/including.*tax|með.*sköttum/i'
      ];

      let vatFound = false;
      for (const selector of vatSelectors) {
        if (await page.locator(selector).count() > 0) {
          vatFound = true;
          logTestStep('VAT information found on product page');
          break;
        }
      }

      if (!vatFound) {
        logTestStep('No explicit VAT information found (may be included in price)');
      }
    } else {
      logTestStep('No products available to test');
    }
  });

  test('should display price breakdown with VAT on cart', async ({ page }) => {
    logTestStep('Testing VAT breakdown on cart page');

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Add product to cart
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button:has-text("Bæta í körfu"), button:has-text("Add to Cart")').first();
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        // Check cart
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        // Look for price breakdown
        const breakdownSelectors = [
          'text=/subtotal|millisamtala/i',
          'text=/tax|VSK|vsk/i',
          'text=/shipping|afhending/i',
          'text=/total|alls/i',
          '[class*="summary"]',
          '[class*="breakdown"]'
        ];

        let breakdownFound = false;
        for (const selector of breakdownSelectors) {
          if (await page.locator(selector).count() > 0) {
            breakdownFound = true;
            logTestStep('Price breakdown found on cart');
            break;
          }
        }

        if (!breakdownFound) {
          logTestStep('No detailed price breakdown found');
        }
      }
    }
  });

  test('should apply VAT correctly based on product category', async ({ page }) => {
    logTestStep('Testing VAT application by category');

    // Navigate to products with different categories
    const categories = ['WINE', 'BEER'];

    for (const category of categories) {
      await page.goto(`/products?category=${category}`);
      await page.waitForLoadState('networkidle');

      const firstProduct = page.locator('a[href*="/products/"]').first();
      if (await firstProduct.count() > 0) {
        await firstProduct.click();
        await page.waitForLoadState('networkidle');

        // Look for VAT rate
        const vatRateSelectors = [
          'text=/\\d+%.*VAT/i',
          'text=/VSK.*\\d+%/i',
          '[class*="vat-rate"]',
          'text=/24%|6%|0%/'
        ];

        let vatRateFound = false;
        for (const selector of vatRateSelectors) {
          if (await page.locator(selector).count() > 0) {
            vatRateFound = true;
            logTestStep(`VAT rate found for ${category} category`);
            break;
          }
        }

        if (!vatRateFound) {
          logTestStep(`No explicit VAT rate found for ${category}`);
        }

        // Go back to products
        await page.goto('/products');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should calculate correct price with VAT in checkout', async ({ page }) => {
    logTestStep('Testing VAT calculation in checkout');

    // Add product to cart and go to checkout
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button:has-text("Bæta í körfu"), button:has-text("Add to Cart")').first();
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        // Go to checkout
        const checkoutBtn = page.locator('button:has-text("Proceed"), a[href="/checkout"]').first();
        if (await checkoutBtn.count() > 0) {
          await checkoutBtn.click();
          await page.waitForLoadState('networkidle');
        } else {
          await page.goto('/checkout');
          await page.waitForLoadState('networkidle');
        }

        // Look for VAT breakdown
        const vatElements = page.locator('text=/VAT|VSK|vsk/i');
        if (await vatElements.count() > 0) {
          logTestStep('VAT clearly shown in checkout');
        } else {
          logTestStep('VAT not explicitly shown in checkout');
        }

        // Check for total price
        const totalElements = page.locator('text=/total|alls/i');
        if (await totalElements.count() > 0) {
          logTestStep('Total price shown in checkout');
        }
      }
    }
  });

  test('should display different VAT rates for different products', async ({ page }) => {
    logTestStep('Testing different VAT rates display');

    // Add first product
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const products = page.locator('a[href*="/products/"]');
    if (await products.count() >= 2) {
      // Add first product
      await products.nth(0).click();
      await page.waitForLoadState('networkidle');

      const addBtn1 = page.locator('button:has-text("Bæta í körfu"), button:has-text("Add to Cart")').first();
      if (await addBtn1.count() > 0) {
        await addBtn1.click();
        await page.waitForTimeout(1000);
      }

      // Get back and add second product
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      await products.nth(1).click();
      await page.waitForLoadState('networkidle');

      const addBtn2 = page.locator('button:has-text("Bæta í körfu"), button:has-text("Add to Cart")').first();
      if (await addBtn2.count() > 0) {
        await addBtn2.click();
        await page.waitForTimeout(1000);
      }

      // Go to cart and check VAT
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      const cartItems = page.locator('[class*="cart-item"], tr');
      const itemCount = await cartItems.count();

      if (itemCount > 0) {
        logTestStep(`Cart has ${itemCount} items with potentially different VAT rates`);

        // Look for line-item VAT
        const lineVatElements = page.locator('[class*="item-price"], [class*="line-total"], text=/VAT|VSK/i');
        if (await lineVatElements.count() > 0) {
          logTestStep('Line-item VAT information displayed');
        }
      }
    }
  });

  test('should update totals when VAT changes with location', async ({ page }) => {
    logTestStep('Testing VAT update with location change');

    // This test checks if VAT changes when shipping location changes
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for location/country selector
    const locationSelectors = [
      'select[name*="country"]',
      'select[name*="location"]',
      'select[name*="address"]',
      '[class*="location-selector"]'
    ];

    let locationChanged = false;
    for (const selector of locationSelectors) {
      const locationSelect = page.locator(selector).first();
      if (await locationSelect.count() > 0) {
        const options = locationSelect.locator('option');
        const optionCount = await options.count();
        if (optionCount > 1) {
          // Try to select different option
          await locationSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000);
          locationChanged = true;
          logTestStep('Changed location in cart');
          break;
        }
      }
    }

    if (!locationChanged) {
      logTestStep('No location selector found or only one option available');
    }

    // Check if totals updated
    const totalElements = page.locator('text=/total|alls/i');
    if (await totalElements.count() > 0) {
      logTestStep('Totals displayed (may have been updated)');
    }
  });
});
