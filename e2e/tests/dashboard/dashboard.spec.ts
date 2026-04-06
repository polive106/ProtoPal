import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';
import { registerAndVerify } from '../../fixtures/api-helpers';

test.describe('Dashboard & App Layout', () => {
  const firstName = 'Dash';
  const lastName = 'Tester';
  let email: string;
  const password = 'TestPass1';

  test.beforeEach(async ({ page, request }) => {
    email = `dashboard-${Date.now()}@example.com`;
    await registerAndVerify(request, {
      email,
      password,
      firstName,
      lastName,
    });
    await page.goto('/login');
    await page.getByTestId(testIds.login.inputEmail).fill(email);
    await page.getByTestId(testIds.login.inputPassword).fill(password);
    await page.getByTestId(testIds.login.btnSubmit).click();
    await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible({ timeout: 10000 });
  });

  test.describe('Dashboard page @ui', () => {
    test('should display welcome message with user first name', async ({ page }) => {
      const title = page.getByTestId(testIds.dashboard.title);
      await expect(title).toBeVisible();
      await expect(title).toContainText(`Welcome, ${firstName}!`);
    });

    test('should display View Notes link', async ({ page }) => {
      await expect(page.getByTestId(testIds.dashboard.linkNotes)).toBeVisible();
    });

    test('should navigate to notes page when clicking View Notes link', async ({ page }) => {
      await page.getByTestId(testIds.dashboard.linkNotes).click();
      await page.waitForURL(/\/notes/);
      await expect(page.getByTestId(testIds.notes.page)).toBeVisible();
    });
  });

  test.describe('App layout @ui', () => {
    test('should display app header', async ({ page }) => {
      await expect(page.getByTestId(testIds.app.header)).toBeVisible();
    });

    test('should display user full name in header', async ({ page }) => {
      const userName = page.getByTestId(testIds.app.userName);
      await expect(userName).toBeVisible();
      await expect(userName).toContainText(`${firstName} ${lastName}`);
    });

    test('should navigate to notes page via Notes nav link', async ({ page }) => {
      await page.getByTestId(testIds.app.navNotes).click();
      await page.waitForURL(/\/notes/);
      await expect(page.getByTestId(testIds.notes.page)).toBeVisible();
    });

    test('should navigate to dashboard via Home nav link', async ({ page }) => {
      // First navigate away from dashboard
      await page.getByTestId(testIds.app.navNotes).click();
      await page.waitForURL(/\/notes/);
      // Then navigate back
      await page.getByTestId(testIds.app.navHome).click();
      await page.waitForURL(/\/dashboard/);
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible();
    });
  });
});
