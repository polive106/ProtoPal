import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';
import { registerAndVerify, forgotPassword } from '../../fixtures/api-helpers';

test.describe('Reset Password Page @ui', () => {
  test('redirects to login when no token in URL', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page).toHaveURL(/\/login/);
  });

  test('renders reset password form with valid token', async ({ page }) => {
    await page.goto('/reset-password?token=some-token');
    await expect(page.getByTestId(testIds.resetPassword.card)).toBeVisible();
    await expect(page.getByTestId(testIds.resetPassword.inputPassword)).toBeVisible();
    await expect(page.getByTestId(testIds.resetPassword.btnSubmit)).toBeVisible();
  });

  test('shows validation error for weak password', async ({ page }) => {
    await page.goto('/reset-password?token=some-token');
    await page.getByTestId(testIds.resetPassword.inputPassword).fill('short');
    await page.getByTestId(testIds.resetPassword.btnSubmit).click();

    await expect(page.getByTestId(testIds.resetPassword.errorPassword)).toBeVisible();
  });

  test('shows server error for invalid token', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-token');
    await page.getByTestId(testIds.resetPassword.inputPassword).fill('NewPass123');
    await page.getByTestId(testIds.resetPassword.btnSubmit).click();

    await expect(page.getByTestId(testIds.resetPassword.alertError)).toBeVisible();
  });

  test('full flow: register → forgot password → reset → login with new password', async ({
    page,
    request,
  }) => {
    const email = `ui-reset-${Date.now()}@example.com`;
    const oldPassword = 'OldPass123';
    const newPassword = 'NewPass456';

    // Register and verify via API
    await registerAndVerify(request, {
      email,
      password: oldPassword,
      firstName: 'UI',
      lastName: 'Reset',
    });

    // Request password reset via API to get token
    const forgotRes = await forgotPassword(request, email);
    const { resetToken } = await forgotRes.json();

    // Visit reset password page with the token
    await page.goto(`/reset-password?token=${resetToken}`);
    await expect(page.getByTestId(testIds.resetPassword.card)).toBeVisible();

    // Submit new password
    await page.getByTestId(testIds.resetPassword.inputPassword).fill(newPassword);
    await page.getByTestId(testIds.resetPassword.btnSubmit).click();

    // Should show success
    await expect(page.getByTestId(testIds.resetPassword.success)).toBeVisible();

    // Click sign in link
    await page.getByTestId(testIds.resetPassword.linkLogin).click();
    await expect(page).toHaveURL(/\/login/);

    // Login with new password
    await page.getByTestId(testIds.login.inputEmail).fill(email);
    await page.getByTestId(testIds.login.inputPassword).fill(newPassword);
    await page.getByTestId(testIds.login.btnSubmit).click();

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
