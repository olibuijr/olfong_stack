import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { waitForElement, clickElement, typeText, logTestStep } from '../../fixtures/test-utils';

test.describe('User Age Verification Modal', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state for each test (except persistence test)
    if (!test.info().title.includes('maintain language preference')) {
      await page.addInitScript(() => {
        localStorage.clear();
      });
      logTestStep('Cleared localStorage for clean test state');
    }
  });

  test('should display language toggle correctly', async ({ page }) => {
    logTestStep('Testing language toggle display');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check what language toggle actually shows (should be EN due to test config)
    const languageButton = page.locator('button').filter({ hasText: 'EN' }).or(page.locator('button').filter({ hasText: 'IS' }));
    await expect(languageButton).toBeVisible();

    // Get the text content to verify it's not "EN-US"
    const buttonText = await languageButton.textContent();
    expect(buttonText).not.toContain('EN-US');

    logTestStep(`Language toggle displays: ${buttonText}`);
  });

  test('should handle language switching', async ({ page }) => {
    logTestStep('Testing language switching functionality');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get current language button (could be EN from test config or IS as default)
    const currentLangButton = page.locator('button').filter({ hasText: 'EN' }).or(page.locator('button').filter({ hasText: 'IS' }));
    const currentText = await currentLangButton.textContent();

    // Click to switch language
    await currentLangButton.click();

    // Should now show the opposite language
    const expectedText = currentText === 'EN' ? 'IS' : 'EN';
    const switchedButton = page.locator('button').filter({ hasText: expectedText });
    await expect(switchedButton).toBeVisible();

    logTestStep(`Language switching from ${currentText} to ${expectedText} works`);
  });

  test('should maintain language preference across page reloads', async ({ page }) => {
    logTestStep('Testing language persistence across page reloads');

    // Set language to English explicitly for this test
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'en');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check what language button is actually visible
    const langButton = page.locator('button').filter({ hasText: 'EN' }).or(page.locator('button').filter({ hasText: 'IS' }));
    const buttonText = await langButton.textContent();
    logTestStep(`Initial language button shows: ${buttonText}`);

    // If it's not EN, click to switch to EN
    if (buttonText !== 'EN') {
      await langButton.click();
      await expect(page.locator('button').filter({ hasText: 'EN' })).toBeVisible();
    }

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check what it shows after reload
    const reloadedButton = page.locator('button').filter({ hasText: 'EN' }).or(page.locator('button').filter({ hasText: 'IS' }));
    const reloadedText = await reloadedButton.textContent();
    logTestStep(`After reload language button shows: ${reloadedText}`);

    // Should remember English preference
    expect(reloadedText).toBe('EN');

    logTestStep('Language preference persists across page reloads');
  });
});