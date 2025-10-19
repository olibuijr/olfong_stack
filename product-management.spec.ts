import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');
  });

  test('should create new product', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('button', { name: 'Add Product' }).click();

    await page.getByLabel('Product Name').fill('Test Product');
    await page.getByLabel('Description').fill('Test description');
    await page.getByLabel('Price').fill('1000');
    await page.getByLabel('Stock').fill('50');
    await page.getByRole('combobox', { name: 'Category' }).selectOption('WINE');

    await page.getByRole('button', { name: 'Save Product' }).click();
    await expect(page.getByText('Product created successfully')).toBeVisible();
  });

  test('should edit existing product', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByLabel('Price').fill('1500');
    await page.getByRole('button', { name: 'Update Product' }).click();

    await expect(page.getByText('Product updated successfully')).toBeVisible();
  });
});