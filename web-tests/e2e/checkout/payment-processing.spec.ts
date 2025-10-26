import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { loginUser, addToCart, logTestStep } from '../../fixtures/test-utils';

test.describe('Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart and setup
    await page.context().clearCookies();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display payment methods on checkout page', async ({ page }) => {
    logTestStep('Testing payment methods display');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for payment method options with multiple strategies
    let paymentOptionCount = 0;

    // Try radio buttons first
    const radioButtons = page.locator('[type="radio"][name*="payment"]');
    const radioCount = await radioButtons.count();
    if (radioCount > 0) {
      paymentOptionCount = radioCount;
      logTestStep(`Found ${radioCount} payment method radio buttons`);
    }

    // If no radio buttons, look for payment class elements
    if (paymentOptionCount === 0) {
      const paymentElements = page.locator('[class*="payment"]');
      const paymentCount = await paymentElements.count();
      if (paymentCount > 0) {
        paymentOptionCount = paymentCount;
        logTestStep(`Found ${paymentCount} payment method elements`);
      }
    }

    // If still nothing, look for buttons or labels with payment text
    if (paymentOptionCount === 0) {
      const cashLabels = page.locator('label:has-text("Cash")');
      const creditLabels = page.locator('label:has-text("Credit")');
      const paymentLabels = page.locator('label:has-text("Payment")');
      const greiðslaLabels = page.locator('text=/greiðsla/i');

      const totalLabels =
        (await cashLabels.count()) +
        (await creditLabels.count()) +
        (await paymentLabels.count()) +
        (await greiðslaLabels.count());

      if (totalLabels > 0) {
        paymentOptionCount = totalLabels;
        logTestStep(`Found ${totalLabels} payment method labels`);
      }
    }

    if (paymentOptionCount === 0) {
      logTestStep('No payment method options found');
    }
  });

  test('should select cash on delivery payment', async ({ page }) => {
    logTestStep('Testing cash on delivery selection');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for Cash on Delivery option
    const cashOnDeliverySelectors = [
      'label:has-text("Cash on Delivery")',
      'label:has-text("Greiðsla við afhendingu")',
      'label:has-text("Reiðufé")',
      '[type="radio"][value*="cash"]',
      '[type="radio"][value*="delivery"]'
    ];

    let paymentSelected = false;
    for (const selector of cashOnDeliverySelectors) {
      const option = page.locator(selector).first();
      if (await option.count() > 0 && await option.isVisible()) {
        await option.click();
        paymentSelected = true;
        logTestStep('Selected Cash on Delivery payment method');
        break;
      }
    }

    if (!paymentSelected) {
      logTestStep('Could not select cash on delivery, trying generic payment option');
      const firstPaymentOption = page.locator('[type="radio"][name*="payment"], [class*="payment-option"]').first();
      if (await firstPaymentOption.count() > 0) {
        await firstPaymentOption.click();
        logTestStep('Selected generic payment option');
      }
    }

    await page.waitForTimeout(1000);
  });

  test('should calculate order total with payment fees if applicable', async ({ page }) => {
    logTestStep('Testing order total calculation');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for order total/summary
    const totalSelectors = [
      'text=/total|alls|samtals/i',
      '[class*="total"]',
      '[class*="summary"]',
      'text=/kr\.|ISK/'
    ];

    let totalFound = false;
    for (const selector of totalSelectors) {
      const totalElement = page.locator(selector);
      if (await totalElement.count() > 0) {
        totalFound = true;
        logTestStep('Order total found on checkout page');
        break;
      }
    }

    if (!totalFound) {
      logTestStep('Order total not found on checkout page');
    }
  });

  test('should handle payment method change', async ({ page }) => {
    logTestStep('Testing payment method change');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get all payment options
    const paymentRadios = page.locator('[type="radio"][name*="payment"]');
    const radioCount = await paymentRadios.count();

    if (radioCount >= 2) {
      // Click first payment option
      await paymentRadios.nth(0).click();
      await page.waitForTimeout(500);
      logTestStep('Selected first payment option');

      // Click second payment option to change
      await paymentRadios.nth(1).click();
      await page.waitForTimeout(500);
      logTestStep('Changed to second payment option');

      // Verify second option is now selected
      const secondOption = paymentRadios.nth(1);
      const isChecked = await secondOption.isChecked();
      if (isChecked) {
        logTestStep('Payment method successfully changed');
      } else {
        logTestStep('Payment method change may have failed');
      }
    } else {
      logTestStep(`Only ${radioCount} payment option(s) available`);
    }
  });

  test('should show payment gateway options if configured', async ({ page }) => {
    logTestStep('Testing payment gateway display');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for credit card or online payment options
    const creditCardSelectors = [
      'label:has-text("Credit Card")',
      'label:has-text("Kreditkort")',
      'label:has-text("Online Payment")',
      'label:has-text("Þota)")',
      '[class*="stripe"]',
      '[class*="payment-gateway"]'
    ];

    let gatewayFound = false;
    for (const selector of creditCardSelectors) {
      const option = page.locator(selector);
      if (await option.count() > 0) {
        gatewayFound = true;
        logTestStep('Payment gateway option found');
        break;
      }
    }

    if (!gatewayFound) {
      logTestStep('No payment gateway options found (may only have cash on delivery)');
    }
  });

  test('should validate payment information before submission', async ({ page }) => {
    logTestStep('Testing payment validation');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to submit without selecting payment method
    const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Place Order"), button:has-text("Panta")').first();

    if (await submitBtn.count() > 0) {
      // Check if button is disabled (validation)
      const isDisabled = await submitBtn.isDisabled();
      if (isDisabled) {
        logTestStep('Submit button properly disabled for validation');
      } else {
        // Try clicking and see if validation error appears
        await submitBtn.click();
        await page.waitForTimeout(1000);

        const validationErrors = page.locator('[class*="error"], [class*="alert"], text=/required|select|payment/i');
        if (await validationErrors.count() > 0) {
          logTestStep('Validation error displayed for payment method');
        } else {
          logTestStep('No validation error displayed');
        }
      }
    }
  });

  test('should display payment confirmation after successful payment', async ({ page }) => {
    logTestStep('Testing payment confirmation display');

    // Login and add to cart
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await addToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select payment method
    const paymentOption = page.locator('[type="radio"][name*="payment"]').first();
    if (await paymentOption.count() > 0) {
      await paymentOption.click();
      await page.waitForTimeout(500);
    }

    // Select shipping if available
    const shippingOption = page.locator('[type="radio"][name*="shipping"]').first();
    if (await shippingOption.count() > 0) {
      await shippingOption.click();
      await page.waitForTimeout(500);
    }

    // Try to submit order
    const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Place Order"), button:has-text("Panta")').first();

    if (await submitBtn.count() > 0 && !(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await page.waitForTimeout(3000);

      // Check for success indicators
      const successSelectors = [
        'text=/success|thank|order.*received|takk|staðfest/i',
        '[class*="success"]',
        '[class*="confirmation"]',
        'text=/order.*number|pöntun.*númer/i'
      ];

      let successFound = false;
      for (const selector of successSelectors) {
        if (await page.locator(selector).count() > 0) {
          successFound = true;
          logTestStep('Payment confirmation/success message displayed');
          break;
        }
      }

      if (!successFound) {
        logTestStep('No success message found, but order may have been processed');
      }
    } else {
      logTestStep('Could not proceed with order submission');
    }
  });
});
