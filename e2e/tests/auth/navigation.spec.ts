import { test, expect } from '@playwright/test';
import { testCredentials, testIds } from '../../fixtures';

test.describe('Auth Navigation & Page Flow', () => {
  test.describe('Login ↔ Register cross-links @ui', () => {
    test('should navigate from login to register via "Sign up" link', async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId(testIds.login.linkRegister).click();
      await expect(page).toHaveURL(/\/register/);
      await expect(page.getByTestId(testIds.register.card)).toBeVisible();
    });

    test('should navigate from register to login via "Sign in" link', async ({ page }) => {
      await page.goto('/register');
      await page.getByTestId(testIds.register.linkLogin).click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId(testIds.login.card)).toBeVisible();
    });
  });

  test.describe('Check Email page @ui', () => {
    let testEmail: string;

    test.beforeEach(async ({ page }) => {
      testEmail = `nav-ce-${Date.now()}@example.com`;
      await page.goto('/register');
      await page.getByTestId(testIds.register.inputFirstName).fill('Nav');
      await page.getByTestId(testIds.register.inputLastName).fill('Test');
      await page.getByTestId(testIds.register.inputEmail).fill(testEmail);
      await page.getByTestId(testIds.register.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.register.btnSubmit).click();
      await expect(page.getByTestId(testIds.checkEmail.card)).toBeVisible({ timeout: 10000 });
    });

    test('should render Check Email page after registration with email info', async ({ page }) => {
      await expect(page).toHaveURL(/\/check-email/);
      await expect(page.getByTestId(testIds.checkEmail.textMessage)).toBeVisible();
    });

    test('should resend verification email when resend button is clicked', async ({ page }) => {
      await page.getByTestId(testIds.checkEmail.btnResend).click();
      await expect(page.getByTestId(testIds.checkEmail.textResent)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate from Check Email to login via "Sign in" link', async ({ page }) => {
      await page.getByTestId(testIds.checkEmail.linkLogin).click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId(testIds.login.card)).toBeVisible();
    });
  });

  test.describe('Verify Email page @ui', () => {
    test('should show loading state then success for valid token', async ({ page }) => {
      await page.route('**/auth/verify**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email verified successfully', user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', status: 'approved' } }),
        });
      });

      await page.goto('/verify?token=valid-fake-token');
      await expect(page.getByTestId(testIds.verify.textLoading)).toBeVisible();
      await expect(page.getByTestId(testIds.verify.alertSuccess)).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId(testIds.verify.textLoading)).not.toBeVisible();
    });

    test('should show error state for invalid token', async ({ page }) => {
      await page.route('**/auth/verify**', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid or expired token' }),
        });
      });

      await page.goto('/verify?token=invalid-token');
      await expect(page.getByTestId(testIds.verify.alertError)).toBeVisible({ timeout: 5000 });
    });

    test('should navigate from Verify success to login via "Sign in" link', async ({ page }) => {
      await page.route('**/auth/verify**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email verified successfully', user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', status: 'approved' } }),
        });
      });

      await page.goto('/verify?token=any-token');
      await expect(page.getByTestId(testIds.verify.alertSuccess)).toBeVisible({ timeout: 5000 });
      await page.getByTestId(testIds.verify.linkLogin).click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId(testIds.login.card)).toBeVisible();
    });
  });

  test.describe('Authenticated navigation @ui', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(testCredentials.user.email);
      await page.getByTestId(testIds.login.inputPassword).fill(testCredentials.user.password);
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible({ timeout: 10000 });
    });

    test('should redirect to login page after logout', async ({ page }) => {
      await page.getByTestId(testIds.app.btnLogout).click();
      await page.waitForURL(/\/login/);
      await expect(page.getByTestId(testIds.login.card)).toBeVisible();
    });

    test('should navigate from Dashboard to notes via "Notes" link', async ({ page }) => {
      await page.getByTestId(testIds.dashboard.linkNotes).click();
      await page.waitForURL(/\/notes/);
      await expect(page.getByTestId(testIds.notes.page)).toBeVisible();
    });
  });
});
