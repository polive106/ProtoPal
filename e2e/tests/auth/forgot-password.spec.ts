import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';

test.describe('Forgot Password Page @ui', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('renders forgot password form', async ({ page }) => {
    await expect(page.getByTestId(testIds.forgotPassword.card)).toBeVisible();
    await expect(page.getByTestId(testIds.forgotPassword.inputEmail)).toBeVisible();
    await expect(page.getByTestId(testIds.forgotPassword.btnSubmit)).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByTestId(testIds.forgotPassword.inputEmail).fill('not-an-email');
    await page.getByTestId(testIds.forgotPassword.btnSubmit).click();

    await expect(page.getByTestId(testIds.forgotPassword.errorEmail)).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    await page.getByTestId(testIds.forgotPassword.inputEmail).click();
    await page.getByTestId(testIds.forgotPassword.btnSubmit).click();

    await expect(page.getByTestId(testIds.forgotPassword.errorEmail)).toBeVisible();
  });

  test('submits successfully and shows confirmation', async ({ page }) => {
    await page.getByTestId(testIds.forgotPassword.inputEmail).fill('user@example.com');
    await page.getByTestId(testIds.forgotPassword.btnSubmit).click();

    await expect(page.getByTestId(testIds.forgotPassword.success)).toBeVisible();
  });

  test('back to login link navigates to login page', async ({ page }) => {
    await page.getByTestId(testIds.forgotPassword.linkLogin).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login Page → Forgot Password Link @ui', () => {
  test('forgot password link navigates to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-link-forgot-password').click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
