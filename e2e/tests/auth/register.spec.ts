import { test, expect } from '@playwright/test';
import { apiUrls, testIds } from '../../fixtures';

test.describe('Register', () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;

  test.describe('Register API @api', () => {
    test('should register a new user', async ({ request }) => {
      const response = await request.post(`${apiUrls.base}/auth/register`, {
        data: {
          email: uniqueEmail,
          password: 'TestPass1',
          firstName: 'Test',
          lastName: 'User',
        },
      });
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.user.email).toBe(uniqueEmail);
    });

    test('should reject duplicate email', async ({ request }) => {
      // First registration
      await request.post(`${apiUrls.base}/auth/register`, {
        data: {
          email: `dup-${Date.now()}@example.com`,
          password: 'TestPass1',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Duplicate (using same email as seed user)
      const response = await request.post(`${apiUrls.base}/auth/register`, {
        data: {
          email: 'user@example.com',
          password: 'TestPass1',
          firstName: 'Test',
          lastName: 'User',
        },
      });
      expect(response.ok()).toBeFalsy();
    });
  });

  test.describe('Register UI @ui', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByTestId(testIds.register.inputEmail)).toBeVisible();
      await expect(page.getByTestId(testIds.register.inputPassword)).toBeVisible();
      await expect(page.getByTestId(testIds.register.btnSubmit)).toBeVisible();
    });

    test('should register and redirect to check-email page', async ({ page }) => {
      await page.goto('/register');
      const email = `ui-test-${Date.now()}@example.com`;
      await page.getByTestId(testIds.register.inputFirstName).fill('UI');
      await page.getByTestId(testIds.register.inputLastName).fill('Test');
      await page.getByTestId(testIds.register.inputEmail).fill(email);
      await page.getByTestId(testIds.register.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.register.btnSubmit).click();
      await expect(page.getByTestId('check-email-card')).toBeVisible({ timeout: 10000 });
    });
  });
});
