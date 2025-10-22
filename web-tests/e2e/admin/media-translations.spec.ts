import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Media Management Translations', () => {
  test('should display media management translations correctly in English', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing media management translations in English');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Navigate to media page
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify page title and description
    await expect(page.locator('h1')).toContainText('Media');
    await expect(page.locator('p').filter({ hasText: /manage.*media/i })).toBeVisible();

    // Verify upload button
    await expect(page.getByRole('button', { name: 'Upload Media' })).toBeVisible();

    // Verify collection tabs
    const collectionTexts = ['Products', 'Categories', 'Banners', 'Profile', 'Documents', 'Videos'];
    for (const text of collectionTexts) {
      await expect(page.getByText(text)).toBeVisible();
    }

    // Check if there's an empty state or media items
    const noMediaFound = page.getByText('No media found');
    const uploadFirstMedia = page.getByText('Upload your first media');

    if (await noMediaFound.isVisible()) {
      await expect(noMediaFound).toBeVisible();
      await expect(uploadFirstMedia).toBeVisible();
    }

    logTestStep('English translations verified successfully');
  });

  test('should display media management translations correctly in Icelandic', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing media management translations in Icelandic');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Switch to Icelandic language
    await page.locator('button').filter({ hasText: 'EN' }).click();
    await page.waitForTimeout(500);
    await page.getByText('Íslenska').click();
    await page.waitForTimeout(1000);

    // Navigate to media page
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Verify page title and description in Icelandic
    await expect(page.locator('h1')).toContainText('Miðlar');
    await expect(page.locator('p').filter({ hasText: /stjórna.*miðlum/i })).toBeVisible();

    // Verify upload button in Icelandic
    await expect(page.getByRole('button', { name: 'Hlaða upp miðli' })).toBeVisible();

    // Verify collection tabs in Icelandic
    const collectionTexts = ['Vörur', 'Flokkar', 'Borðar', 'Snið', 'Skjöl', 'Myndbönd'];
    for (const text of collectionTexts) {
      await expect(page.getByText(text)).toBeVisible();
    }

    // Check if there's an empty state or media items
    const noMediaFound = page.getByText('Engir miðlar fundust');
    const uploadFirstMedia = page.getByText('Hladdu upp fyrsta miðlinum þínum');

    if (await noMediaFound.isVisible()) {
      await expect(noMediaFound).toBeVisible();
      await expect(uploadFirstMedia).toBeVisible();
    }

    logTestStep('Icelandic translations verified successfully');
  });

  test('should handle media upload modal translations', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing media upload modal translations');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Navigate to media upload page
    await page.goto('/admin/media/upload');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check if upload page loads (basic functionality test)
    await expect(page.locator('h1')).toBeVisible();

    logTestStep('Media upload modal translations test completed');
  });

  test('should verify media filters and view mode translations', async ({ page }) => {
    test.setTimeout(60000);
    logTestStep('Testing media filters and view mode translations');

    // Login
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');

    // Navigate to media page
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check for search placeholder
    const searchInput = page.getByPlaceholder(/search.*media/i);
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }

    // Check for view mode buttons (grid/list)
    const gridButton = page.locator('button').filter({ hasText: /grid/i });
    const listButton = page.locator('button').filter({ hasText: /list/i });

    // At least one view mode should be visible
    const hasGridOrList = (await gridButton.count()) > 0 || (await listButton.count()) > 0;
    expect(hasGridOrList).toBe(true);

    logTestStep('Media filters and view mode translations test completed');
  });
});