import { test, expect } from '@playwright/test';

test.describe('Ölföng E2E Test Suite', () => {
  test('Health check - backend API', async ({ page }) => {
    // Test backend health endpoint
    const response = await page.request.get('http://localhost:5000/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.environment).toBeDefined();
  });

  test('Frontend loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ölföng/);
  });

  test('Can navigate to products page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /products/i }).click();
    await expect(page).toHaveURL(/products/);
  });
});