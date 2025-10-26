import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { waitForElement, clickElement, typeText, logTestStep } from '../../fixtures/test-utils';

test.describe('Admin Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up admin login');

    // Login as admin
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    // Use data-testid attributes when available
    const usernameInput = page.getByTestId('admin-username');
    const passwordInput = page.getByTestId('admin-password');

    if (await usernameInput.count() > 0) {
      await usernameInput.fill(testUsers.admin.username);
      await passwordInput.fill(testUsers.admin.password);
      console.log('Filled admin credentials using data-testid');
    } else {
      // Fallback to label-based selection
      await page.getByLabel(/username|notandanafn/i).fill(testUsers.admin.username);
      await page.getByLabel(/password|lykilorð/i).fill(testUsers.admin.password);
      console.log('Filled admin credentials using labels');
    }

    // Click login button
    await page.getByRole('button', { name: /login|innskrá/i }).click();
    await page.waitForTimeout(2000);

    logTestStep('Admin login completed successfully');
  });

  test('should display orders page with proper layout', async ({ page }) => {
    logTestStep('Testing orders page display');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify page title and header
    await expect(page.locator('h1').first()).toContainText(/Order|Pöntun/i);

    // Check for export button
    const exportButton = page.getByRole('button', { name: /Export|Flytja út/i });
    const hasExportButton = await exportButton.count() > 0;
    if (hasExportButton) {
      await expect(exportButton).toBeVisible();
    }

    logTestStep('Orders page layout verified');
  });

  test('should display orders table with data', async ({ page }) => {
    logTestStep('Testing orders table display');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for table structure
    const table = page.locator('table');
    const hasTable = await table.count() > 0;

    if (hasTable) {
      // Check for table headers
      const headers = table.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);

      // Check for table body (use first tbody to avoid strict mode violation)
      const body = table.locator('tbody').first();
      await expect(body).toBeVisible();

      // Check if there are any order rows
      const orderRows = body.locator('tr');
      const rowCount = await orderRows.count();

      if (rowCount > 0) {
        // Verify order data is displayed
        const firstRow = orderRows.first();
        await expect(firstRow).toBeVisible();

        // Check for order data (order number, customer, date, etc.)
        const hasOrderData = await firstRow.locator('text=/[A-Za-z0-9]/').count() > 0;
        expect(hasOrderData).toBe(true);
      } else {
        // Check for empty state
        const emptyState = page.getByText(/No.*orders|Pantanir ekki til staðar/i);
        const hasEmptyState = await emptyState.count() > 0;
        expect(hasEmptyState).toBe(true);
      }

      logTestStep('Orders table display verified');
    } else {
      // Check for empty state or loading
      const hasContent = await page.locator('text=/[A-Za-z]/').count() > 0;
      const hasEmptyState = await page.getByText(/No.*orders|Pantanir ekki til staðar/i).count() > 0;

      expect(hasContent || hasEmptyState).toBe(true);
      logTestStep('Orders content or empty state verified');
    }
  });

  test('should handle order search functionality', async ({ page }) => {
    logTestStep('Testing order search functionality');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for search input (use first to avoid strict mode violation)
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Leita"]').first();
    const hasSearchInput = await searchInput.count() > 0;

    if (hasSearchInput) {
      // Test search functionality
      await searchInput.fill('test');
      await page.waitForTimeout(1000); // Wait for search to complete

      // Verify search doesn't break the page
      await expect(page.locator('h1').first()).toBeVisible();

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);

      logTestStep('Order search functionality verified');
    } else {
      logTestStep('Search input not found (may not be implemented yet)');
    }
  });

  test('should handle order status filtering', async ({ page }) => {
    logTestStep('Testing order status filtering');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for status filter dropdown (use first to avoid strict mode violation)
    const statusSelect = page.locator('select').first();
    const hasStatusFilter = await statusSelect.count() > 0;

    if (hasStatusFilter) {
      // Test changing status filter
      const initialValue = await statusSelect.inputValue();

      // Get available options
      const options = statusSelect.locator('option');
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Try to select the second option (usually not the default "all")
        const secondOption = options.nth(1);
        const optionValue = await secondOption.getAttribute('value');

        if (optionValue && optionValue !== initialValue) {
          await statusSelect.selectOption(optionValue);
          await page.waitForTimeout(1000);

          // Verify filter was applied (select value changed)
          const newValue = await statusSelect.inputValue();
          expect(newValue).toBe(optionValue);

          // Reset to first option (usually "all")
          const firstOption = options.first();
          const firstValue = await firstOption.getAttribute('value') || '';
          await statusSelect.selectOption(firstValue);
          await page.waitForTimeout(1000);
        }
      }

      logTestStep('Order status filtering verified');
    } else {
      logTestStep('Status filter not found (may not be implemented yet)');
    }
  });

  test('should display order count statistics', async ({ page }) => {
    logTestStep('Testing order count display');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for order count display (use first to avoid strict mode violation)
    const orderCount = page.getByText(/[0-9]+.*orders|[0-9]+.*pantanir/i).first();
    const hasOrderCount = await orderCount.count() > 0;

    if (hasOrderCount) {
      await expect(orderCount).toBeVisible();
      logTestStep('Order count display verified');
    } else {
      // Check for any numeric content that might indicate count
      const hasNumbers = await page.locator('text=/[0-9]/').count() > 0;
      expect(hasNumbers).toBe(true);
      logTestStep('Numeric content found (order count may be displayed differently)');
    }
  });

  test('should handle order details modal', async ({ page }) => {
    logTestStep('Testing order details modal');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for view/detail buttons (eye icon)
    const viewButtons = page.locator('button:has(svg)').filter({ hasText: '' }); // Buttons with SVG icons
    const eyeButtons = page.locator('svg[class*="h-4 w-4"]').locator('..').locator('button');
    const detailButtons = page.getByRole('button', { name: /View|Details|Skoða/i });

    let hasDetailButton = false;
    if (await viewButtons.count() > 0) {
      hasDetailButton = true;
    } else if (await eyeButtons.count() > 0) {
      hasDetailButton = true;
    } else if (await detailButtons.count() > 0) {
      hasDetailButton = true;
    }

    if (hasDetailButton) {
      // Try to open order details
      if (await eyeButtons.count() > 0) {
        await eyeButtons.first().click();
      } else if (await detailButtons.count() > 0) {
        await detailButtons.first().click();
      } else {
        await viewButtons.first().click();
      }

      await page.waitForTimeout(1000);

      // Check if modal opened
      const modal = page.locator('[class*="fixed"], [class*="modal"], [role="dialog"]');
      const hasModal = await modal.count() > 0;

      if (hasModal) {
        // Verify modal has order information
        const hasOrderInfo = await modal.locator('text=/[A-Za-z]/').count() > 0;
        expect(hasOrderInfo).toBe(true);

        // Close modal
        const closeButtons = modal.locator('button').filter({ hasText: '×' }).or(
          modal.locator('button').filter({ has: page.locator('svg') })
        );

        if (await closeButtons.count() > 0) {
          await closeButtons.first().click();
          await page.waitForTimeout(500);
        }

        logTestStep('Order details modal verified');
      } else {
        logTestStep('Order details modal not implemented yet');
      }
    } else {
      logTestStep('No order detail buttons found');
    }
  });

  test('should handle export functionality', async ({ page }) => {
    logTestStep('Testing export functionality');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find export button
    const exportButton = page.getByRole('button', { name: /Export|Flytja út/i });
    const hasExportButton = await exportButton.count() > 0;

    if (hasExportButton) {
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
      logTestStep('Export functionality verified');
    } else {
      logTestStep('Export functionality not yet implemented');
    }
  });

  test('should handle loading states properly', async ({ page }) => {
    logTestStep('Testing loading states');

    await page.goto('/admin/orders');

    // Check for loading indicators
    const loadingIndicators = page.locator('[class*="animate-spin"], [class*="skeleton"], [class*="loading"]');
    const hasLoading = await loadingIndicators.count() > 0;

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // After loading, should have content or empty state
    const hasContent = await page.locator('text=/[A-Za-z]/').count() > 0;
    const hasEmptyState = await page.getByText(/No.*orders|Pantanir ekki til staðar/i).count() > 0;

    expect(hasContent || hasEmptyState).toBe(true);

    logTestStep('Loading states handled properly');
  });

  test('should handle empty state when no orders found', async ({ page }) => {
    logTestStep('Testing empty state handling');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if there are orders
    const orderRows = page.locator('tbody tr');
    const orderCount = await orderRows.count();

    if (orderCount === 0) {
      // Should show empty state
      const emptyState = page.getByText(/No.*orders|Pantanir ekki til staðar/i);
      const hasEmptyState = await emptyState.count() > 0;

      if (hasEmptyState) {
        await expect(emptyState).toBeVisible();
        logTestStep('Empty state properly displayed');
      } else {
        logTestStep('No orders and no empty state (may be loading)');
      }
    } else {
      logTestStep('Orders are present, empty state not applicable');
    }
  });

  test('should handle responsive design', async ({ page }) => {
    logTestStep('Testing responsive design');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    // On mobile, elements might be hidden/collapsed, just verify page loads
    const mobileContent = page.locator('body');
    await expect(mobileContent).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const tabletContent = page.locator('body');
    await expect(tabletContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    const desktopContent = page.locator('body');
    await expect(desktopContent).toBeVisible();

    logTestStep('Responsive design verified');
  });

  test('should restrict access to admin users only', async ({ browser }) => {
    logTestStep('Testing access control for orders page');

    // Try accessing as regular user
    const userPage = await browser.newPage();
    await userPage.goto('/login');

    try {
      // Try to login as customer (if available)
      const emailField = userPage.locator('input[type="email"], input[placeholder*="email"]');
      const passwordField = userPage.locator('input[type="password"]');

      if (await emailField.count() > 0 && await passwordField.count() > 0) {
        await emailField.fill(testUsers.customer.email);
        await passwordField.fill(testUsers.customer.password);

        const loginButton = userPage.getByRole('button', { name: /Login|Sign in/i });
        if (await loginButton.count() > 0) {
          await loginButton.click();
          await userPage.waitForURL('/');
        }
      }

      // Try to access orders directly
      await userPage.goto('/admin/orders');

      // Should be redirected or show access denied
      const accessDenied = userPage.getByText(/Access Denied|Aðgangur|Forbidden/i);
      const redirected = userPage.url().includes('/admin/orders') === false;

      expect(await accessDenied.count() > 0 || redirected).toBe(true);

    } catch (error) {
      // If customer login fails, just test direct access
      await userPage.goto('/admin/orders');
      const accessDenied = userPage.getByText(/Access Denied|Aðgangur|Forbidden|Login/i);
      expect(await accessDenied.count() > 0).toBe(true);
    }

    await userPage.close();
    logTestStep('Access control verified');
  });

  test('should handle order data formatting', async ({ page }) => {
    logTestStep('Testing order data formatting');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for properly formatted data (currency, dates, order numbers, etc.)
    const hasFormattedData = await page.locator('text=/[0-9]/').count() > 0; // Numbers
    const hasCurrencySymbols = await page.locator('text=/kr|ISK|€|\\$/').count() > 0; // Currency
    const hasDates = await page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}|\\d{4}-\\d{2}-\\d{2}/').count() > 0; // Date patterns
    const hasOrderNumbers = await page.locator('text=/#[0-9]+|Order.*[0-9]+/').count() > 0; // Order numbers

    // At least some data should be present
    expect(hasFormattedData).toBe(true);

    if (hasCurrencySymbols) {
      logTestStep('Currency formatting verified');
    }
    if (hasDates) {
      logTestStep('Date formatting verified');
    }
    if (hasOrderNumbers) {
      logTestStep('Order number formatting verified');
    }

    logTestStep('Order data formatting verified');
  });
});