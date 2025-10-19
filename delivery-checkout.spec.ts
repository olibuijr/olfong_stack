import { test, expect } from '@playwright/test';
import { testUsers, testAddresses } from '../../fixtures/test-data';

test.describe('Delivery Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Login and add item to cart
    await page.goto('/login');
    await page.getByLabel('Email').fill(testUsers.customer.email);
    await page.getByLabel('Password').fill(testUsers.customer.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'Cart' }).click();
  });

  test('should complete delivery checkout', async ({ page }) => {
    await page.getByRole('button', { name: 'Checkout' }).click();

    // Address selection
    await page.getByRole('button', { name: 'Add New Address' }).click();
    await page.getByLabel('Label').fill(testAddresses.home.label);
    await page.getByLabel('Street').fill(testAddresses.home.street);
    await page.getByLabel('City').fill(testAddresses.home.city);
    await page.getByLabel('Postal Code').fill(testAddresses.home.postalCode);
    await page.getByRole('button', { name: 'Save Address' }).click();

    // Select delivery option
    await page.getByRole('radio', { name: 'Home Delivery' }).check();

    // Payment
    await page.getByRole('button', { name: 'Proceed to Payment' }).click();
    await expect(page.getByText('Payment processing...')).toBeVisible();

    // Verify order completion
    await expect(page.getByText('Order placed successfully')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
  });
});