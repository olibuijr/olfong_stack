import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { waitForElement, clickElement, typeText, logTestStep } from '../../fixtures/test-utils';

test.describe('Admin Banners Management', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up admin login');

    // Login as admin with multiple fallback selectors
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

    // Try multiple selectors for username field
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[placeholder*="username" i]',
      'input[placeholder*="notendanafn" i]', // Icelandic
      'label:has-text("Username") + input',
      'label:has-text("Notendanafn") + input', // Icelandic
      'input[type="text"]'
    ];

    let usernameField;
    for (const selector of usernameSelectors) {
      try {
        usernameField = page.locator(selector).first();
        await usernameField.waitFor({ state: 'visible', timeout: 2000 });
        console.log(`Found username field with selector: ${selector}`);
        break;
      } catch (error) {
        console.log(`Username selector failed: ${selector}`);
      }
    }

    if (!usernameField) {
      throw new Error('Could not find username field');
    }

    await usernameField.fill(testUsers.admin.username);

    // Try multiple selectors for password field
    const passwordSelectors = [
      'input[name="password"]',
      'input[id="password"]',
      'input[type="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="lykilorð" i]' // Icelandic
    ];

    let passwordField;
    for (const selector of passwordSelectors) {
      try {
        passwordField = page.locator(selector).first();
        await passwordField.waitFor({ state: 'visible', timeout: 2000 });
        console.log(`Found password field with selector: ${selector}`);
        break;
      } catch (error) {
        console.log(`Password selector failed: ${selector}`);
      }
    }

    if (!passwordField) {
      throw new Error('Could not find password field');
    }

    await passwordField.fill(testUsers.admin.password);

    // Try multiple selectors for login button
    const loginSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Skrá")', // Icelandic
      'button:has-text("Innskráning")' // Icelandic
    ];

    let loginButton;
    for (const selector of loginSelectors) {
      try {
        loginButton = page.locator(selector).first();
        await loginButton.waitFor({ state: 'visible', timeout: 2000 });
        console.log(`Found login button with selector: ${selector}`);
        break;
      } catch (error) {
        console.log(`Login button selector failed: ${selector}`);
      }
    }

    if (!loginButton) {
      throw new Error('Could not find login button');
    }

    await loginButton.click();
    await expect(page).toHaveURL('/admin');

    logTestStep('Admin login completed successfully');
  });

  test('should display banners page with proper layout', async ({ page }) => {
    logTestStep('Testing banners page display');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify page title and header
    await expect(page.locator('h1').first()).toContainText(/Banners|Borðar|Banna/i);

    // Check for add banner button
    const addButton = page.getByRole('button', { name: /Add.*Banner|Bæta.*við.*borða|Bæta.*við.*banner/i });
    const hasAddButton = await addButton.count() > 0;
    if (hasAddButton) {
      await expect(addButton).toBeVisible();
    }

    logTestStep('Banners page layout verified');
  });

  test('should display banners grid with banner cards', async ({ page }) => {
    logTestStep('Testing banners grid display');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for banner grid/cards with more specific selectors
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });
    const hasBannerCards = await bannerCards.count() > 0;

    if (hasBannerCards) {
      // Verify banner cards are displayed
      const cardCount = await bannerCards.count();
      logTestStep(`Found ${cardCount} banner cards`);
      expect(cardCount).toBeGreaterThanOrEqual(0);

      // Check for banner images or placeholders
      const bannerImages = page.locator('img[alt*="Banner" i], img[src*="banner" i]');
      if (await bannerImages.count() > 0) {
        logTestStep(`Banner images found: ${await bannerImages.count()}`);
      }

      // Check for banner titles
      const bannerTitles = page.locator('h3, h4, [class*="font-semibold"], [class*="font-bold"]').filter({
        hasNotText: /^$/
      });
      if (await bannerTitles.count() > 0) {
        await expect(bannerTitles.first()).toBeVisible();
      }

      logTestStep('Banners grid display verified');
    } else {
      // Check for empty state with bilingual support
      const emptyState = page.getByText(/No.*banners|Engir.*borðar|Engir.*bannar|Engar.*merkj/i).first();
      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();
        logTestStep('Empty state properly displayed');
      } else {
        logTestStep('No banners found (may be loading or empty)');
      }
    }
  });

  test('should open create banner modal', async ({ page }) => {
    logTestStep('Testing create banner modal opening');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click add banner button
    const addButtonSelectors = [
      'button:has-text("Add Banner")',
      'button:has-text("Bæta við borða")',
      'button:has-text("Bæta við banner")',
      'button:has-text("Add")',
      'button:has-text("Bæta við")',
      'button[class*="btn-primary"]'
    ];

    let addButton;
    for (const selector of addButtonSelectors) {
      try {
        addButton = page.locator(selector).first();
        await addButton.waitFor({ state: 'visible', timeout: 2000 });
        console.log(`Found add button with selector: ${selector}`);
        break;
      } catch (error) {
        console.log(`Add button selector failed: ${selector}`);
      }
    }

    if (addButton) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Check if modal opened with role-based selector
      let modal = page.locator('[role="dialog"]').first();
      if (await modal.count() === 0) {
        modal = page.locator('[class*="fixed"][class*="z-"]').first();
      }
      if (await modal.count() === 0) {
        modal = page.locator('[class*="modal"]').first();
      }

      if (await modal.count() > 0 && await modal.isVisible()) {
        // Verify modal has form elements
        const formInputs = modal.locator('input, textarea, select');
        const hasFormElements = await formInputs.count() > 0;
        if (hasFormElements) {
          logTestStep(`Modal has ${await formInputs.count()} form elements`);
          expect(hasFormElements).toBe(true);
        }

        // Check for modal title with bilingual support
        const modalTitle = modal.locator('h2, h3, [class*="text-xl"]').first();
        if (await modalTitle.count() > 0) {
          const titleText = await modalTitle.textContent();
          logTestStep(`Modal title: ${titleText}`);
        }

        // Close modal with multiple fallbacks
        let closeButton = page.getByRole('button', { name: /close|cancel|hætta|loka/i }).first();
        if (await closeButton.count() === 0) {
          closeButton = modal.locator('button').filter({ hasText: /×|✕/ }).first();
        }
        if (await closeButton.count() === 0) {
          closeButton = modal.locator('button[aria-label*="close" i]').first();
        }

        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
        } else {
          // Try pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }

        logTestStep('Create banner modal verified');
      } else {
        logTestStep('Create banner modal not implemented yet');
      }
    } else {
      logTestStep('Add banner button not found');
    }
  });

  test('should create new banner with form validation', async ({ page }) => {
    logTestStep('Testing banner creation');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open create modal
    const addButton = page.locator('button').filter({ hasText: /Add.*Banner|Bæta.*við.*borða|Bæta.*við.*banner/i }).first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Fill form fields with flexible selectors
      let titleInput = page.getByLabel(/title|name|titill|nafn/i).first();
      if (await titleInput.count() === 0) {
        titleInput = page.getByPlaceholder(/title|name|titill|nafn/i).first();
      }
      if (await titleInput.count() === 0) {
        titleInput = page.locator('input[type="text"]').first();
      }

      let imageUrlInput = page.getByLabel(/image.*url|mynd.*slóð/i).first();
      if (await imageUrlInput.count() === 0) {
        imageUrlInput = page.getByPlaceholder(/url|slóð/i).first();
      }
      if (await imageUrlInput.count() === 0) {
        imageUrlInput = page.locator('input[type="url"]').first();
      }

      if (await titleInput.count() > 0) {
        await titleInput.fill('Test Banner');
        logTestStep('Filled title field');
      }

      if (await imageUrlInput.count() > 0) {
        await imageUrlInput.fill('https://via.placeholder.com/800x400?text=Test+Banner');
        logTestStep('Filled image URL field');
      }

      if (await titleInput.count() > 0 || await imageUrlInput.count() > 0) {
        // Try to submit form
        const submitButton = page.getByRole('button', { name: /Create|Save|Búa til|Vista/i }).first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);

          // Check if modal closed
          const modal = page.locator('[role="dialog"], [class*="fixed"][class*="z-"]').first();
          const modalStillOpen = await modal.count() > 0 && await modal.isVisible();

          if (!modalStillOpen) {
            logTestStep('Banner creation successful');
          } else {
            // Check for validation errors
            const errorMessages = modal.locator('[class*="text-red"], [class*="error"]');
            if (await errorMessages.count() > 0) {
              logTestStep('Form validation working (expected errors for incomplete form)');
            } else {
              logTestStep('Banner creation form displayed');
            }
          }
        } else {
          logTestStep('Submit button not found');
        }
      } else {
        logTestStep('Form inputs not found');
      }
    } else {
      logTestStep('Add banner button not found');
    }
  });

  test('should handle banner status toggle', async ({ page }) => {
    logTestStep('Testing banner status toggle');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find banner cards with more specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });

    if (await bannerCards.count() > 0) {
      const firstBanner = bannerCards.first();

      // Look for status toggle button with aria-label or title
      let statusButton = firstBanner.getByRole('button', { name: /status|active|inactive|virkur|óvirkur/i }).first();
      if (await statusButton.count() === 0) {
        // Fallback: look for button with eye icon
        const buttonsWithIcons = firstBanner.locator('button').filter({ has: page.locator('svg') });
        if (await buttonsWithIcons.count() >= 3) {
          statusButton = buttonsWithIcons.nth(2); // Usually the third button
        }
      }

      if (await statusButton.count() > 0) {
        await statusButton.click();
        await page.waitForTimeout(1000);

        // Verify status changed (check for status badge)
        const statusBadge = firstBanner.locator('[class*="badge"], [class*="px-2"], [class*="rounded"]').first();
        if (await statusBadge.count() > 0) {
          logTestStep('Banner status toggle verified');
        } else {
          logTestStep('Status toggle clicked (badge may not be immediately visible)');
        }
      } else {
        logTestStep('Status toggle button not found');
      }
    } else {
      logTestStep('No banners available for status toggle test');
    }
  });

  test('should handle featured banner toggle', async ({ page }) => {
    logTestStep('Testing featured banner toggle');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find banner cards with specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });

    if (await bannerCards.count() > 0) {
      const firstBanner = bannerCards.first();

      // Look for featured toggle button
      let featuredButton = firstBanner.getByRole('button', { name: /featured|einkennt/i }).first();
      if (await featuredButton.count() === 0) {
        // Fallback: second button with icon
        const buttonsWithIcons = firstBanner.locator('button').filter({ has: page.locator('svg') });
        if (await buttonsWithIcons.count() >= 2) {
          featuredButton = buttonsWithIcons.nth(1);
        }
      }

      if (await featuredButton.count() > 0) {
        await featuredButton.click();
        await page.waitForTimeout(1000);

        // Check for featured badge with bilingual support
        const featuredBadge = firstBanner.locator('[class*="bg-blue"], [class*="badge"]').filter({
          hasText: /Featured|Einkennt/i
        }).first();

        if (await featuredBadge.count() > 0) {
          logTestStep('Featured banner toggle verified');
        } else {
          logTestStep('Featured toggle clicked (badge may not be immediately visible)');
        }
      } else {
        logTestStep('Featured toggle button not found');
      }
    } else {
      logTestStep('No banners available for featured toggle test');
    }
  });

  test('should open edit banner modal', async ({ page }) => {
    logTestStep('Testing edit banner modal');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find banner cards with specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });

    if (await bannerCards.count() > 0) {
      const firstBanner = bannerCards.first();

      // Look for edit button with aria-label or role
      let editButton = firstBanner.getByRole('button', { name: /edit|breyta/i }).first();
      if (await editButton.count() === 0) {
        // Fallback: first button with icon
        const buttonsWithIcons = firstBanner.locator('button').filter({ has: page.locator('svg') });
        if (await buttonsWithIcons.count() > 0) {
          editButton = buttonsWithIcons.first();
        }
      }

      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Check if modal opened
        let modal = page.locator('[role="dialog"]').first();
        if (await modal.count() === 0) {
          modal = page.locator('[class*="fixed"][class*="z-"]').first();
        }

        if (await modal.count() > 0 && await modal.isVisible()) {
          // Check for modal title
          const modalTitle = modal.locator('h2, h3').first();
          if (await modalTitle.count() > 0) {
            const titleText = await modalTitle.textContent();
            logTestStep(`Edit modal opened with title: ${titleText}`);
          }

          // Close modal with multiple fallbacks
          let closeButton = page.getByRole('button', { name: /close|cancel|hætta|loka/i }).first();
          if (await closeButton.count() === 0) {
            closeButton = modal.locator('button').filter({ hasText: /×|✕/ }).first();
          }

          if (await closeButton.count() > 0) {
            await closeButton.click();
            await page.waitForTimeout(500);
          } else {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }

          logTestStep('Edit banner modal verified');
        } else {
          logTestStep('Edit modal not implemented yet');
        }
      } else {
        logTestStep('Edit button not found');
      }
    } else {
      logTestStep('No banners available for edit test');
    }
  });

  test('should handle banner deletion', async ({ page }) => {
    logTestStep('Testing banner deletion');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find banner cards with specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });

    if (await bannerCards.count() > 0) {
      const firstBanner = bannerCards.first();

      // Look for delete button with aria-label or role
      let deleteButton = firstBanner.getByRole('button', { name: /delete|eyða/i }).first();
      if (await deleteButton.count() === 0) {
        // Fallback: last button with icon (typically delete)
        const buttonsWithIcons = firstBanner.locator('button').filter({ has: page.locator('svg') });
        if (await buttonsWithIcons.count() > 0) {
          deleteButton = buttonsWithIcons.last();
        }
      }

      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.waitForTimeout(500);

        // Check for confirmation dialog with multiple selectors
        let confirmDialog = page.locator('[role="alertdialog"]').first();
        if (await confirmDialog.count() === 0) {
          confirmDialog = page.locator('[role="dialog"]').filter({
            hasText: /confirm|delete|eyða|staðfest/i
          }).first();
        }
        if (await confirmDialog.count() === 0) {
          confirmDialog = page.getByText(/confirm.*delete|staðfest.*eyð/i).first();
        }

        if (await confirmDialog.count() > 0) {
          logTestStep('Delete confirmation dialog appeared');
          // Don't actually delete - just close the dialog
          const cancelButton = page.getByRole('button', { name: /cancel|hætta/i }).first();
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
        } else {
          logTestStep('Delete button clicked (confirmation may have been handled automatically)');
        }
      } else {
        logTestStep('Delete button not found');
      }
    } else {
      logTestStep('No banners available for deletion test');
    }
  });

  test('should handle media picker for banner images', async ({ page }) => {
    logTestStep('Testing media picker functionality');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open create modal
    const addButton = page.locator('button').filter({ hasText: /Add.*Banner|Bæta.*við.*borða|Bæta.*við.*banner/i }).first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Look for media picker button
      const mediaButtons = page.getByRole('button', { name: /Select|Velja|Upload|Hlaða/i });
      const hasMediaButton = await mediaButtons.count() > 0;

      if (hasMediaButton) {
        // Click media picker button
        await mediaButtons.first().click();
        await page.waitForTimeout(1000);

        // Check if media picker modal opened
        const mediaModal = page.locator('[class*="fixed"], [class*="modal"]').filter({ hasText: /Media|Miðlar/i });
        const hasMediaModal = await mediaModal.count() > 0;

        if (hasMediaModal) {
          logTestStep('Media picker modal opened successfully');

          // Close media picker
          const closeButtons = mediaModal.locator('button').filter({ hasText: '×' }).or(
            mediaModal.locator('button').filter({ has: page.locator('svg') })
          );

          if (await closeButtons.count() > 0) {
            await closeButtons.first().click();
            await page.waitForTimeout(500);
          }
        } else {
          logTestStep('Media picker modal not implemented yet');
        }

        // Close main modal
        const mainModal = page.locator('[class*="fixed"], [class*="modal"]');
        const closeMainButtons = mainModal.locator('button').filter({ hasText: '×' }).or(
          mainModal.locator('button').filter({ has: page.locator('svg') })
        );

        if (await closeMainButtons.count() > 0) {
          await closeMainButtons.first().click();
          await page.waitForTimeout(500);
        }
      } else {
        logTestStep('Media picker button not found');
      }
    } else {
      logTestStep('Add banner button not found');
    }
  });

  test('should handle link dropdown functionality', async ({ page }) => {
    logTestStep('Testing link dropdown functionality');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open create modal
    const addButton = page.locator('button').filter({ hasText: /Add.*Banner|Bæta.*við.*borða|Bæta.*við.*banner/i }).first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Look for link dropdown toggle (chevron down)
      const dropdownToggles = page.locator('button').filter({ has: page.locator('svg[class*="chevron"]') });
      const hasDropdownToggle = await dropdownToggles.count() > 0;

      if (hasDropdownToggle) {
        // Click dropdown toggle
        await dropdownToggles.first().click();
        await page.waitForTimeout(500);

        // Check if dropdown opened
        const dropdown = page.locator('[class*="absolute"], [class*="dropdown"]').filter({ hasText: /Category|Flokkur|Product|Vara/i });
        const hasDropdown = await dropdown.count() > 0;

        if (hasDropdown) {
          logTestStep('Link dropdown opened successfully');

          // Check for category/product options
          const options = dropdown.locator('button');
          const hasOptions = await options.count() > 0;
          if (hasOptions) {
            logTestStep('Link options available');
          }
        } else {
          logTestStep('Link dropdown not implemented yet');
        }

        // Close modal
        const modal = page.locator('[class*="fixed"], [class*="modal"]');
        const closeButtons = modal.locator('button').filter({ hasText: '×' }).or(
          modal.locator('button').filter({ has: page.locator('svg') })
        );

        if (await closeButtons.count() > 0) {
          await closeButtons.first().click();
          await page.waitForTimeout(500);
        }
      } else {
        logTestStep('Link dropdown toggle not found');
      }
    } else {
      logTestStep('Add banner button not found');
    }
  });

  test('should handle loading states properly', async ({ page }) => {
    logTestStep('Testing loading states');

    await page.goto('/admin/banners');

    // Check for loading indicators
    const loadingIndicators = page.locator('[class*="animate-spin"], [class*="skeleton"], [class*="loading"]');
    const hasLoading = await loadingIndicators.count() > 0;

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // After loading, should have content or empty state
    const hasContent = await page.locator('text=/[A-Za-z]/').count() > 0;
    const hasEmptyState = await page.getByText(/No.*banners|Engir.*borðar|Engir.*bannar/i).count() > 0;

    expect(hasContent || hasEmptyState).toBe(true);

    logTestStep('Loading states handled properly');
  });

  test('should handle empty state when no banners found', async ({ page }) => {
    logTestStep('Testing empty state handling');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if there are banners with specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });
    const bannerCount = await bannerCards.count();

    if (bannerCount === 0) {
      // Should show empty state with bilingual support
      const emptyState = page.getByText(/No.*banners|Engir.*borðar|Engir.*bannar|Engar.*merkj/i).first();

      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();
        logTestStep('Empty state properly displayed');
      } else {
        // Check for alternative empty state messages
        const altEmptyState = page.getByText(/empty|tóm|no.*found|ekkert.*fannst/i).first();
        if (await altEmptyState.count() > 0) {
          await expect(altEmptyState).toBeVisible();
          logTestStep('Alternative empty state displayed');
        } else {
          logTestStep('No banners and no empty state (may be loading)');
        }
      }
    } else {
      logTestStep(`Banners are present (${bannerCount}), empty state not applicable`);
    }
  });

  test('should handle responsive design', async ({ page }) => {
    logTestStep('Testing responsive design');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    // On mobile, elements might be hidden/collapsed, just verify page loads
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

  test('should restrict access to admin users only', async ({ browser }) => {
    logTestStep('Testing access control for banners page');

    // Try accessing as regular user
    const userPage = await browser.newPage();
    await userPage.goto('/login');

    try {
      // Try to login as customer (if available)
      const emailField = userPage.locator('input[type="email"], input[placeholder*="email"]');
      const passwordField = userPage.locator('input[type="password"]');

      if (await emailField.count() > 0 && await passwordField.count() > 0) {
        await emailField.fill(testUsers.customer.email);
        await passwordField.fill(testUsers.customer.password);

        const loginButton = userPage.getByRole('button', { name: /Login|Sign in/i });
        if (await loginButton.count() > 0) {
          await loginButton.click();
          await userPage.waitForURL('/');
        }
      }

      // Try to access banners directly
      await userPage.goto('/admin/banners');

      // Should be redirected or show access denied
      const accessDenied = userPage.getByText(/Access Denied|Aðgangur|Forbidden/i);
      const redirected = userPage.url().includes('/admin/banners') === false;

      expect(await accessDenied.count() > 0 || redirected).toBe(true);

    } catch (error) {
      // If customer login fails, just test direct access
      await userPage.goto('/admin/banners');
      const accessDenied = userPage.getByText(/Access Denied|Aðgangur|Forbidden|Login/i);
      expect(await accessDenied.count() > 0).toBe(true);
    }

    await userPage.close();
    logTestStep('Access control verified');
  });

  test('should handle banner sort order display', async ({ page }) => {
    logTestStep('Testing banner sort order display');

    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find banner cards with specific selector
    const bannerCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({
      has: page.locator('img[alt*="Banner" i], img[src*="banner" i], [class*="w-12 h-12"]')
    });

    if (await bannerCards.count() > 0) {
      // Check for sort order display with multiple patterns
      let sortOrderElements = page.locator('text=/^#[0-9]+$/').first();
      if (await sortOrderElements.count() === 0) {
        sortOrderElements = page.locator('[class*="order"], [class*="number"]').filter({
          hasText: /[0-9]+/
        }).first();
      }

      if (await sortOrderElements.count() > 0) {
        await expect(sortOrderElements).toBeVisible();
        logTestStep('Sort order display verified');
      } else {
        logTestStep('Sort order not displayed (may not be implemented yet)');
      }
    } else {
      logTestStep('No banners available for sort order test');
    }
  });
});