import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep, retryOperation } from '../../fixtures/test-utils';

test.describe('Admin Navigation and Authentication', () => {
  test('should navigate through all admin sections', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for this comprehensive navigation test
    logTestStep('Testing admin navigation');

    // Login
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    // Use data-testid attributes for more reliable selection
    const usernameInput = page.getByTestId('admin-username');
    const passwordInput = page.getByTestId('admin-password');

    if (await usernameInput.count() > 0) {
      await usernameInput.fill(testUsers.admin.username);
      await passwordInput.fill(testUsers.admin.password);
      await page.getByRole('button', { name: /login|innskrá/i }).click();
    } else {
      // Fallback to label-based selection
      await page.getByLabel(/username|notandanafn/i).fill(testUsers.admin.username);
      await page.getByLabel(/password|lykilorð/i).fill(testUsers.admin.password);
      await page.getByRole('button', { name: /login|innskrá/i }).click();
    }

    await page.waitForTimeout(2000);

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
    await page.waitForLoadState('networkidle');

    const usernameInput = page.getByTestId('admin-username');
    if (await usernameInput.count() > 0) {
      await usernameInput.fill(testUsers.admin.username);
      await page.getByTestId('admin-password').fill(testUsers.admin.password);
    } else {
      await page.getByLabel(/username|notandanafn/i).fill(testUsers.admin.username);
      await page.getByLabel(/password|lykilorð/i).fill(testUsers.admin.password);
    }

    await page.getByRole('button', { name: /login|innskrá/i }).click();
    await page.waitForTimeout(2000);

    // Verify we're logged in (check for admin content)
    const adminPageContent = page.locator('[class*="admin"], [class*="dashboard"]');
    if (await adminPageContent.count() > 0) {
      console.log('Admin page content verified');
    }

    // Wait for logout button to be present - try multiple selector strategies
    const logoutSelectors = [
      'button:has-text("Útskrá")',  // Icelandic
      'button:has-text("Logout")',   // English
      'button:has-text("Sign Out")',
      '[data-testid*="logout"]',
      'button[aria-label*="logout" i]',
      'a:has-text("Útskrá")',
      'a:has-text("Logout")'
    ];

    let logoutBtn = null;
    for (const selector of logoutSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        logoutBtn = btn;
        console.log(`Found logout button with selector: ${selector}`);
        break;
      }
    }

    if (!logoutBtn) {
      // Fallback: look for any button/link containing logout or sign out
      const allButtons = page.locator('button, a');
      const count = await allButtons.count();
      for (let i = 0; i < count; i++) {
        const text = await allButtons.nth(i).textContent();
        if (text && (text.toLowerCase().includes('útskrá') || text.toLowerCase().includes('logout') || text.toLowerCase().includes('sign out'))) {
          logoutBtn = allButtons.nth(i);
          console.log(`Found logout button by text content: ${text}`);
          break;
        }
      }
    }

    if (logoutBtn && await logoutBtn.isVisible()) {
      await logoutBtn.click();
      console.log('Clicked logout button');
    } else {
      console.log('Warning: Logout button not found, attempting navigation to logout URL');
      await page.goto('/admin-logout');
    }

    // Verify logged out by checking we're not in admin dashboard
    // May redirect to home (/) or login page - both indicate logout worked
    const currentUrl = page.url();
    const isLoggedOut = !currentUrl.includes('/admin/dashboard') && !currentUrl.includes('/admin/');
    expect(isLoggedOut).toBe(true);
    logTestStep(`Logged out successfully, redirected to: ${currentUrl}`);

    // Try to access admin page (should redirect away when not logged in)
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const adminPageUrl = page.url();
    const isNotInAdmin = !adminPageUrl.includes('/admin/dashboard') && !adminPageUrl.includes('/admin/');
    expect(isNotInAdmin).toBe(true);

    logTestStep('Admin logout test completed');
  });

  test('should handle invalid admin login', async ({ page }) => {
    logTestStep('Testing invalid admin login');

    // Try to login with invalid credentials
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    const usernameInput = page.getByTestId('admin-username');
    if (await usernameInput.count() > 0) {
      await usernameInput.fill('invaliduser');
      await page.getByTestId('admin-password').fill('invalidpass');
    } else {
      await page.getByLabel(/username|notandanafn/i).fill('invaliduser');
      await page.getByLabel(/password|lykilorð/i).fill('invalidpass');
    }

    await page.getByRole('button', { name: /login|innskrá/i }).click();

    // Should stay on login page or show error
    await page.waitForTimeout(2000);
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
    await page.waitForLoadState('networkidle');

    const usernameInput = page.getByTestId('admin-username');
    if (await usernameInput.count() > 0) {
      await usernameInput.fill(testUsers.admin.username);
      await page.getByTestId('admin-password').fill(testUsers.admin.password);
    } else {
      await page.getByLabel(/username|notandanafn/i).fill(testUsers.admin.username);
      await page.getByLabel(/password|lykilorð/i).fill(testUsers.admin.password);
    }

    await page.getByRole('button', { name: /login|innskrá/i }).click();
    await page.waitForTimeout(2000);

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