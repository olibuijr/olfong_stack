import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';

test.describe('Customer Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill(testUsers.customer.email);
    await page.getByLabel('Password').fill(testUsers.customer.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should redirect authenticated users', async ({ page, context }) => {
    // Set auth cookie
    await context.addCookies([{
      name: 'token',
      value: 'valid-jwt-token',
      url: 'http://localhost:3001',
    }]);

    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});