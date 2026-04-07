import { test, expect } from '@playwright/test';
import { testCredentials, apiUrls, testIds } from '../../fixtures';
import { registerUser } from '../../fixtures/api-helpers';

test.describe('Login', () => {
  test.describe('Login API @api', () => {
    test('should login successfully with valid credentials', async ({ request }) => {
      const response = await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.message).toBe('Login successful');
      expect(data.user.email).toBe(testCredentials.user.email);
    });

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: 'wrongpassword',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('should return user data from /auth/me', async ({ request }) => {
      // Login first
      const loginRes = await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });
      expect(loginRes.ok()).toBeTruthy();

      // Get me
      const meRes = await request.get(`${apiUrls.base}/auth/me`);
      expect(meRes.ok()).toBeTruthy();
      const data = await meRes.json();
      expect(data.user.email).toBe(testCredentials.user.email);
    });
  });

  test.describe('Login UI @ui', () => {
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByTestId(testIds.login.inputEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.login.inputPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.login.btnSubmit)).toBeVisible();
    });

    test('should login and redirect to dashboard', async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(testCredentials.user.email);
      await page.getByTestId(testIds.login.inputPassword).fill(testCredentials.user.password);
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill('bad@example.com');
      await page.getByTestId(testIds.login.inputPassword).fill('wrongpassword');
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.login.alertError)).toBeVisible();
    });

    test('should show generic error for pending account (no enumeration)', async ({ page, request }) => {
      const email = `ui-pending-${Date.now()}@example.com`;
      await registerUser(request, {
        email,
        password: 'TestPass1',
        firstName: 'Pending',
        lastName: 'User',
      });

      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(email);
      await page.getByTestId(testIds.login.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.login.alertError)).toBeVisible();
      await expect(page.getByTestId(testIds.login.alertError)).toContainText('Invalid email or password');
    });
  });
});
