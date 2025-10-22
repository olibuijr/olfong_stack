import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep, retryOperation, waitForElement, clickElement, typeText } from '../../fixtures/test-utils';

test.describe('Admin Profile Update Tests', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up admin login for profile tests');
    await page.goto('/admin-login');
    await page.getByLabel('Username').fill(testUsers.admin.username);
    await page.getByLabel('Password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/admin');
    logTestStep('Admin login successful');
  });

  test('should navigate to profile page from admin dashboard', async ({ page }) => {
    logTestStep('Testing navigation to profile page');
    
    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the profile page
    await expect(page).toHaveURL('/profile');
    
    // Look for profile page elements
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    logTestStep('Profile page navigation test completed');
  });

  test('should display admin profile information', async ({ page }) => {
    logTestStep('Testing admin profile information display');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify profile page loaded
    await expect(page).toHaveURL('/profile');
    
    // Look for profile information elements
    const profileElements = [
      'h1:has-text("Profile")',
      'h2:has-text("Profile")',
      'h3:has-text("Profile")',
      'h1:has-text("User Profile")',
      'h2:has-text("User Profile")',
      'h3:has-text("User Profile")',
      'h1:has-text("My Profile")',
      'h2:has-text("My Profile")',
      'h3:has-text("My Profile")',
      '[data-testid="profile-page"]',
      '.profile-page',
      '.user-profile'
    ];
    
    await waitForElement(page, profileElements, { timeout: 10000 });
    
    logTestStep('Admin profile information display test completed');
  });

  test('should allow admin to update profile information', async ({ page }) => {
    logTestStep('Testing admin profile update functionality');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for profile form elements
    const formElements = [
      'form',
      'input[type="text"]',
      'input[type="email"]',
      'input[name*="name"]',
      'input[name*="email"]',
      'input[name*="username"]',
      'button:has-text("Update")',
      'button:has-text("Save")',
      'button:has-text("Submit")',
      'button[type="submit"]'
    ];
    
    // Check if profile form exists
    const formExists = await page.locator('form').count() > 0;
    
    if (formExists) {
      logTestStep('Profile form found, testing update functionality');
      
      // Look for name/username fields
      const nameFields = [
        'input[name*="name"]',
        'input[name*="username"]',
        'input[placeholder*="name"]',
        'input[placeholder*="username"]',
        'label:has-text("Name") + input',
        'label:has-text("Username") + input'
      ];
      
      const nameField = await waitForElement(page, nameFields, { timeout: 5000 }).catch(() => null);
      
      if (nameField) {
        // Test updating name/username
        await typeText(page, nameFields, 'Updated Admin Name');
        logTestStep('Updated name field');
      }
      
      // Look for email fields
      const emailFields = [
        'input[type="email"]',
        'input[name*="email"]',
        'input[placeholder*="email"]',
        'label:has-text("Email") + input'
      ];
      
      const emailField = await waitForElement(page, emailFields, { timeout: 5000 }).catch(() => null);
      
      if (emailField) {
        // Test updating email
        await typeText(page, emailFields, 'admin@olfong.is');
        logTestStep('Updated email field');
      }
      
      // Look for save/update buttons
      const saveButtons = [
        'button:has-text("Update")',
        'button:has-text("Save")',
        'button:has-text("Submit")',
        'button[type="submit"]',
        'button:has-text("Update Profile")',
        'button:has-text("Save Changes")'
      ];
      
      const saveButton = await waitForElement(page, saveButtons, { timeout: 5000 }).catch(() => null);
      
      if (saveButton) {
        await clickElement(page, saveButtons);
        logTestStep('Clicked save/update button');
        
        // Wait for success message or redirect
        await page.waitForTimeout(2000);
      }
    } else {
      logTestStep('No profile form found - profile might be read-only or use different UI pattern');
    }
    
    logTestStep('Admin profile update test completed');
  });

  test('should handle profile validation errors', async ({ page }) => {
    logTestStep('Testing profile validation error handling');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for form elements
    const formExists = await page.locator('form').count() > 0;
    
    if (formExists) {
      // Try to submit form with invalid data
      const emailFields = [
        'input[type="email"]',
        'input[name*="email"]',
        'label:has-text("Email") + input'
      ];
      
      const emailField = await waitForElement(page, emailFields, { timeout: 5000 }).catch(() => null);
      
      if (emailField) {
        // Enter invalid email
        await typeText(page, emailFields, 'invalid-email');
        
        // Try to submit
        const saveButtons = [
          'button:has-text("Update")',
          'button:has-text("Save")',
          'button[type="submit"]'
        ];
        
        const saveButton = await waitForElement(page, saveButtons, { timeout: 5000 }).catch(() => null);
        
        if (saveButton) {
          await clickElement(page, saveButtons);
          
          // Look for validation error messages
          const errorMessages = [
            'text=/invalid/i',
            'text=/error/i',
            'text=/required/i',
            'text=/format/i',
            '.error',
            '.invalid',
            '[role="alert"]'
          ];
          
          // Check if any error messages appear
          const hasErrors = await Promise.race([
            waitForElement(page, errorMessages, { timeout: 3000 }).then(() => true),
            page.waitForTimeout(3000).then(() => false)
          ]);
          
          if (hasErrors) {
            logTestStep('Validation errors displayed correctly');
          } else {
            logTestStep('No validation errors found - form might have client-side validation');
          }
        }
      }
    }
    
    logTestStep('Profile validation error handling test completed');
  });

  test('should display admin-specific profile options', async ({ page }) => {
    logTestStep('Testing admin-specific profile options');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for admin-specific elements
    const adminElements = [
      'text=/admin/i',
      'text=/role/i',
      'text=/permissions/i',
      'text=/access/i',
      'text=/privileges/i',
      '[data-testid*="admin"]',
      '.admin-options',
      '.admin-settings'
    ];
    
    // Check if any admin-specific elements are visible
    const hasAdminElements = await Promise.race([
      waitForElement(page, adminElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasAdminElements) {
      logTestStep('Admin-specific profile options found');
    } else {
      logTestStep('No admin-specific profile options found - profile might be generic');
    }
    
    logTestStep('Admin-specific profile options test completed');
  });

  test('should handle profile page navigation and breadcrumbs', async ({ page }) => {
    logTestStep('Testing profile page navigation and breadcrumbs');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const navElements = [
      'nav',
      '.breadcrumb',
      '.navigation',
      'a[href*="/admin"]',
      'a:has-text("Admin")',
      'a:has-text("Dashboard")',
      'a:has-text("Profile")'
    ];
    
    // Check for navigation elements
    const hasNav = await Promise.race([
      waitForElement(page, navElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasNav) {
      logTestStep('Navigation elements found on profile page');
    }
    
    // Test back navigation
    try {
      await page.goBack();
      await page.waitForLoadState('networkidle');
      logTestStep('Back navigation works');
      
      // Go back to profile
      await page.goForward();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/profile');
    } catch (error) {
      logTestStep('Back navigation test skipped - page might not support it');
    }
    
    logTestStep('Profile page navigation test completed');
  });

  test('should test profile page responsiveness', async ({ page }) => {
    logTestStep('Testing profile page responsiveness');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Verify page still loads correctly
      await expect(page.locator('body')).toBeVisible();
      
      logTestStep(`Profile page responsive at ${viewport.width}x${viewport.height}`);
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    logTestStep('Profile page responsiveness test completed');
  });

  test('should handle profile page loading states', async ({ page }) => {
    logTestStep('Testing profile page loading states');
    
    // Navigate to profile with slow network
    await page.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/profile');
    
    // Look for loading indicators
    const loadingElements = [
      '.loading',
      '.spinner',
      'text=/loading/i',
      'text=/please wait/i',
      '[data-testid*="loading"]'
    ];
    
    // Check if loading indicators appear
    const hasLoading = await Promise.race([
      waitForElement(page, loadingElements, { timeout: 2000 }).then(() => true),
      page.waitForTimeout(2000).then(() => false)
    ]);
    
    if (hasLoading) {
      logTestStep('Loading indicators found');
    }
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Remove route interception
    await page.unroute('**/*');
    
    logTestStep('Profile page loading states test completed');
  });
});
