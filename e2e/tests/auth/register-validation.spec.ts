import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';

test.describe('Register Validation', () => {
  test.describe('Register Validation @ui', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should show first name required error on empty blur', async ({ page }) => {
      await page.getByTestId(testIds.register.inputFirstName).fill('x');
      await page.getByTestId(testIds.register.inputFirstName).clear();
      await page.getByTestId(testIds.register.inputLastName).click();
      await expect(page.getByTestId(testIds.register.errorFirstName)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorFirstName)).toContainText('First name is required');
    });

    test('should show last name required error on empty blur', async ({ page }) => {
      await page.getByTestId(testIds.register.inputLastName).fill('x');
      await page.getByTestId(testIds.register.inputLastName).clear();
      await page.getByTestId(testIds.register.inputFirstName).click();
      await expect(page.getByTestId(testIds.register.errorLastName)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorLastName)).toContainText('Last name is required');
    });

    test('should show email required error on empty blur', async ({ page }) => {
      await page.getByTestId(testIds.register.inputEmail).fill('x');
      await page.getByTestId(testIds.register.inputEmail).clear();
      await page.getByTestId(testIds.register.inputPassword).click();
      await expect(page.getByTestId(testIds.register.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorEmail)).toContainText('Email is required');
    });

    test('should show invalid email error for malformed email', async ({ page }) => {
      await page.getByTestId(testIds.register.inputEmail).fill('not-an-email');
      await page.getByTestId(testIds.register.inputPassword).click();
      await expect(page.getByTestId(testIds.register.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorEmail)).toContainText('Invalid email address');
    });

    test('should show minimum 8 characters error for short password', async ({ page }) => {
      await page.getByTestId(testIds.register.inputPassword).fill('Ab1');
      await page.getByTestId(testIds.register.inputEmail).click();
      await expect(page.getByTestId(testIds.register.errorPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorPassword)).toContainText('Minimum 8 characters');
    });

    test('should show must contain uppercase letter error', async ({ page }) => {
      await page.getByTestId(testIds.register.inputPassword).fill('password1');
      await page.getByTestId(testIds.register.inputEmail).click();
      await expect(page.getByTestId(testIds.register.errorPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorPassword)).toContainText('Must contain an uppercase letter');
    });

    test('should show must contain lowercase letter error', async ({ page }) => {
      await page.getByTestId(testIds.register.inputPassword).fill('PASSWORD1');
      await page.getByTestId(testIds.register.inputEmail).click();
      await expect(page.getByTestId(testIds.register.errorPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorPassword)).toContainText('Must contain a lowercase letter');
    });

    test('should show must contain a number error', async ({ page }) => {
      await page.getByTestId(testIds.register.inputPassword).fill('Passwords');
      await page.getByTestId(testIds.register.inputEmail).click();
      await expect(page.getByTestId(testIds.register.errorPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorPassword)).toContainText('Must contain a number');
    });

    test('should show last name max length error for over 100 chars', async ({ page }) => {
      await page.getByTestId(testIds.register.inputLastName).fill('A'.repeat(101));
      await page.getByTestId(testIds.register.inputFirstName).click();
      await expect(page.getByTestId(testIds.register.errorLastName)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorLastName)).toContainText('at most 100');
    });

    test('should show email max length error for over 254 chars', async ({ page }) => {
      await page.getByTestId(testIds.register.inputEmail).fill('a'.repeat(250) + '@b.co');
      await page.getByTestId(testIds.register.inputPassword).click();
      await expect(page.getByTestId(testIds.register.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorEmail)).toContainText('at most 254');
    });

    test('should show multiple field errors simultaneously', async ({ page }) => {
      // Touch and clear all fields to trigger required errors
      await page.getByTestId(testIds.register.inputFirstName).fill('x');
      await page.getByTestId(testIds.register.inputFirstName).clear();
      await page.getByTestId(testIds.register.inputLastName).fill('x');
      await page.getByTestId(testIds.register.inputLastName).clear();
      await page.getByTestId(testIds.register.inputEmail).fill('x');
      await page.getByTestId(testIds.register.inputEmail).clear();
      await page.getByTestId(testIds.register.inputPassword).fill('x');
      await page.getByTestId(testIds.register.inputPassword).clear();
      // Blur last field
      await page.getByTestId(testIds.register.inputFirstName).click();

      await expect(page.getByTestId(testIds.register.errorFirstName)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorLastName)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.register.errorPassword)).toBeVisible();
    });

    test('should show Creating... button text during submission', async ({ page }) => {
      // Intercept register request and delay response
      await page.route('**/auth/register', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ user: { email: 'test@example.com' } }),
        });
      });

      await page.getByTestId(testIds.register.inputFirstName).fill('Test');
      await page.getByTestId(testIds.register.inputLastName).fill('User');
      await page.getByTestId(testIds.register.inputEmail).fill(`creating-${Date.now()}@example.com`);
      await page.getByTestId(testIds.register.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.register.btnSubmit).click();

      await expect(page.getByTestId(testIds.register.btnSubmit)).toContainText('Creating...');
      await expect(page.getByTestId(testIds.register.btnSubmit)).toBeDisabled();
    });

    test('should redirect to check-email for duplicate email (no enumeration)', async ({ page }) => {
      await page.getByTestId(testIds.register.inputFirstName).fill('Test');
      await page.getByTestId(testIds.register.inputLastName).fill('User');
      await page.getByTestId(testIds.register.inputEmail).fill('user@example.com');
      await page.getByTestId(testIds.register.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.register.btnSubmit).click();

      // Should redirect to check-email page, not show an error
      await expect(page.getByTestId(testIds.checkEmail.card)).toBeVisible({ timeout: 10000 });
    });
  });
});
