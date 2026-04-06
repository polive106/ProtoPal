import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';
import { registerAndVerify, createNote } from '../../fixtures/api-helpers';

test.describe('Notes List States', () => {
  test.describe('Empty state @ui', () => {
    let userEmail: string;
    let userPassword: string;

    test.beforeEach(async ({ page, request }) => {
      userEmail = `notes-empty-${Date.now()}@example.com`;
      userPassword = 'TestPass1';
      await registerAndVerify(request, {
        email: userEmail,
        password: userPassword,
        firstName: 'Empty',
        lastName: 'Tester',
      });
      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(userEmail);
      await page.getByTestId(testIds.login.inputPassword).fill(userPassword);
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible({ timeout: 10000 });
      await page.goto('/notes');
      await expect(page.getByTestId(testIds.notes.page)).toBeVisible();
    });

    test('should display empty state when user has no notes', async ({ page }) => {
      await expect(page.getByTestId(testIds.notes.empty)).toBeVisible();
      await expect(page.getByTestId(testIds.notes.list)).not.toBeVisible();
    });

    test('should show Create Note button in empty state', async ({ page }) => {
      await expect(page.getByTestId('notes-btn-create-empty')).toBeVisible();
    });

    test('should open note drawer when clicking Create Note in empty state', async ({ page }) => {
      await page.getByTestId('notes-btn-create-empty').click();
      await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    });

    test('should transition from empty state to list after creating a note', async ({ page }) => {
      await page.getByTestId('notes-btn-create-empty').click();
      await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
      await page.getByTestId(testIds.notes.inputTitle).fill('First Note');
      await page.getByTestId(testIds.notes.inputContent).fill('My first note content');
      await page.getByTestId(testIds.notes.btnSave).click();
      await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
      await expect(page.getByTestId(testIds.notes.empty)).not.toBeVisible();
      await expect(page.getByTestId(testIds.notes.list)).toBeVisible();
    });
  });

  test.describe('Loading state @ui', () => {
    test('should show loading spinner while notes are being fetched', async ({ page }) => {
      const email = `notes-loading-${Date.now()}@example.com`;
      await registerAndVerify(await page.request, {
        email,
        password: 'TestPass1',
        firstName: 'Loading',
        lastName: 'Tester',
      });

      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(email);
      await page.getByTestId(testIds.login.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible({ timeout: 10000 });

      // Intercept the notes API and delay the response
      let resolveRoute: () => void;
      const routePromise = new Promise<void>((resolve) => {
        resolveRoute = resolve;
      });

      await page.route('**/api/notes', async (route) => {
        if (route.request().method() === 'GET') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await route.continue();
          resolveRoute();
        } else {
          await route.continue();
        }
      });

      // Navigate to notes - the intercepted route will delay the response
      await page.goto('/notes');

      // Loading spinner should be visible
      await expect(page.getByTestId(testIds.notes.loading)).toBeVisible();

      // Wait for the route to complete
      await routePromise;

      // Loading spinner should disappear
      await expect(page.getByTestId(testIds.notes.loading)).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Error state @ui', () => {
    test('should show error alert when notes API fails', async ({ page }) => {
      const email = `notes-error-${Date.now()}@example.com`;
      const request = page.request;
      await registerAndVerify(await request, {
        email,
        password: 'TestPass1',
        firstName: 'Error',
        lastName: 'Tester',
      });

      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(email);
      await page.getByTestId(testIds.login.inputPassword).fill('TestPass1');
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible({ timeout: 10000 });

      // Intercept only the API call on port 3000, not the page navigation
      await page.route('**/api/notes', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Internal Server Error' }),
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to notes - the intercepted API route will return an error
      await page.goto('/notes');

      // Error alert should be visible
      await expect(page.getByTestId(testIds.notes.alertError)).toBeVisible({ timeout: 5000 });
    });
  });
});
