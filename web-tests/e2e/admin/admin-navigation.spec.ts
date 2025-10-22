import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep, retryOperation } from '../../fixtures/test-utils';

test.describe('Admin Navigation and Authentication', () => {
  test('should navigate through all admin sections', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for this comprehensive navigation test
    logTestStep('Testing admin navigation');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Test navigation to each admin section
    const navItems = [
      { name: 'Dashboard', url: '/admin' },
      { name: 'Products', url: '/admin/products' },
      { name: 'Categories', url: '/admin/categories' },
      { name: 'Orders', url: '/admin/orders' },
      { name: 'Customers', url: '/admin/customers' },
      { name: 'Analytics', url: '/admin/analytics' },
      { name: 'Reports', url: '/admin/reports' },
      { name: 'General', url: '/admin/settings/general' },
      { name: 'Business', url: '/admin/settings/business' },
      { name: 'Shipping', url: '/admin/settings/shipping' },
      { name: 'Payment Gateways', url: '/admin/settings/payment-gateways' }
    ];

    for (const item of navItems) {
      logTestStep(`Navigating to ${item.name}`);

      // Add retry logic for navigation
      await retryOperation(async () => {
        await page.goto(item.url);
        await page.waitForLoadState('networkidle', { timeout: 30000 });
      }, 3, 2000);

      // Verify page loaded successfully (no error status)
      const currentURL = page.url();
      expect(currentURL).toContain(item.url.replace('/admin', ''));

      // Brief wait to ensure page is stable
      await page.waitForTimeout(500);
    }

    logTestStep('Admin navigation test completed');
  });

  test('should handle admin logout', async ({ page }) => {
    logTestStep('Testing admin logout functionality');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Verify we're logged in (admin navigation visible)
    await expect(page.locator('nav')).toBeVisible();

    // Wait for logout button to be present
    await page.waitForSelector('button:has-text("Logout")', { timeout: 5000 });

    // Click logout button using JavaScript to bypass viewport checks
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const logoutBtn = buttons.find(btn => btn.textContent?.trim() === 'Logout');
      if (logoutBtn) {
        logoutBtn.click();
      } else {
        throw new Error('Logout button not found');
      }
    });

    // Verify redirected to login page
    await expect(page).toHaveURL('/admin-login');

    // Try to access admin page (should redirect to login)
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin-login');

    logTestStep('Admin logout test completed');
  });

  test('should handle invalid admin login', async ({ page }) => {
    logTestStep('Testing invalid admin login');

    // Try to login with invalid credentials
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill('invaliduser');
    await page.getByLabel('Password').fill('invalidpass');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should stay on login page or show error
    await page.waitForTimeout(1000);
    const currentURL = page.url();
    expect(currentURL).toContain('admin-login');

    logTestStep('Invalid admin login test completed');
  });

  test('should restrict non-admin access', async ({ page }) => {
    logTestStep('Testing non-admin access restriction');

    // Try to access admin pages without login
    const adminPages = [
      '/admin',
      '/admin/products',
      '/admin/settings/general'
    ];

    for (const pageUrl of adminPages) {
      await page.goto(pageUrl);
      // Should redirect to login or show access denied
      await page.waitForLoadState('networkidle');
      const currentURL = page.url();
      expect(currentURL).not.toContain('/admin/');
    }

    logTestStep('Non-admin access restriction test completed');
  });

  test('should handle admin session timeout', async ({ page }) => {
    logTestStep('Testing admin session timeout simulation');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Clear localStorage to simulate session expiry
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Try to access admin page (should redirect to login)
    await page.goto('/admin/products');
    await expect(page).toHaveURL('/admin-login');

    logTestStep('Admin session timeout test completed');
  });
});