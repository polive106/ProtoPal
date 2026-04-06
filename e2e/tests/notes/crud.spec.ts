import { test, expect } from '@playwright/test';
import { testCredentials, apiUrls, testIds, testData } from '../../fixtures';
import { apiUrl, registerAndVerify, createNote } from '../../fixtures/api-helpers';

test.describe('Notes CRUD', () => {
  test.describe('Notes API @api', () => {
    test('should list notes for authenticated user', async ({ request }) => {
      const cookie = await registerAndVerify(request, {
        email: `crud-list-${Date.now()}@example.com`,
        password: 'TestPass1',
        firstName: 'List',
        lastName: 'Tester',
      }).then((r) => r.cookie);

      // Create notes for this user
      await createNote(request, cookie, { title: 'Note 1', content: 'Content 1' });
      await createNote(request, cookie, { title: 'Note 2', content: 'Content 2' });

      const response = await request.get(apiUrl('/notes'), {
        headers: { Cookie: cookie },
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.notes).toBeDefined();
      expect(data.notes.length).toBeGreaterThanOrEqual(2);
    });

    test('should create a new note', async ({ request }) => {
      const { cookie } = await registerAndVerify(request, {
        email: `crud-create-${Date.now()}@example.com`,
        password: 'TestPass1',
        firstName: 'Create',
        lastName: 'Tester',
      });

      const response = await createNote(request, cookie, {
        title: 'API Test Note',
        content: 'Created via API test',
      });
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.note.title).toBe('API Test Note');
    });

    test('should update a note', async ({ request }) => {
      const { cookie } = await registerAndVerify(request, {
        email: `crud-update-${Date.now()}@example.com`,
        password: 'TestPass1',
        firstName: 'Update',
        lastName: 'Tester',
      });

      const createRes = await createNote(request, cookie, {
        title: 'Original Title',
        content: 'Will be updated',
      });
      const { note } = await createRes.json();

      const response = await request.patch(apiUrl(`/notes/${note.id}`), {
        data: { title: 'Updated Title' },
        headers: { Cookie: cookie },
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.note.title).toBe('Updated Title');
    });

    test('should delete a note', async ({ request }) => {
      const { cookie } = await registerAndVerify(request, {
        email: `crud-delete-${Date.now()}@example.com`,
        password: 'TestPass1',
        firstName: 'Delete',
        lastName: 'Tester',
      });

      const createRes = await createNote(request, cookie, {
        title: 'To Delete',
        content: 'Will be deleted',
      });
      const { note } = await createRes.json();

      const deleteRes = await request.delete(apiUrl(`/notes/${note.id}`), {
        headers: { Cookie: cookie },
      });
      expect(deleteRes.status()).toBe(204);
    });

    test('should reject unauthenticated access', async ({ request }) => {
      const response = await request.get(apiUrl('/notes'));
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

    test('should show error when title exceeds 255 chars', async ({ page }) => {
      await page.getByTestId(testIds.notes.btnCreate).click();
      await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
      await page.getByTestId(testIds.notes.inputTitle).fill('A'.repeat(256));
      // Blur to trigger validation
      await page.getByTestId(testIds.notes.inputContent).click();
      await expect(page.getByTestId(testIds.notes.errorTitle)).toBeVisible();
      await expect(page.getByTestId(testIds.notes.errorTitle)).toContainText('at most 255');
    });

    test('should show error when content exceeds 50,000 chars', async ({ page }) => {
      await page.getByTestId(testIds.notes.btnCreate).click();
      await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
      await page.getByTestId(testIds.notes.inputContent).fill('A'.repeat(50_001));
      // Blur to trigger validation
      await page.getByTestId(testIds.notes.inputTitle).click();
      await expect(page.getByTestId(testIds.notes.errorContent)).toBeVisible();
      await expect(page.getByTestId(testIds.notes.errorContent)).toContainText('at most 50');
    });
  });
});
