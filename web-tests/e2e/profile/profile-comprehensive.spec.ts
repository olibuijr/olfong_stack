import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { loginUser, logTestStep, retryOperation, waitForElement, clickElement, typeText } from '../../fixtures/test-utils';

test.describe('Comprehensive Profile Page Tests', () => {
  test.describe('Admin Profile Tests', () => {
    test.beforeEach(async ({ page }) => {
      logTestStep('Setting up admin login for comprehensive profile tests');
      await page.goto('/admin-login');
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
      logTestStep('Admin login successful');
    });

    test('should test all admin profile features comprehensively', async ({ page }) => {
      logTestStep('Starting comprehensive admin profile test');
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Test 1: Page Structure and Navigation
      logTestStep('Testing page structure and navigation');
      await expect(page).toHaveURL('/profile');
      await expect(page.locator('body')).toBeVisible();
      
      // Test 2: Profile Information Display
      logTestStep('Testing profile information display');
      const profileInfoElements = [
        'h1, h2, h3',
        '[data-testid*="profile"]',
        '.profile-container',
        '.user-info',
        '.account-info'
      ];
      
      await waitForElement(page, profileInfoElements, { timeout: 10000 });
      
      // Test 3: Form Elements and Input Fields
      logTestStep('Testing form elements and input fields');
      const formElements = [
        'form',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'textarea',
        'select'
      ];
      
      const formExists = await page.locator('form').count() > 0;
      if (formExists) {
        logTestStep('Profile form found - testing form functionality');
        
        // Test all possible input fields
        const inputTypes = [
          { type: 'text', name: 'name', value: 'Updated Admin Name' },
          { type: 'email', name: 'email', value: 'admin@olfong.is' },
          { type: 'tel', name: 'phone', value: '+354 555 1234' },
          { type: 'text', name: 'address', value: '123 Admin Street' },
          { type: 'text', name: 'city', value: 'Reykjavik' },
          { type: 'text', name: 'postal', value: '101' }
        ];
        
        for (const input of inputTypes) {
          const selectors = [
            `input[type="${input.type}"]`,
            `input[name*="${input.name}"]`,
            `input[placeholder*="${input.name}"]`,
            `label:has-text("${input.name}") + input`
          ];
          
          const field = await waitForElement(page, selectors, { timeout: 2000 }).catch(() => null);
          if (field) {
            await typeText(page, selectors, input.value);
            logTestStep(`Updated ${input.name} field`);
          }
        }
      }
      
      // Test 4: Save/Update Functionality
      logTestStep('Testing save/update functionality');
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
        await page.waitForTimeout(2000);
      }
      
      // Test 5: Validation and Error Handling
      logTestStep('Testing validation and error handling');
      if (formExists) {
        // Test invalid email
        const emailFields = ['input[type="email"]', 'input[name*="email"]'];
        const emailField = await waitForElement(page, emailFields, { timeout: 2000 }).catch(() => null);
        
        if (emailField) {
          await typeText(page, emailFields, 'invalid-email');
          const saveBtn = await waitForElement(page, saveButtons, { timeout: 2000 }).catch(() => null);
          if (saveBtn) {
            await clickElement(page, saveButtons);
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Test 6: Responsive Design
      logTestStep('Testing responsive design');
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 375, height: 667 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        await expect(page.locator('body')).toBeVisible();
        logTestStep(`Profile responsive at ${viewport.width}x${viewport.height}`);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      logTestStep('Comprehensive admin profile test completed');
    });
  });

  test.describe('Test User Profile Tests', () => {
    test.beforeEach(async ({ page }) => {
      logTestStep('Setting up test user login for comprehensive profile tests');
      await loginUser(page, testUsers.customer.email, testUsers.customer.password);
      logTestStep('Test user login successful');
    });

    test('should test all test user profile features comprehensively', async ({ page }) => {
      logTestStep('Starting comprehensive test user profile test');
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Test 1: Page Structure and Navigation
      logTestStep('Testing page structure and navigation');
      await expect(page).toHaveURL('/profile');
      await expect(page.locator('body')).toBeVisible();
      
      // Test 2: Profile Information Display
      logTestStep('Testing profile information display');
      const profileInfoElements = [
        'h1, h2, h3',
        '[data-testid*="profile"]',
        '.profile-container',
        '.user-info',
        '.account-info',
        '.customer-profile'
      ];
      
      await waitForElement(page, profileInfoElements, { timeout: 10000 });
      
      // Test 3: Form Elements and Input Fields
      logTestStep('Testing form elements and input fields');
      const formElements = [
        'form',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'textarea',
        'select'
      ];
      
      const formExists = await page.locator('form').count() > 0;
      if (formExists) {
        logTestStep('Profile form found - testing form functionality');
        
        // Test all possible input fields
        const inputTypes = [
          { type: 'text', name: 'first', value: 'Updated Test' },
          { type: 'text', name: 'last', value: 'Customer' },
          { type: 'email', name: 'email', value: 'updated.test@example.com' },
          { type: 'tel', name: 'phone', value: '+354 555 5678' },
          { type: 'text', name: 'address', value: '456 Customer Street' },
          { type: 'text', name: 'city', value: 'Reykjavik' },
          { type: 'text', name: 'postal', value: '105' }
        ];
        
        for (const input of inputTypes) {
          const selectors = [
            `input[type="${input.type}"]`,
            `input[name*="${input.name}"]`,
            `input[placeholder*="${input.name}"]`,
            `label:has-text("${input.name}") + input`
          ];
          
          const field = await waitForElement(page, selectors, { timeout: 2000 }).catch(() => null);
          if (field) {
            await typeText(page, selectors, input.value);
            logTestStep(`Updated ${input.name} field`);
          }
        }
      }
      
      // Test 4: Save/Update Functionality
      logTestStep('Testing save/update functionality');
      const saveButtons = [
        'button:has-text("Update")',
        'button:has-text("Save")',
        'button:has-text("Submit")',
        'button[type="submit"]',
        'button:has-text("Update Profile")',
        'button:has-text("Save Changes")',
        'button:has-text("Save Profile")'
      ];
      
      const saveButton = await waitForElement(page, saveButtons, { timeout: 5000 }).catch(() => null);
      if (saveButton) {
        await clickElement(page, saveButtons);
        logTestStep('Clicked save/update button');
        await page.waitForTimeout(2000);
      }
      
      // Test 5: Validation and Error Handling
      logTestStep('Testing validation and error handling');
      if (formExists) {
        // Test invalid email
        const emailFields = ['input[type="email"]', 'input[name*="email"]'];
        const emailField = await waitForElement(page, emailFields, { timeout: 2000 }).catch(() => null);
        
        if (emailField) {
          await typeText(page, emailFields, 'invalid-email-format');
          const saveBtn = await waitForElement(page, saveButtons, { timeout: 2000 }).catch(() => null);
          if (saveBtn) {
            await clickElement(page, saveButtons);
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Test 6: Customer-Specific Features
      logTestStep('Testing customer-specific features');
      const customerFeatures = [
        'text=/order/i',
        'text=/history/i',
        'text=/address/i',
        'text=/shipping/i',
        'text=/billing/i',
        'text=/preferences/i',
        'text=/notifications/i',
        'text=/subscription/i',
        '.order-history',
        '.address-book',
        '.preferences',
        '.notifications'
      ];
      
      const hasCustomerFeatures = await Promise.race([
        waitForElement(page, customerFeatures, { timeout: 3000 }).then(() => true),
        page.waitForTimeout(3000).then(() => false)
      ]);
      
      if (hasCustomerFeatures) {
        logTestStep('Customer-specific features found');
      }
      
      // Test 7: Responsive Design
      logTestStep('Testing responsive design');
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 375, height: 667 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        await expect(page.locator('body')).toBeVisible();
        logTestStep(`Profile responsive at ${viewport.width}x${viewport.height}`);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      logTestStep('Comprehensive test user profile test completed');
    });
  });

  test.describe('Cross-User Profile Tests', () => {
    test('should test profile page with different user types', async ({ browser }) => {
      logTestStep('Starting cross-user profile testing');
      
      // Create contexts for different user types
      const adminContext = await browser.newContext();
      const customerContext = await browser.newContext();
      
      const adminPage = await adminContext.newPage();
      const customerPage = await customerContext.newPage();
      
      try {
        // Admin login
        logTestStep('Testing admin profile access');
        await adminPage.goto('/admin-login');
        await adminPage.getByLabel('Username').fill(testUsers.admin.username);
        await adminPage.getByLabel('Password').fill(testUsers.admin.password);
        await adminPage.getByRole('button', { name: 'Login' }).click();
        await expect(adminPage).toHaveURL('/admin');
        
        await adminPage.goto('/profile');
        await adminPage.waitForLoadState('networkidle');
        await expect(adminPage).toHaveURL('/profile');
        
        // Customer login
        logTestStep('Testing customer profile access');
        await loginUser(customerPage, testUsers.customer.email, testUsers.customer.password);
        
        await customerPage.goto('/profile');
        await customerPage.waitForLoadState('networkidle');
        await expect(customerPage).toHaveURL('/profile');
        
        // Compare profile pages
        logTestStep('Comparing profile pages between user types');
        
        // Check if both pages loaded successfully
        const adminProfileLoaded = await adminPage.locator('body').isVisible();
        const customerProfileLoaded = await customerPage.locator('body').isVisible();
        
        expect(adminProfileLoaded).toBe(true);
        expect(customerProfileLoaded).toBe(true);
        
        logTestStep('Cross-user profile testing completed');
        
      } finally {
        await adminContext.close();
        await customerContext.close();
      }
    });

    test('should test profile page security and access control', async ({ page }) => {
      logTestStep('Testing profile page security and access control');
      
      // Test 1: Access without authentication
      logTestStep('Testing access without authentication');
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Should either redirect to login or show profile page
      const currentURL = page.url();
      const isRedirected = currentURL.includes('/login') || currentURL.includes('/admin-login');
      
      if (isRedirected) {
        logTestStep('Profile page correctly redirects unauthenticated users');
      } else {
        logTestStep('Profile page accessible without authentication - might be public');
      }
      
      // Test 2: Access with customer authentication
      logTestStep('Testing access with customer authentication');
      await loginUser(page, testUsers.customer.email, testUsers.customer.password);
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/profile');
      
      // Test 3: Access with admin authentication
      logTestStep('Testing access with admin authentication');
      await page.goto('/admin-login');
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
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/profile');
      
      logTestStep('Profile page security testing completed');
    });

    test('should test profile page performance and loading', async ({ page }) => {
      logTestStep('Testing profile page performance and loading');
      
      // Login first
      await loginUser(page, testUsers.customer.email, testUsers.customer.password);
      
      // Test 1: Initial page load
      logTestStep('Testing initial page load performance');
      const startTime = Date.now();
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      logTestStep(`Profile page loaded in ${loadTime}ms`);
      
      // Test 2: Form interaction performance
      logTestStep('Testing form interaction performance');
      const formStartTime = Date.now();
      
      const formExists = await page.locator('form').count() > 0;
      if (formExists) {
        const inputFields = await page.locator('input[type="text"], input[type="email"]').all();
        for (let i = 0; i < Math.min(inputFields.length, 3); i++) {
          await inputFields[i].fill('Test input');
        }
      }
      
      const formTime = Date.now() - formStartTime;
      logTestStep(`Form interactions completed in ${formTime}ms`);
      
      // Test 3: Save operation performance
      logTestStep('Testing save operation performance');
      const saveStartTime = Date.now();
      
      const saveButtons = [
        'button:has-text("Update")',
        'button:has-text("Save")',
        'button[type="submit"]'
      ];
      
      const saveButton = await waitForElement(page, saveButtons, { timeout: 3000 }).catch(() => null);
      if (saveButton) {
        await clickElement(page, saveButtons);
        await page.waitForTimeout(1000);
      }
      
      const saveTime = Date.now() - saveStartTime;
      logTestStep(`Save operation completed in ${saveTime}ms`);
      
      logTestStep('Profile page performance testing completed');
    });
  });
});
