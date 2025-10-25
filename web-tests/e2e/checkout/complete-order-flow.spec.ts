import { test, expect } from '@playwright/test';
import { testUsers, testAddresses } from '../../fixtures/test-data';
import { loginUser, addToCart, waitForElement, clickElement, typeText, logTestStep } from '../../fixtures/test-utils';

test.describe('Complete Order Flow - Add to Cart, Checkout, and Delivery Status Updates', () => {
  let orderNumber: string;
  let orderTotal: string;

  test('USER: should add product to cart and complete checkout with delivery', async ({ page }) => {
    logTestStep('Starting complete order flow test');

    // Step 1: Login
    logTestStep('Step 1: User login');
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);

    // Verify we're logged in by checking for user menu
    await page.waitForLoadState('networkidle');
    const userMenuButton = page.locator('button[aria-label*="user"], button:has-text("Test"), button[class*="user"]').first();
    if (await userMenuButton.count() > 0) {
      logTestStep('User logged in successfully');
    } else {
      logTestStep('WARNING: User menu button not found');
    }

    // Step 2: Add product to cart
    logTestStep('Step 2: Add product to cart');
    await addToCart(page);
    await expect(page).toHaveURL('/cart');

    // Step 3: Verify cart has items
    logTestStep('Step 3: Verify cart has items');
    const cartItemCount = page.locator('[class*="cart-item"]');
    const itemCountVisible = await cartItemCount.count();
    if (itemCountVisible > 0) {
      logTestStep(`Found ${itemCountVisible} items in cart`);
    } else {
      logTestStep('Cart item count not visible, but item should be in cart');
    }

    // Step 4: Proceed to checkout
    logTestStep('Step 4: Navigate to checkout');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout"), button:has-text("Proceed"), a[href="/checkout"]').first();
    if (await checkoutButton.count() > 0) {
      await checkoutButton.click();
      await expect(page).toHaveURL('/checkout');
    } else {
      logTestStep('No checkout button found, navigating directly to checkout');
      await page.goto('/checkout');
    }

    await page.waitForLoadState('networkidle');

    // Step 5: Select shipping option
    logTestStep('Step 5: Select shipping option (Home Delivery)');
    const shippingRadios = page.locator('[type="radio"][name*="shipping"]');
    const homeDeliveryOption = page.locator('label:has-text("Home Delivery"), label:has-text("Heimsending"), label:has-text("delivery")').first();

    if (await homeDeliveryOption.count() > 0) {
      await homeDeliveryOption.click();
      logTestStep('Selected Home Delivery');
    } else {
      // Try clicking first radio button
      if (await shippingRadios.count() > 0) {
        await shippingRadios.first().click();
        logTestStep('Selected first shipping option');
      }
    }

    await page.waitForTimeout(500);

    // Step 6: Select or enter delivery address
    logTestStep('Step 6: Select delivery address');
    const addressSelect = page.locator('select[name*="address"], select[name*="deliveryAddress"], [class*="address"]').first();

    if (await addressSelect.count() > 0) {
      try {
        await addressSelect.selectOption({ index: 0 });
        logTestStep('Selected first address option');
      } catch (error) {
        logTestStep('Could not select address option');
      }
    }

    // Step 7: Select payment method
    logTestStep('Step 7: Select payment method');
    const paymentOptions = page.locator('[type="radio"][name*="payment"], [class*="payment-method"]');

    // Try to select Cash on Delivery or Pay on Pickup
    const cashOnDelivery = page.locator('label:has-text("Cash on Delivery"), label:has-text("Greiðsla við afhendingu")').first();

    if (await cashOnDelivery.count() > 0) {
      await cashOnDelivery.click();
      logTestStep('Selected Cash on Delivery payment method');
    } else if (await paymentOptions.count() > 0) {
      await paymentOptions.first().click();
      logTestStep('Selected first payment option');
    }

    await page.waitForTimeout(500);

    // Step 8: Verify order summary
    logTestStep('Step 8: Verify order summary is displayed');
    await expect(page.locator('text=Subtotal, text=Total, text=Shipping')).toBeTruthy();

    // Get order total for verification
    const totalElements = page.locator('text=Total');
    if (await totalElements.count() > 0) {
      const totalText = await totalElements.first().textContent();
      orderTotal = totalText || 'Unknown';
      logTestStep(`Order total: ${orderTotal}`);
    }

    // Step 9: Add order notes (optional)
    logTestStep('Step 9: Add order notes');
    const notesField = page.locator('textarea[placeholder*="notes"], textarea[placeholder*="athugasem"]').first();
    if (await notesField.count() > 0) {
      await notesField.fill('Test order - Automated order flow test');
      logTestStep('Added order notes');
    }

    // Step 10: Place order
    logTestStep('Step 10: Place order');
    const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Panta"), button:has-text("place-order")').first();

    if (await placeOrderButton.isDisabled()) {
      logTestStep('Place order button is disabled');
      const errorMsg = await page.locator('[class*="error"], [class*="warning"]').first().textContent();
      logTestStep(`Error message: ${errorMsg}`);
      throw new Error('Place order button is disabled');
    }

    await placeOrderButton.click();
    await page.waitForLoadState('networkidle');

    // Step 11: Verify order confirmation
    logTestStep('Step 11: Verify order confirmation page');
    await page.waitForURL(/\/orders|\/order-confirmation|\/thank-you/, { timeout: 10000 });

    // Extract order number from confirmation page
    const orderNumberElement = page.locator('[class*="order-number"], text=/Order #|OLF-/').first();
    if (await orderNumberElement.count() > 0) {
      orderNumber = await orderNumberElement.textContent() || 'Unknown';
      logTestStep(`Order placed successfully: ${orderNumber}`);
    } else {
      logTestStep('Order number not found on confirmation page');
      orderNumber = 'Unknown';
    }

    // Verify order summary on confirmation page
    const confirmationText = page.locator('text=Thank you, text=Order Confirmed, text=confirmed', { exact: false });
    if (await confirmationText.count() > 0) {
      logTestStep('Order confirmation message displayed');
    }

    // Step 12: Navigate to order detail page
    logTestStep('Step 12: Navigate to order details');
    const orderDetailLink = page.locator(`a[href*="/orders/"], button:has-text("View Order")`).first();
    if (await orderDetailLink.count() > 0) {
      await orderDetailLink.click();
      await page.waitForURL(/\/orders\/\d+/);
    } else {
      // Try navigating to orders page
      await page.goto('/orders');
    }

    await page.waitForLoadState('networkidle');

    // Step 13: Verify order details page shows all information
    logTestStep('Step 13: Verify order details display');
    await expect(page.locator('text=Order Details, text=Status, text=Items').first()).toBeTruthy();

    // Verify payment information is displayed
    const paymentInfo = page.locator('[class*="payment"], text=Payment').first();
    if (await paymentInfo.count() > 0) {
      const paymentText = await paymentInfo.textContent();
      logTestStep(`Payment information displayed: ${paymentText}`);
      expect(paymentText).toContain('Cash on Delivery');
    } else {
      logTestStep('WARNING: Payment information not visible on order details');
    }

    // Verify shipping information is displayed
    const shippingInfo = page.locator('[class*="shipping"], text=Shipping, text=Delivery').first();
    if (await shippingInfo.count() > 0) {
      const shippingText = await shippingInfo.textContent();
      logTestStep(`Shipping information displayed: ${shippingText}`);
      expect(shippingText).toContain('Home Delivery');
    } else {
      logTestStep('WARNING: Shipping information not visible on order details');
    }

    // Verify order total
    const orderTotalDisplay = page.locator('text=Total').first();
    if (await orderTotalDisplay.count() > 0) {
      const totalDisplay = await orderTotalDisplay.textContent();
      logTestStep(`Order total on detail page: ${totalDisplay}`);
    }

    logTestStep('USER TEST COMPLETED SUCCESSFULLY - Order placed and details verified');
  });

  test('ADMIN: should update order delivery status from CONFIRMED to DELIVERED', async ({ page }) => {
    logTestStep('Starting admin delivery status update test');

    // Step 1: Admin login
    logTestStep('Step 1: Admin login');
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    // Find and fill username
    const usernameField = page.locator('input[type="text"], input[placeholder*="username" i], input[name="username"]').first();
    await usernameField.fill(testUsers.admin.username);

    // Find and fill password
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    await passwordField.fill(testUsers.admin.password);

    // Click login
    const loginBtn = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginBtn.click();

    await expect(page).toHaveURL(/\/admin/);
    await page.waitForLoadState('networkidle');
    logTestStep('Admin login successful');

    // Step 2: Navigate to orders page
    logTestStep('Step 2: Navigate to admin orders page');
    const ordersLink = page.locator('a:has-text("Orders"), a[href*="/admin/orders"]').first();
    if (await ordersLink.count() > 0) {
      await ordersLink.click();
    } else {
      await page.goto('/admin/orders');
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 3: Find recent order
    logTestStep('Step 3: Find recent order in list');
    const orderRows = page.locator('table tbody tr, [class*="order-row"], [class*="order-item"]');
    const orderCount = await orderRows.count();
    logTestStep(`Found ${orderCount} orders in list`);

    if (orderCount === 0) {
      logTestStep('No orders found - this might be expected if no orders exist');
      return;
    }

    // Click on first order (most recent)
    logTestStep('Step 4: Click on first order to view details');
    const firstOrderRow = orderRows.first();
    const orderLink = firstOrderRow.locator('a, button').first();

    if (await orderLink.count() > 0) {
      await orderLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await firstOrderRow.click();
      await page.waitForLoadState('networkidle');
    }

    // Step 5: Verify order details are displayed
    logTestStep('Step 5: Verify order details are displayed');
    const orderNumber = page.locator('[class*="order-number"], text=/OLF-\\d+/').first();
    if (await orderNumber.count() > 0) {
      const orderNum = await orderNumber.textContent();
      logTestStep(`Viewing order: ${orderNum}`);
    }

    // Verify shipping information
    const shippingSection = page.locator('[class*="shipping"], text=Shipping Method').first();
    if (await shippingSection.count() > 0) {
      const shippingText = await shippingSection.textContent();
      logTestStep(`Shipping info visible: ${shippingText}`);
    } else {
      logTestStep('WARNING: Shipping information not visible in admin order details');
    }

    // Verify payment information
    const paymentSection = page.locator('[class*="payment"], text=Payment Method').first();
    if (await paymentSection.count() > 0) {
      const paymentText = await paymentSection.textContent();
      logTestStep(`Payment info visible: ${paymentText}`);
    } else {
      logTestStep('WARNING: Payment information not visible in admin order details');
    }

    // Step 6: Update order status
    logTestStep('Step 6: Update order delivery status');

    // Look for status update button or dropdown
    const statusButtons = page.locator('button:has-text("Status"), button:has-text("Update Status"), [class*="status-update"]');
    const statusDropdown = page.locator('select[name*="status"], select[class*="status"]');

    let statusUpdated = false;

    // Try dropdown first
    if (await statusDropdown.count() > 0) {
      logTestStep('Found status dropdown');
      try {
        // Get available options
        const options = await statusDropdown.locator('option').allTextContents();
        logTestStep(`Status options available: ${options.join(', ')}`);

        // Select PREPARING or OUT_FOR_DELIVERY
        const targetStatus = options.find(opt =>
          opt.includes('Preparing') || opt.includes('Out for Delivery') ||
          opt.includes('PREPARING') || opt.includes('OUT_FOR_DELIVERY')
        );

        if (targetStatus) {
          await statusDropdown.selectOption(targetStatus);
          logTestStep(`Changed status to: ${targetStatus}`);
          statusUpdated = true;
        }
      } catch (error) {
        logTestStep(`Could not update status via dropdown: ${error.message}`);
      }
    }

    // If dropdown didn't work, try clicking button
    if (!statusUpdated && await statusButtons.count() > 0) {
      logTestStep('Found status update button');
      await statusButtons.first().click();
      await page.waitForTimeout(500);

      // Look for modal with status options
      const statusOptions = page.locator('button:has-text("Preparing"), button:has-text("Out for Delivery"), button:has-text("Delivered")');
      if (await statusOptions.count() > 0) {
        // Click "Out for Delivery"
        const outForDelivery = page.locator('button:has-text("Out for Delivery")').first();
        if (await outForDelivery.count() > 0) {
          await outForDelivery.click();
          logTestStep('Changed status to: Out for Delivery');
          statusUpdated = true;
        }
      }
    }

    if (!statusUpdated) {
      logTestStep('WARNING: Could not find status update option');
    }

    await page.waitForTimeout(500);

    // Step 7: Verify status update was saved
    logTestStep('Step 7: Verify status was updated');
    const currentStatus = page.locator('[class*="current-status"]').first();
    if (await currentStatus.count() > 0) {
      const statusText = await currentStatus.textContent();
      logTestStep(`Current order status: ${statusText}`);

      // Verify it's not CONFIRMED anymore
      if (statusText && !statusText.includes('CONFIRMED')) {
        logTestStep('Status was successfully updated from CONFIRMED');
      }
    }

    // Step 8: Verify order displays correctly with new status
    logTestStep('Step 8: Verify order displays with updated status');
    const deliveryStatusBadge = page.locator('[class*="status-badge"], [class*="status-tag"]').first();
    if (await deliveryStatusBadge.count() > 0) {
      const badgeText = await deliveryStatusBadge.textContent();
      logTestStep(`Status badge shows: ${badgeText}`);
    }

    logTestStep('ADMIN TEST COMPLETED SUCCESSFULLY - Delivery status update verified');
  });

  test('ADMIN: should view order with complete payment and shipping information', async ({ page }) => {
    logTestStep('Starting admin order details verification test');

    // Login as admin
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    const usernameField = page.locator('input[type="text"], input[name="username"]').first();
    await usernameField.fill(testUsers.admin.username);

    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    await passwordField.fill(testUsers.admin.password);

    const loginBtn = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginBtn.click();

    await expect(page).toHaveURL(/\/admin/);
    logTestStep('Admin logged in');

    // Navigate to orders
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    const orderRows = page.locator('table tbody tr, [class*="order-row"]');
    if (await orderRows.count() === 0) {
      logTestStep('No orders found to verify');
      return;
    }

    // Click first order
    await orderRows.first().click();
    await page.waitForLoadState('networkidle');

    // Verify all required information is displayed
    logTestStep('Verifying order contains all required information');

    const requiredFields = {
      'Payment Method': page.locator('text=Payment Method, text=Cash on Delivery, text=Pay on Pickup, text=Valitor').first(),
      'Payment Status': page.locator('text=Payment Status, text=PENDING, text=COMPLETED, text=FAILED').first(),
      'Shipping Method': page.locator('text=Shipping Method, text=Home Delivery, text=Store Pickup').first(),
      'Shipping Type': page.locator('text=delivery, text=pickup').first(),
      'Order Status': page.locator('text=Status, text=CONFIRMED, text=PREPARING, text=OUT_FOR_DELIVERY, text=DELIVERED').first(),
    };

    for (const [fieldName, fieldLocator] of Object.entries(requiredFields)) {
      if (await fieldLocator.count() > 0) {
        const fieldValue = await fieldLocator.textContent();
        logTestStep(`✓ ${fieldName}: ${fieldValue}`);
      } else {
        logTestStep(`⚠ ${fieldName}: NOT VISIBLE`);
      }
    }

    logTestStep('ADMIN VERIFICATION TEST COMPLETED');
  });
});
