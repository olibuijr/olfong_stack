import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Shipping Defaults Protection', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up admin login for shipping defaults tests');
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');
    logTestStep('Admin login successful');
  });

  test('should prevent deletion of Home Delivery default option', async ({ page }) => {
    logTestStep('Testing Home Delivery deletion prevention');

    // Navigate to shipping settings
    await page.goto('/admin/settings/shipping');
    await page.waitForLoadState('networkidle');

    // Find Home Delivery option
    const shippingCards = page.locator('[class*="rounded-xl"]');
    const homeDeliveryCard = shippingCards.filter({ hasText: 'Home Delivery' });

    await expect(homeDeliveryCard).toHaveCount(1);

    // Verify no delete button is present for default options
    const deleteButton = homeDeliveryCard.locator('button.p-2.text-gray-400');
    await expect(deleteButton).not.toBeVisible();

    logTestStep('Home Delivery deletion prevention test completed');
  });

  test('should prevent deletion of Store Pickup default option', async ({ page }) => {
    logTestStep('Testing Store Pickup deletion prevention');

    // Navigate to shipping settings
    await page.goto('/admin/settings/shipping');
    await page.waitForLoadState('networkidle');

    // Find Store Pickup option
    const shippingCards = page.locator('[class*="rounded-xl"]');
    const storePickupCard = shippingCards.filter({ hasText: 'Store Pickup' });

    await expect(storePickupCard).toHaveCount(1);

    // Verify no delete button is present for default options
    const deleteButton = storePickupCard.locator('button.p-2.text-gray-400');
    await expect(deleteButton).not.toBeVisible();

    logTestStep('Store Pickup deletion prevention test completed');
  });

  test('should automatically restore disabled default options', async ({ page }) => {
    logTestStep('Testing automatic restoration of disabled defaults');

    // Navigate to shipping settings
    await page.goto('/admin/settings/shipping');
    await page.waitForLoadState('networkidle');

    // Find Home Delivery option
    const shippingCards = page.locator('[class*="rounded-xl"]');
    const homeDeliveryCard = shippingCards.filter({ hasText: 'Home Delivery' });

    // Check initial state (should be enabled)
    const initialStatus = homeDeliveryCard.locator('text=Enabled');
    await expect(initialStatus).toBeVisible();

    // Try to disable it (if toggle is available)
    const toggleButton = homeDeliveryCard.locator('input[type="checkbox"]');
    if (await toggleButton.isVisible()) {
      // If we can toggle it, do so
      await toggleButton.click();

      // Navigate away and come back
      await page.goto('/admin');
      await page.goto('/admin/settings/shipping');
      await page.waitForLoadState('networkidle');

      // Verify it's still enabled (auto-restored)
      const restoredStatus = homeDeliveryCard.locator('text=Enabled');
      await expect(restoredStatus).toBeVisible();
    }

    logTestStep('Default options restoration test completed');
  });

  test('should always show at least default shipping options', async ({ page }) => {
    logTestStep('Testing minimum default options requirement');

    // Navigate to shipping settings
    await page.goto('/admin/settings/shipping');
    await page.waitForLoadState('networkidle');

    // Verify we have at least the default options
    const shippingCards = page.locator('[class*="rounded-xl"]');
    const cardCount = await shippingCards.count();

    expect(cardCount).toBeGreaterThanOrEqual(2);

    // Verify both defaults are present
    const homeDeliveryExists = await shippingCards.filter({ hasText: 'Home Delivery' }).count() > 0;
    const storePickupExists = await shippingCards.filter({ hasText: 'Store Pickup' }).count() > 0;

    expect(homeDeliveryExists).toBe(true);
    expect(storePickupExists).toBe(true);

    logTestStep('Minimum default options test completed');
  });
});