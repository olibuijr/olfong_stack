import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';

test.describe('Real-time Order Updates', () => {
  test('should receive order status updates', async ({ page, context }) => {
    // Login as customer
    await page.goto('/login');
    await page.getByLabel('Email').fill(testUsers.customer.email);
    await page.getByLabel('Password').fill(testUsers.customer.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to orders page
    await page.goto('/profile');
    await page.getByRole('tab', { name: 'Orders' }).click();

    // Simulate order status update via API
    const apiContext = await context.newPage().request;
    await apiContext.post('/api/orders/1/status', {
      data: { status: 'PREPARING' },
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });

    // Verify real-time update
    await expect(page.getByText('Order is now being prepared')).toBeVisible();
  });
});