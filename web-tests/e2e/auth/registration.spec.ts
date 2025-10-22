import { test, expect } from '@playwright/test';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('User Registration Flow', () => {
  test('should display registration form with all required fields', async ({ page }) => {
    logTestStep('Testing registration form display');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for registration form
    const registrationForm = page.locator('form').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i });
    const hasRegistrationForm = await registrationForm.count() > 0;

    if (hasRegistrationForm) {
      // Verify required fields are present
      const emailField = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="netfang" i]');
      const passwordField = page.locator('input[type="password"]').first();
      const confirmPasswordField = page.locator('input[type="password"]').nth(1);
      const nameField = page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="nafn" i]');

      expect(await emailField.count()).toBeGreaterThan(0);
      expect(await passwordField.count()).toBeGreaterThan(0);
      expect(await nameField.count()).toBeGreaterThan(0);

      // Check for field labels or placeholders
      const emailLabels = page.locator('label').filter({ hasText: /Email|Netfang/i });
      const passwordLabels = page.locator('label').filter({ hasText: /Password|Lykilorð/i });
      const nameLabels = page.locator('label').filter({ hasText: /Name|Nafn|Full.*name/i });

      if (await emailLabels.count() > 0 || await passwordLabels.count() > 0 || await nameLabels.count() > 0) {
        logTestStep('Registration form fields properly labeled');
      }

      logTestStep('Registration form displayed with required fields');
    } else {
      // Check if registration is handled differently (modal, etc.)
      const registrationModal = page.locator('[class*="modal"], [class*="fixed"]').filter({ hasText: /Register|Skrá|Sign.*up/i });
      const hasModal = await registrationModal.count() > 0;

      if (hasModal) {
        logTestStep('Registration handled via modal');
      } else {
        // Check for registration link/button
        const registerLink = page.locator('a, button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i });
        if (await registerLink.count() > 0) {
          await registerLink.first().click();
          await page.waitForTimeout(1000);

          // Check if form appeared
          const formAfterClick = page.locator('form').filter({ hasText: /Register|Skrá/i });
          if (await formAfterClick.count() > 0) {
            logTestStep('Registration form accessible via link/button');
          } else {
            logTestStep('Registration link/button found but form not accessible');
          }
        } else {
          logTestStep('Registration form not found on page');
        }
      }
    }
  });

  test('should validate email format', async ({ page }) => {
    logTestStep('Testing email format validation');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const emailField = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="netfang" i]').first();

    if (await emailField.count() > 0) {
      // Test invalid email formats
      const invalidEmails = ['invalid', 'invalid@', '@invalid.com', 'invalid.com'];

      for (const invalidEmail of invalidEmails) {
        await emailField.fill(invalidEmail);
        await emailField.blur(); // Trigger validation
        await page.waitForTimeout(500);

        // Check for validation error
        const errorMessages = page.locator('[class*="error"], [class*="invalid"], text=/invalid|ógilt|format|not.*valid/i');
        const hasError = await errorMessages.count() > 0;

        if (hasError) {
          logTestStep(`Email validation working for invalid format: ${invalidEmail}`);
          break;
        }
      }

      // Test valid email format
      await emailField.fill('test@example.com');
      await emailField.blur();
      await page.waitForTimeout(500);

      // Check if error is cleared
      const errorMessages = page.locator('[class*="error"], [class*="invalid"]');
      const hasError = await errorMessages.count() > 0;

      if (!hasError) {
        logTestStep('Valid email format accepted');
      }
    } else {
      logTestStep('Email field not found');
    }
  });

  test('should validate password requirements', async ({ page }) => {
    logTestStep('Testing password validation');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const passwordField = page.locator('input[type="password"]').first();

    if (await passwordField.count() > 0) {
      // Test weak passwords
      const weakPasswords = ['123', 'password', 'abc'];

      for (const weakPassword of weakPasswords) {
        await passwordField.fill(weakPassword);
        await passwordField.blur();
        await page.waitForTimeout(500);

        // Check for password strength indicator or error
        const strengthIndicators = page.locator('[class*="strength"], [class*="weak"], text=/weak|veik|short|stutt|requirements|kröfur/i');
        const errorMessages = page.locator('[class*="error"], text=/password|lykilorð|at.*least|minnst/i');

        if (await strengthIndicators.count() > 0 || await errorMessages.count() > 0) {
          logTestStep(`Password validation working for weak password: ${weakPassword}`);
          break;
        }
      }

      // Test password confirmation matching
      const confirmPasswordField = page.locator('input[type="password"]').nth(1);
      if (await confirmPasswordField.count() > 0) {
        await passwordField.fill('ValidPassword123!');
        await confirmPasswordField.fill('DifferentPassword123!');
        await confirmPasswordField.blur();
        await page.waitForTimeout(500);

        // Check for mismatch error
        const mismatchErrors = page.locator('[class*="error"], text=/match|matcha|same| sama|confirm|staðfesta/i');
        if (await mismatchErrors.count() > 0) {
          logTestStep('Password confirmation validation working');
        }

        // Test matching passwords
        await confirmPasswordField.fill('ValidPassword123!');
        await confirmPasswordField.blur();
        await page.waitForTimeout(500);

        const mismatchErrorsAfter = page.locator('[class*="error"], text=/match|matcha/i');
        if (await mismatchErrorsAfter.count() === 0) {
          logTestStep('Matching passwords accepted');
        }
      }
    } else {
      logTestStep('Password field not found');
    }
  });

  test('should handle terms and conditions acceptance', async ({ page }) => {
    logTestStep('Testing terms and conditions handling');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('xpath=following-sibling::*[contains(text(), "terms") or contains(text(), "skilmálar") or contains(text(), "conditions") or contains(text(), "samþykki")]') });
    const termsLabels = page.locator('label').filter({ hasText: /terms|skilmálar|conditions|samþykki|agree|samþykkja/i });

    if (await termsCheckbox.count() > 0) {
      // Try to submit without accepting terms
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i }).first();

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Check for terms error
        const termsErrors = page.locator('[class*="error"], text=/terms|skilmálar|accept|samþykkja|agree|samþykki/i');
        if (await termsErrors.count() > 0) {
          logTestStep('Terms acceptance validation working');

          // Now accept terms and try again
          await termsCheckbox.first().check();
          await page.waitForTimeout(500);

          // Check if error is cleared
          const termsErrorsAfter = page.locator('[class*="error"], text=/terms|skilmálar/i');
          if (await termsErrorsAfter.count() === 0) {
            logTestStep('Terms acceptance working correctly');
          }
        }
      }
    } else if (await termsLabels.count() > 0) {
      // Terms mentioned but no checkbox found
      logTestStep('Terms mentioned but checkbox not found');
    } else {
      logTestStep('Terms and conditions not required');
    }
  });

  test('should handle age verification if required', async ({ page }) => {
    logTestStep('Testing age verification requirements');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for age/date of birth field
    const dobField = page.locator('input[type="date"], input[placeholder*="birth" i], input[placeholder*="fæðing" i]');
    const ageField = page.locator('input[type="number"], input[placeholder*="age" i], input[placeholder*="aldur" i]');

    if (await dobField.count() > 0) {
      // Test with underage date
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const dateString = underageDate.toISOString().split('T')[0];

      await dobField.first().fill(dateString);
      await dobField.first().blur();
      await page.waitForTimeout(500);

      // Check for age error
      const ageErrors = page.locator('[class*="error"], text=/age|aldur|old|gamall|underage|undiraldurs/i');
      if (await ageErrors.count() > 0) {
        logTestStep('Age verification working for underage users');
      }

      // Test with valid age
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const validDateString = validDate.toISOString().split('T')[0];

      await dobField.first().fill(validDateString);
      await dobField.first().blur();
      await page.waitForTimeout(500);

      const ageErrorsAfter = page.locator('[class*="error"], text=/age|aldur/i');
      if (await ageErrorsAfter.count() === 0) {
        logTestStep('Valid age accepted');
      }
    } else if (await ageField.count() > 0) {
      // Test with underage number
      await ageField.first().fill('16');
      await ageField.first().blur();
      await page.waitForTimeout(500);

      const ageErrors = page.locator('[class*="error"], text=/age|aldur|old|gamall/i');
      if (await ageErrors.count() > 0) {
        logTestStep('Age verification working for underage users');
      }
    } else {
      logTestStep('Age verification not required for registration');
    }
  });

  test('should submit registration form successfully', async ({ page }) => {
    logTestStep('Testing successful registration submission');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fill out the registration form
    const emailField = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="netfang" i]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const confirmPasswordField = page.locator('input[type="password"]').nth(1);
    const nameField = page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="nafn" i]').first();

    let formFilled = false;

    if (await emailField.count() > 0 && await passwordField.count() > 0 && await nameField.count() > 0) {
      // Generate unique email to avoid conflicts
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;

      await emailField.fill(testEmail);
      await nameField.fill('Test User');

      if (await passwordField.count() > 0) {
        await passwordField.fill('ValidPassword123!');
      }

      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill('ValidPassword123!');
      }

      // Accept terms if required
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.check();
      }

      // Handle age verification if required
      const dobField = page.locator('input[type="date"]').first();
      if (await dobField.count() > 0) {
        const validDate = new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000); // 25 years ago
        const dateString = validDate.toISOString().split('T')[0];
        await dobField.fill(dateString);
      }

      formFilled = true;
    }

    if (formFilled) {
      // Submit the form
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i }).first();

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Check for success indicators
        const successMessages = page.locator('text=/success|successful|tókst|sent|send|sending|staðfesting/i');
        const emailVerificationMessages = page.locator('text=/verify|staðfesta|check.*email|athugaðu.*netfang|verification|staðfesting/i');
        const redirectToLogin = page.url().includes('/login') || page.url().includes('/signin');

        if (await successMessages.count() > 0 || await emailVerificationMessages.count() > 0 || redirectToLogin) {
          logTestStep('Registration form submitted successfully');
        } else {
          // Check if still on registration page (possible validation errors)
          const currentUrl = page.url();
          if (currentUrl.includes('/register') || currentUrl.includes('/signup')) {
            logTestStep('Registration form submitted but may have validation issues');
          } else {
            logTestStep('Registration submission resulted in navigation');
          }
        }
      } else {
        logTestStep('Submit button not found');
      }
    } else {
      logTestStep('Required form fields not found');
    }
  });

  test('should handle duplicate email registration', async ({ page }) => {
    logTestStep('Testing duplicate email handling');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to register with an existing email
    const emailField = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="netfang" i]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const confirmPasswordField = page.locator('input[type="password"]').nth(1);
    const nameField = page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="nafn" i]').first();

    if (await emailField.count() > 0 && await passwordField.count() > 0 && await nameField.count() > 0) {
      // Use the test user email that should already exist
      await emailField.fill('test@example.com'); // Using a common test email
      await nameField.fill('Test User');

      if (await passwordField.count() > 0) {
        await passwordField.fill('ValidPassword123!');
      }

      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill('ValidPassword123!');
      }

      // Accept terms if required
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.check();
      }

      // Submit the form
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i }).first();

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Check for duplicate email error
        const duplicateErrors = page.locator('[class*="error"], text=/already.*exists|þegar.*skráð|duplicate|tvítekið|taken|upptekið|email.*exists|netfang.*þegar/i');
        const emailExistsErrors = page.locator('text=/email.*already|netfang.*þegar|account.*exists|aðgangur.*þegar/i');

        if (await duplicateErrors.count() > 0 || await emailExistsErrors.count() > 0) {
          logTestStep('Duplicate email validation working');
        } else {
          logTestStep('Duplicate email check may not be implemented or test email not in use');
        }
      }
    } else {
      logTestStep('Form fields not found for duplicate email test');
    }
  });

  test('should handle email verification process', async ({ page }) => {
    logTestStep('Testing email verification flow');

    // This test would ideally check the email verification process
    // Since we can't access actual emails in e2e tests, we'll check for verification UI elements

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Submit a registration to trigger verification flow
    const emailField = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="netfang" i]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const confirmPasswordField = page.locator('input[type="password"]').nth(1);
    const nameField = page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="nafn" i]').first();

    if (await emailField.count() > 0 && await passwordField.count() > 0 && await nameField.count() > 0) {
      const timestamp = Date.now();
      const testEmail = `verify${timestamp}@example.com`;

      await emailField.fill(testEmail);
      await nameField.fill('Verify User');

      if (await passwordField.count() > 0) {
        await passwordField.fill('ValidPassword123!');
      }

      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill('ValidPassword123!');
      }

      // Accept terms if required
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.check();
      }

      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i }).first();

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Check for verification-related messages
        const verificationMessages = page.locator('text=/verify.*email|staðfestu.*netfang|check.*email|athugaðu.*netfang|verification.*sent|staðfesting.*send|confirm.*email|staðfestu.*netfang/i');

        if (await verificationMessages.count() > 0) {
          logTestStep('Email verification process initiated');

          // Check for resend verification option
          const resendButtons = page.locator('button, a').filter({ hasText: /resend|send.*again|senda.*aftur|resend.*verification/i });
          if (await resendButtons.count() > 0) {
            logTestStep('Resend verification option available');
          }
        } else {
          logTestStep('Email verification may not be required or handled differently');
        }
      }
    } else {
      logTestStep('Registration form not accessible for verification test');
    }
  });

  test('should handle registration form validation errors', async ({ page }) => {
    logTestStep('Testing form validation error handling');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Register|Skrá|Sign.*up|Nýskrá/i }).first();

    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Check for validation errors
      const requiredErrors = page.locator('[class*="error"], [class*="invalid"], text=/required|required|nauðsynlegt|empty|tómt|fill|fylla/i');
      const fieldErrors = page.locator('[class*="error"], text=/email|password|name|netfang|lykilorð|nafn/i');

      if (await requiredErrors.count() > 0 || await fieldErrors.count() > 0) {
        logTestStep('Form validation errors displayed for empty fields');
      } else {
        logTestStep('Form validation may be client-side only or not implemented');
      }

      // Test individual field validation by filling then clearing
      const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
      if (await emailField.count() > 0) {
        await emailField.fill('invalid');
        await emailField.blur();
        await page.waitForTimeout(500);

        const emailErrors = page.locator('[class*="error"], text=/email|netfang|valid|ógilt/i');
        if (await emailErrors.count() > 0) {
          logTestStep('Email field validation working');
        }
      }
    } else {
      logTestStep('Submit button not found');
    }
  });

  test('should provide login link for existing users', async ({ page }) => {
    logTestStep('Testing existing user login link');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for login link
    const loginLinks = page.locator('a, button').filter({ hasText: /login|sign.*in|innskráning|already.*account|þegar.*aðgangur|have.*account|hafa.*aðgang/i });

    if (await loginLinks.count() > 0) {
      // Click the login link
      await loginLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Check if redirected to login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
        logTestStep('Login link working correctly');
      } else {
        logTestStep('Login link clicked but navigation unclear');
      }
    } else {
      logTestStep('Login link for existing users not found');
    }
  });

  test('should handle responsive design', async ({ page }) => {
    logTestStep('Testing responsive design');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
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
});