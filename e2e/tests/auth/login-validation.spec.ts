import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';

test.describe('Login Validation', () => {
  test.describe('Login Validation @ui', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should show email required error when email is blurred empty', async ({ page }) => {
      await page.getByTestId(testIds.login.inputEmail).fill('x');
      await page.getByTestId(testIds.login.inputEmail).clear();
      await page.getByTestId(testIds.login.inputPassword).click();
      await expect(page.getByTestId(testIds.login.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.login.errorEmail)).toContainText('Email is required');
    });

    test('should show invalid email error for malformed email', async ({ page }) => {
      await page.getByTestId(testIds.login.inputEmail).fill('not-an-email');
      await page.getByTestId(testIds.login.inputPassword).click();
      await expect(page.getByTestId(testIds.login.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.login.errorEmail)).toContainText('Invalid email address');
    });

    test('should show password required error when password is blurred empty', async ({ page }) => {
      await page.getByTestId(testIds.login.inputPassword).fill('x');
      await page.getByTestId(testIds.login.inputPassword).clear();
      await page.getByTestId(testIds.login.inputEmail).click();
      await expect(page.getByTestId(testIds.login.errorPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.login.errorPassword)).toContainText('Password is required');
    });

    test('should clear inline errors when field is corrected and re-blurred', async ({ page }) => {
      // Trigger both errors by typing then clearing
      await page.getByTestId(testIds.login.inputEmail).fill('x');
      await page.getByTestId(testIds.login.inputEmail).clear();
      await page.getByTestId(testIds.login.inputPassword).fill('x');
      await page.getByTestId(testIds.login.inputPassword).clear();
      await page.getByTestId(testIds.login.inputEmail).click();
      await expect(page.getByTestId(testIds.login.errorEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.login.errorPassword)).toBeVisible();

      // Fix email and verify error clears
      await page.getByTestId(testIds.login.inputEmail).fill('valid@example.com');
      await page.getByTestId(testIds.login.inputPassword).click();
      await expect(page.getByTestId(testIds.login.errorEmail)).not.toBeVisible();

      // Fix password and verify error clears
      await page.getByTestId(testIds.login.inputPassword).fill('somepassword');
      await page.getByTestId(testIds.login.inputEmail).click();
      await expect(page.getByTestId(testIds.login.errorPassword)).not.toBeVisible();
    });

    test('should show Signing in... text during submission', async ({ page }) => {
      // Intercept login request and delay response
      await page.route('**/auth/login', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Login successful', user: { email: 'test@example.com' } }),
        });
      });

      await page.getByTestId(testIds.login.inputEmail).fill('test@example.com');
      await page.getByTestId(testIds.login.inputPassword).fill('password123');
      await page.getByTestId(testIds.login.btnSubmit).click();

      await expect(page.getByTestId(testIds.login.btnSubmit)).toContainText('Signing in...');
      await expect(page.getByTestId(testIds.login.btnSubmit)).toBeDisabled();
    });

    test('should dismiss error alert via close button', async ({ page }) => {
      await page.getByTestId(testIds.login.inputEmail).fill('bad@example.com');
      await page.getByTestId(testIds.login.inputPassword).fill('wrongpassword');
      await page.getByTestId(testIds.login.btnSubmit).click();

      await expect(page.getByTestId(testIds.login.alertError)).toBeVisible();

      // Click the dismiss button within the error alert
      await page.getByTestId(testIds.login.alertError).locator('button').click();
      await expect(page.getByTestId(testIds.login.alertError)).not.toBeVisible();
    });
  });
});
