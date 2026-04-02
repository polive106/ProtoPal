import { test, expect } from '@playwright/test';
import { testCredentials, apiUrls, testIds, testData } from '../../fixtures';

test.describe('Notes CRUD', () => {
  test.describe('Notes API @api', () => {
    test('should list notes for authenticated user', async ({ request }) => {
      // Login
      await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });

      const response = await request.get(`${apiUrls.base}/notes`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.notes).toBeDefined();
      expect(data.notes.length).toBeGreaterThanOrEqual(2);
    });

    test('should create a new note', async ({ request }) => {
      await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });

      const response = await request.post(`${apiUrls.base}/notes`, {
        data: { title: 'API Test Note', content: 'Created via API test' },
      });
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.note.title).toBe('API Test Note');
    });

    test('should update a note', async ({ request }) => {
      await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });

      const response = await request.patch(`${apiUrls.base}/notes/${testData.notes.note1}`, {
        data: { title: 'Updated Title' },
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.note.title).toBe('Updated Title');
    });

    test('should delete a note', async ({ request }) => {
      await request.post(`${apiUrls.base}/auth/login`, {
        data: {
          email: testCredentials.user.email,
          password: testCredentials.user.password,
        },
      });

      // Create a note to delete
      const createRes = await request.post(`${apiUrls.base}/notes`, {
        data: { title: 'To Delete', content: 'Will be deleted' },
      });
      const { note } = await createRes.json();

      const deleteRes = await request.delete(`${apiUrls.base}/notes/${note.id}`);
      expect(deleteRes.status()).toBe(204);
    });

    test('should reject unauthenticated access', async ({ request }) => {
      const response = await request.get(`${apiUrls.base}/notes`);
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Notes UI @ui', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId(testIds.login.inputEmail).fill(testCredentials.user.email);
      await page.getByTestId(testIds.login.inputPassword).fill(testCredentials.user.password);
      await page.getByTestId(testIds.login.btnSubmit).click();
      await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible();
      await page.goto('/notes');
      await expect(page.getByTestId(testIds.notes.pageTitle)).toBeVisible();
    });

    test('should display notes list', async ({ page }) => {
      await expect(page.getByTestId(testIds.notes.list)).toBeVisible();
    });

    test('should create a new note', async ({ page }) => {
      await page.getByTestId(testIds.notes.btnCreate).click();
      await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
      await page.getByTestId(testIds.notes.inputTitle).fill('UI Test Note');
      await page.getByTestId(testIds.notes.inputContent).fill('Created via UI test');
      await page.getByTestId(testIds.notes.btnSave).click();
      await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
    });
  });
});
