import { test, expect } from '@playwright/test';

test('basic health check', async ({ page }) => {
  // Test backend health endpoint
  const response = await page.request.get('http://localhost:5000/api/health');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe('OK');
  expect(data.timestamp).toBeDefined();
});

test('frontend loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ölföng/);
});
