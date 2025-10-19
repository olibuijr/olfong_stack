import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill(testUsers.customer.email);
    await page.getByLabel('Password').fill(testUsers.customer.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByText('Product added to cart')).toBeVisible();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
  });

  test('should update cart item quantity', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'Cart' }).click();

    // Update quantity
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('3');
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.getByText('Cart updated')).toBeVisible();
    await expect(page.getByText('Quantity: 3')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'Cart' }).click();

    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText('Item removed from cart')).toBeVisible();
    await expect(page.getByTestId('cart-item')).toHaveCount(0);
  });
});