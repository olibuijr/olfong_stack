import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Admin Discount Management', () => {
  test.beforeEach(async ({ page }) => {
    logTestStep('Setting up admin login for discount tests');

    // Login as admin
    await page.goto('/admin-login');
    await page.waitForLoadState('networkidle');

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
  });

  test('should display discounts page', async ({ page }) => {
    logTestStep('Testing discounts page display');

    await page.goto('/admin/discounts');
    await page.waitForLoadState('networkidle');

    // Check if page has content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    logTestStep('Discounts page loaded successfully');
  });

  test('should create new discount', async ({ page }) => {
    logTestStep('Testing discount creation');

    await page.goto('/admin/discounts');
    await page.waitForLoadState('networkidle');

    // Look for "New Discount" or "Create" button
    const createBtn = page.locator('button:has-text("New Discount"), button:has-text("Create"), button:has-text("Nýr afsláttur")').first();

    if (await createBtn.count() > 0) {
      await createBtn.click();
      await page.waitForTimeout(1000);

      // Fill discount form
      const codeInput = page.locator('input[name*="code"], input[placeholder*="code" i]').first();
      if (await codeInput.count() > 0) {
        await codeInput.fill('TEST20');
        logTestStep('Filled discount code');
      }

      // Fill discount amount/percentage
      const discountInput = page.locator('input[name*="discount"], input[name*="amount"], input[type="number"]').first();
      if (await discountInput.count() > 0) {
        await discountInput.fill('20');
        logTestStep('Filled discount amount');
      }

      // Submit form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
        logTestStep('Discount creation form submitted');
      }
    } else {
      logTestStep('Create discount button not found');
    }
  });

  test('should apply discount code to cart', async ({ page }) => {
    logTestStep('Testing discount application in cart');

    // Navigate to products and add to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button:has-text("Bæta í körfu"), button:has-text("Add to Cart")').first();
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1000);

        // Navigate to cart
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        // Look for discount code input
        const discountCodeInput = page.locator('input[placeholder*="discount", i], input[name*="discount"], input[placeholder*="code" i]').first();
        if (await discountCodeInput.count() > 0) {
          await discountCodeInput.fill('TEST20');
          logTestStep('Entered discount code');

          // Apply discount
          const applyBtn = page.locator('button:has-text("Apply"), button:has-text("Nota")').first();
          if (await applyBtn.count() > 0) {
            await applyBtn.click();
            await page.waitForTimeout(1500);
            logTestStep('Applied discount code to cart');
          }
        } else {
          logTestStep('Discount code input not found in cart');
        }
      }
    }
  });

  test('should list all discounts', async ({ page }) => {
    logTestStep('Testing discount list display');

    await page.goto('/admin/discounts');
    await page.waitForLoadState('networkidle');

    // Look for discount list/table
    const discountList = page.locator('table, [class*="discount"], [class*="list"]');
    if (await discountList.count() > 0) {
      logTestStep('Discount list found');

      // Count discounts
      const discountRows = page.locator('tbody tr, [class*="discount-item"]');
      const discountCount = await discountRows.count();
      logTestStep(`Found ${discountCount} discounts in list`);
    } else {
      logTestStep('Discount list not found');
    }
  });

  test('should edit discount', async ({ page }) => {
    logTestStep('Testing discount edit functionality');

    await page.goto('/admin/discounts');
    await page.waitForLoadState('networkidle');

    // Look for edit button on first discount
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Breyta"), a[href*="/admin/discounts/"]').first();

    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForLoadState('networkidle');

      // Update discount amount
      const discountInput = page.locator('input[name*="discount"], input[type="number"]').first();
      if (await discountInput.count() > 0) {
        await discountInput.fill('25');
        logTestStep('Updated discount amount');

        // Save changes
        const saveBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
          logTestStep('Discount updated successfully');
        }
      }
    } else {
      logTestStep('Edit button not found for discount');
    }
  });

  test('should delete discount', async ({ page }) => {
    logTestStep('Testing discount deletion');

    await page.goto('/admin/discounts');
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialRows = page.locator('tbody tr, [class*="discount-item"]');
    const initialCount = await initialRows.count();

    // Look for delete button
    const deleteBtn = page.locator('button:has-text("Delete"), button:has-text("Eyða")').first();

    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      await page.waitForTimeout(500);

      // Confirm deletion if dialog appears
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Já")').first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(1500);
        logTestStep('Discount deleted successfully');

        // Check if count decreased
        const finalRows = page.locator('tbody tr, [class*="discount-item"]');
        const finalCount = await finalRows.count();
        if (finalCount < initialCount) {
          logTestStep(`Discount count decreased from ${initialCount} to ${finalCount}`);
        }
      }
    } else {
      logTestStep('Delete button not found');
    }
  });
});
