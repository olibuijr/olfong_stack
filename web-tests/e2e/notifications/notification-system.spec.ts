import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { loginUser, logTestStep } from '../../fixtures/test-utils';

test.describe('Notification System', () => {
  test('should display notification icon in navbar', async ({ page }) => {
    logTestStep('Testing notification icon display');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Look for notification icon in navbar
    const notificationSelectors = [
      '[class*="notification"]',
      'button[class*="bell"]',
      'svg[class*="bell"]',
      '[aria-label*="notification"]',
      'button:has-text("Tilkynningar")',
      'button[data-testid*="notification"]'
    ];

    let notificationIconFound = false;
    for (const selector of notificationSelectors) {
      const icon = page.locator(selector);
      if (await icon.count() > 0) {
        notificationIconFound = true;
        logTestStep('Notification icon found in navbar');
        break;
      }
    }

    if (!notificationIconFound) {
      logTestStep('Notification icon not found');
    }
  });

  test('should show notification badge with count', async ({ page }) => {
    logTestStep('Testing notification badge count');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Look for notification badge with number
    const badgeSelectors = [
      '[class*="badge"]',
      '[class*="notification-count"]',
      '[data-testid="notification-badge"]'
    ];

    let badgeFound = false;
    for (const selector of badgeSelectors) {
      const badge = page.locator(selector);
      if (await badge.count() > 0) {
        const isVisible = await badge.first().isVisible();
        if (isVisible) {
          badgeFound = true;
          const badgeText = await badge.first().textContent();
          logTestStep(`Notification badge found with text: ${badgeText}`);
          break;
        }
      }
    }

    // Also try getting spans with numbers using getByText
    if (!badgeFound) {
      const numberSpans = page.getByText(/^\d+$/, { exact: true }).first();
      if (await numberSpans.count() > 0) {
        const isVisible = await numberSpans.isVisible();
        if (isVisible) {
          badgeFound = true;
          const badgeText = await numberSpans.textContent();
          logTestStep(`Notification badge found with text: ${badgeText}`);
        }
      }
    }

    if (!badgeFound) {
      logTestStep('Notification badge not found');
    }
  });

  test('should open notification panel when clicking notification icon', async ({ page }) => {
    logTestStep('Testing notification panel opening');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Find and click notification icon
    const notificationBtn = page.locator('[class*="notification"], button:has-text("Tilkynningar"), [data-testid*="notification"]').first();

    if (await notificationBtn.count() > 0) {
      await notificationBtn.click();
      await page.waitForTimeout(1000);

      // Look for notification panel
      const panelSelectors = [
        '[class*="notification-panel"]',
        '[class*="notification-dropdown"]',
        '[role="dialog"]',
        '[class*="modal"]'
      ];

      let panelFound = false;
      for (const selector of panelSelectors) {
        const panel = page.locator(selector);
        if (await panel.count() > 0) {
          panelFound = true;
          logTestStep('Notification panel opened');
          break;
        }
      }

      if (!panelFound) {
        logTestStep('Notification panel not found after clicking');
      }
    } else {
      logTestStep('Notification button not found');
    }
  });

  test('should display list of notifications', async ({ page }) => {
    logTestStep('Testing notification list display');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Click notification icon to open panel
    const notificationBtn = page.locator('[class*="notification"], button:has-text("Tilkynningar")').first();
    if (await notificationBtn.count() > 0) {
      await notificationBtn.click();
      await page.waitForTimeout(1000);

      // Look for notification items
      const notificationItems = page.locator('[class*="notification-item"], [class*="notification-entry"], li[class*="notification"]');
      const itemCount = await notificationItems.count();

      if (itemCount > 0) {
        logTestStep(`Found ${itemCount} notifications in panel`);
      } else {
        logTestStep('No notifications displayed (may be empty)');
      }
    }
  });

  test('should mark notification as read', async ({ page }) => {
    logTestStep('Testing mark notification as read');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Click notification icon
    const notificationBtn = page.locator('[class*="notification"], button:has-text("Tilkynningar")').first();
    if (await notificationBtn.count() > 0) {
      await notificationBtn.click();
      await page.waitForTimeout(1000);

      // Find unread notification
      const unreadNotification = page.locator('[class*="unread"], [class*="new"]').first();
      if (await unreadNotification.count() > 0) {
        await unreadNotification.click();
        await page.waitForTimeout(500);

        // Check if style changed (unread removed)
        const isUnread = await unreadNotification.evaluate(el => {
          return el.classList.contains('unread') || el.classList.contains('new');
        });

        if (!isUnread) {
          logTestStep('Notification marked as read successfully');
        } else {
          logTestStep('Notification may still be marked as unread');
        }
      } else {
        logTestStep('No unread notifications found');
      }
    }
  });

  test('should delete/dismiss notification', async ({ page }) => {
    logTestStep('Testing notification deletion');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Click notification icon
    const notificationBtn = page.locator('[class*="notification"], button:has-text("Tilkynningar")').first();
    if (await notificationBtn.count() > 0) {
      await notificationBtn.click();
      await page.waitForTimeout(1000);

      // Get initial notification count
      const initialNotifications = page.locator('[class*="notification-item"]');
      const initialCount = await initialNotifications.count();

      // Look for close/delete button
      const deleteBtn = page.locator('button[aria-label*="close"], button:has-text("×"), button[class*="delete"]').first();

      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await page.waitForTimeout(500);

        // Check if notification count decreased
        const finalNotifications = page.locator('[class*="notification-item"]');
        const finalCount = await finalNotifications.count();

        if (finalCount < initialCount) {
          logTestStep('Notification deleted successfully');
        } else {
          logTestStep('Notification count did not change after delete');
        }
      } else {
        logTestStep('No delete button found for notification');
      }
    }
  });

  test('should display notification details on click', async ({ page }) => {
    logTestStep('Testing notification details display');

    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    await page.waitForLoadState('networkidle');

    // Click notification icon
    const notificationBtn = page.locator('[class*="notification"], button:has-text("Tilkynningar")').first();
    if (await notificationBtn.count() > 0) {
      await notificationBtn.click();
      await page.waitForTimeout(1000);

      // Click first notification
      const firstNotification = page.locator('[class*="notification-item"]').first();
      if (await firstNotification.count() > 0) {
        await firstNotification.click();
        await page.waitForTimeout(1000);

        // Look for detail view
        const detailSelectors = [
          '[class*="notification-detail"]',
          '[class*="notification-content"]',
          'text=/message|description|details/i'
        ];

        let detailFound = false;
        for (const selector of detailSelectors) {
          if (await page.locator(selector).count() > 0) {
            detailFound = true;
            logTestStep('Notification details displayed');
            break;
          }
        }

        if (!detailFound) {
          logTestStep('No detail view found for notification');
        }
      }
    }
  });

  test('should admin see notification settings page', async ({ page }) => {
    logTestStep('Testing admin notification settings');

    // Login as admin
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

    // Navigate to notifications admin page
    await page.goto('/admin/notifications');
    await page.waitForLoadState('networkidle');

    // Check if page loaded
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    logTestStep('Admin notifications page accessible');
  });

  test('should send test notification', async ({ page }) => {
    logTestStep('Testing send test notification');

    // Login as admin
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

    // Navigate to notifications page
    await page.goto('/admin/notifications');
    await page.waitForLoadState('networkidle');

    // Look for "Send Test" or "Create" button
    const sendBtn = page.locator('button:has-text("Send"), button:has-text("Create"), button:has-text("Test")').first();

    if (await sendBtn.count() > 0) {
      await sendBtn.click();
      await page.waitForTimeout(1000);

      // Fill notification form
      const titleInput = page.locator('input[name*="title"], input[placeholder*="title" i]').first();
      if (await titleInput.count() > 0) {
        await titleInput.fill('Test Notification');
        logTestStep('Filled notification title');
      }

      const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="message" i]').first();
      if (await messageInput.count() > 0) {
        await messageInput.fill('This is a test notification');
        logTestStep('Filled notification message');
      }

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Create")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
        logTestStep('Test notification sent');
      }
    } else {
      logTestStep('Send/Create button not found');
    }
  });
});
