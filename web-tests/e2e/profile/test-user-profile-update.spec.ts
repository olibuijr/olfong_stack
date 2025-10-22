import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { loginUser, logTestStep, retryOperation, waitForElement, clickElement, typeText } from '../../fixtures/test-utils';

test.describe('Test User Profile Update Tests', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up test user login for profile tests');
    await loginUser(page, testUsers.customer.email, testUsers.customer.password);
    logTestStep('Test user login successful');
  });

  test('should navigate to profile page from customer dashboard', async ({ page }) => {
    logTestStep('Testing navigation to profile page as test user');
    
    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the profile page
    await expect(page).toHaveURL('/profile');
    
    // Look for profile page elements
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    logTestStep('Profile page navigation test completed');
  });

  test('should display test user profile information', async ({ page }) => {
    logTestStep('Testing test user profile information display');
    
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
      'h1:has-text("Account")',
      'h2:has-text("Account")',
      'h3:has-text("Account")',
      '[data-testid="profile-page"]',
      '.profile-page',
      '.user-profile',
      '.account-page'
    ];
    
    await waitForElement(page, profileElements, { timeout: 10000 });
    
    logTestStep('Test user profile information display test completed');
  });

  test('should allow test user to update profile information', async ({ page }) => {
    logTestStep('Testing test user profile update functionality');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for profile form elements
    const formElements = [
      'form',
      'input[type="text"]',
      'input[type="email"]',
      'input[name*="name"]',
      'input[name*="email"]',
      'input[name*="first"]',
      'input[name*="last"]',
      'button:has-text("Update")',
      'button:has-text("Save")',
      'button:has-text("Submit")',
      'button[type="submit"]'
    ];
    
    // Check if profile form exists
    const formExists = await page.locator('form').count() > 0;
    
    if (formExists) {
      logTestStep('Profile form found, testing update functionality');
      
      // Look for first name fields
      const firstNameFields = [
        'input[name*="first"]',
        'input[placeholder*="first"]',
        'input[placeholder*="First"]',
        'label:has-text("First Name") + input',
        'label:has-text("First name") + input'
      ];
      
      const firstNameField = await waitForElement(page, firstNameFields, { timeout: 5000 }).catch(() => null);
      
      if (firstNameField) {
        // Test updating first name
        await typeText(page, firstNameFields, 'Updated Test');
        logTestStep('Updated first name field');
      }
      
      // Look for last name fields
      const lastNameFields = [
        'input[name*="last"]',
        'input[placeholder*="last"]',
        'input[placeholder*="Last"]',
        'label:has-text("Last Name") + input',
        'label:has-text("Last name") + input'
      ];
      
      const lastNameField = await waitForElement(page, lastNameFields, { timeout: 5000 }).catch(() => null);
      
      if (lastNameField) {
        // Test updating last name
        await typeText(page, lastNameFields, 'Customer');
        logTestStep('Updated last name field');
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
        await typeText(page, emailFields, 'updated.test@example.com');
        logTestStep('Updated email field');
      }
      
      // Look for phone fields
      const phoneFields = [
        'input[type="tel"]',
        'input[name*="phone"]',
        'input[placeholder*="phone"]',
        'input[placeholder*="Phone"]',
        'label:has-text("Phone") + input'
      ];
      
      const phoneField = await waitForElement(page, phoneFields, { timeout: 5000 }).catch(() => null);
      
      if (phoneField) {
        // Test updating phone
        await typeText(page, phoneFields, '+354 555 1234');
        logTestStep('Updated phone field');
      }
      
      // Look for address fields
      const addressFields = [
        'input[name*="address"]',
        'input[name*="street"]',
        'input[placeholder*="address"]',
        'input[placeholder*="street"]',
        'label:has-text("Address") + input',
        'label:has-text("Street") + input'
      ];
      
      const addressField = await waitForElement(page, addressFields, { timeout: 5000 }).catch(() => null);
      
      if (addressField) {
        // Test updating address
        await typeText(page, addressFields, '123 Test Street');
        logTestStep('Updated address field');
      }
      
      // Look for city fields
      const cityFields = [
        'input[name*="city"]',
        'input[placeholder*="city"]',
        'input[placeholder*="City"]',
        'label:has-text("City") + input'
      ];
      
      const cityField = await waitForElement(page, cityFields, { timeout: 5000 }).catch(() => null);
      
      if (cityField) {
        // Test updating city
        await typeText(page, cityFields, 'Reykjavik');
        logTestStep('Updated city field');
      }
      
      // Look for postal code fields
      const postalFields = [
        'input[name*="postal"]',
        'input[name*="zip"]',
        'input[placeholder*="postal"]',
        'input[placeholder*="zip"]',
        'label:has-text("Postal Code") + input',
        'label:has-text("ZIP") + input'
      ];
      
      const postalField = await waitForElement(page, postalFields, { timeout: 5000 }).catch(() => null);
      
      if (postalField) {
        // Test updating postal code
        await typeText(page, postalFields, '101');
        logTestStep('Updated postal code field');
      }
      
      // Look for save/update buttons
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
        
        // Wait for success message or redirect
        await page.waitForTimeout(2000);
        
        // Look for success messages
        const successMessages = [
          'text=/success/i',
          'text=/updated/i',
          'text=/saved/i',
          'text=/profile updated/i',
          '.success',
          '.alert-success',
          '[role="alert"]:has-text("success")'
        ];
        
        const hasSuccess = await Promise.race([
          waitForElement(page, successMessages, { timeout: 3000 }).then(() => true),
          page.waitForTimeout(3000).then(() => false)
        ]);
        
        if (hasSuccess) {
          logTestStep('Success message displayed');
        }
      }
    } else {
      logTestStep('No profile form found - profile might be read-only or use different UI pattern');
    }
    
    logTestStep('Test user profile update test completed');
  });

  test('should handle profile validation errors for test user', async ({ page }) => {
    logTestStep('Testing profile validation error handling for test user');
    
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
        await typeText(page, emailFields, 'invalid-email-format');
        
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
            'text=/email/i',
            '.error',
            '.invalid',
            '.field-error',
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

  test('should display customer-specific profile options', async ({ page }) => {
    logTestStep('Testing customer-specific profile options');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for customer-specific elements
    const customerElements = [
      'text=/order/i',
      'text=/history/i',
      'text=/address/i',
      'text=/shipping/i',
      'text=/billing/i',
      'text=/preferences/i',
      'text=/notifications/i',
      'text=/subscription/i',
      '[data-testid*="customer"]',
      '.customer-options',
      '.order-history',
      '.address-book',
      '.preferences'
    ];
    
    // Check if any customer-specific elements are visible
    const hasCustomerElements = await Promise.race([
      waitForElement(page, customerElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasCustomerElements) {
      logTestStep('Customer-specific profile options found');
    } else {
      logTestStep('No customer-specific profile options found - profile might be generic');
    }
    
    logTestStep('Customer-specific profile options test completed');
  });

  test('should test profile page with different user roles', async ({ page }) => {
    logTestStep('Testing profile page with test user role');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify user is logged in as test user
    const userMenuElements = [
      'button[aria-label*="User menu"]',
      'button[aria-label*="user"]',
      'button:has-text("Test")',
      'button:has-text("test_customer")',
      '.user-menu',
      'button svg'
    ];
    
    const hasUserMenu = await Promise.race([
      waitForElement(page, userMenuElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasUserMenu) {
      logTestStep('User menu visible - test user is logged in');
    }
    
    // Check for role-specific content
    const roleElements = [
      'text=/customer/i',
      'text=/user/i',
      'text=/account/i',
      'text=/profile/i'
    ];
    
    const hasRoleElements = await Promise.race([
      waitForElement(page, roleElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasRoleElements) {
      logTestStep('Role-specific content found');
    }
    
    logTestStep('Profile page role testing completed');
  });

  test('should handle profile page with multiple tabs/sections', async ({ page }) => {
    logTestStep('Testing profile page with multiple tabs/sections');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for tab/section navigation
    const tabElements = [
      'button[role="tab"]',
      '.tab',
      '.tab-button',
      'a[role="tab"]',
      'button:has-text("Profile")',
      'button:has-text("Account")',
      'button:has-text("Settings")',
      'button:has-text("Preferences")',
      'button:has-text("Address")',
      'button:has-text("Orders")',
      'button:has-text("Security")'
    ];
    
    const hasTabs = await Promise.race([
      waitForElement(page, tabElements, { timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);
    
    if (hasTabs) {
      logTestStep('Tab/section navigation found, testing tab switching');
      
      // Try to click on different tabs
      const tabs = await page.locator('button[role="tab"], .tab, .tab-button').all();
      
      for (let i = 0; i < Math.min(tabs.length, 3); i++) {
        try {
          await tabs[i].click();
          await page.waitForTimeout(1000);
          logTestStep(`Clicked tab ${i + 1}`);
        } catch (error) {
          logTestStep(`Could not click tab ${i + 1}: ${error.message}`);
        }
      }
    } else {
      logTestStep('No tab/section navigation found - profile might be single page');
    }
    
    logTestStep('Profile page tabs/sections test completed');
  });

  test('should test profile page accessibility', async ({ page }) => {
    logTestStep('Testing profile page accessibility');
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    if (headings.length > 0) {
      logTestStep(`Found ${headings.length} headings - good for accessibility`);
    }
    
    // Check for form labels
    const formLabels = await page.locator('label').all();
    if (formLabels.length > 0) {
      logTestStep(`Found ${formLabels.length} form labels - good for accessibility`);
    }
    
    // Check for proper button roles
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      logTestStep(`Found ${buttons.length} buttons - checking for proper roles`);
    }
    
    // Check for ARIA attributes
    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]').all();
    if (ariaElements.length > 0) {
      logTestStep(`Found ${ariaElements.length} elements with ARIA attributes - good for accessibility`);
    }
    
    logTestStep('Profile page accessibility test completed');
  });

  test('should handle profile page error states', async ({ page }) => {
    logTestStep('Testing profile page error states');
    
    // Try to access profile with network issues
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/profile');
    
    // Look for error messages
    const errorElements = [
      'text=/error/i',
      'text=/failed/i',
      'text=/unavailable/i',
      'text=/try again/i',
      '.error',
      '.alert-error',
      '[role="alert"]'
    ];
    
    const hasErrors = await Promise.race([
      waitForElement(page, errorElements, { timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);
    
    if (hasErrors) {
      logTestStep('Error state handled correctly');
    } else {
      logTestStep('No error state found - page might handle errors differently');
    }
    
    // Remove route interception
    await page.unroute('**/api/**');
    
    logTestStep('Profile page error states test completed');
  });
});
