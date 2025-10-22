import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Admin Sidebar Functionality', () => {
  test('should toggle sidebar collapse/expand and persist state', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing admin sidebar collapse/expand functionality');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Wait for sidebar to load
    await page.waitForSelector('nav', { timeout: 10000 });

    // Check initial state - should be expanded by default
    const sidebar = page.locator('[class*="bg-white"][class*="text-gray-900"]');
    await expect(sidebar).toHaveClass(/w-64/); // Expanded width

    // Find and click the toggle button
    const toggleButton = page.locator('button').filter({ hasText: '' }).locator('svg').first();
    await toggleButton.click();

    // Wait for animation and check collapsed state
    await page.waitForTimeout(500);
    await expect(sidebar).toHaveClass(/w-16/); // Collapsed width

    // Check that section headers are hidden
    const sectionHeaders = page.locator('h3').filter({ hasText: /.+/ });
    for (const header of await sectionHeaders.all()) {
      await expect(header).toHaveCSS('opacity', '0');
    }

    // Check that menu item text is hidden
    const menuItemTexts = page.locator('span').filter({ hasText: /.+/ }).filter({ has: page.locator('..').locator('svg') });
    for (const text of await menuItemTexts.all()) {
      await expect(text).toHaveCSS('opacity', '0');
    }

    // Click toggle again to expand
    await toggleButton.click();

    // Wait for animation and check expanded state
    await page.waitForTimeout(500);
    await expect(sidebar).toHaveClass(/w-64/); // Expanded width

    // Check that section headers are visible
    for (const header of await sectionHeaders.all()) {
      await expect(header).toHaveCSS('opacity', '1');
    }

    // Check that menu item text is visible
    for (const text of await menuItemTexts.all()) {
      await expect(text).toHaveCSS('opacity', '1');
    }

    logTestStep('Sidebar toggle functionality test completed');
  });

  test('should persist sidebar state across page navigation', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing sidebar state persistence across navigation');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Wait for sidebar to load
    await page.waitForSelector('nav', { timeout: 10000 });

    // Collapse the sidebar
    const toggleButton = page.locator('button').filter({ hasText: '' }).locator('svg').first();
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Verify collapsed state
    const sidebar = page.locator('[class*="bg-white"][class*="text-gray-900"]');
    await expect(sidebar).toHaveClass(/w-16/);

    // Navigate to products page
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Check that sidebar is still collapsed
    await expect(sidebar).toHaveClass(/w-16/);

    // Navigate back to dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check that sidebar is still collapsed
    await expect(sidebar).toHaveClass(/w-16/);

    logTestStep('Sidebar persistence test completed');
  });

  test('should show tooltips on collapsed sidebar', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing tooltips on collapsed sidebar');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Wait for sidebar to load
    await page.waitForSelector('nav', { timeout: 10000 });

    // Collapse the sidebar
    const toggleButton = page.locator('button').filter({ hasText: '' }).locator('svg').first();
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Hover over a menu item and check for title attribute
    const firstMenuItem = page.locator('a').first();
    const title = await firstMenuItem.getAttribute('title');
    expect(title).toBeTruthy();
    expect(title?.length).toBeGreaterThan(0);

    logTestStep('Sidebar tooltips test completed');
  });
});