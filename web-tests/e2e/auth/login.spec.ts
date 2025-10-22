import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { loginUser } from '../../fixtures/test-utils';

test.describe('Customer Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);

    await expect(page).toHaveURL('/');
    // Verify user is logged in by checking the user menu is visible
    await expect(page.locator('button[aria-label*="User menu"], button[aria-label*="user"], button:has-text("Test"), .user-menu, button svg').first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Use test login form but with invalid credentials
    await page.getByRole('button', { name: 'Automated Test Login' }).click();

    // Wait for the test login form to appear
    await page.waitForTimeout(500);

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login with Email' }).click();

    // Check for error message - might be different text
    await expect(page.getByText(/Invalid credentials|Login failed|Error/i)).toBeVisible();
  });

  test('should redirect authenticated users', async ({ page }) => {
    // First login to establish authentication
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);

    // Wait for redirect to home page
    await expect(page).toHaveURL('/');

    // Now try to access login page again - should redirect to home
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});