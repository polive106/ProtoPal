import { test, expect } from '@playwright/test';
import { testCredentials, testIds } from '../../fixtures';
import { loginAs, createNote } from '../../fixtures/api-helpers';

test.describe('Note Drawer Validation & Edit Flow @ui', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId(testIds.login.inputEmail).fill(testCredentials.user.email);
    await page.getByTestId(testIds.login.inputPassword).fill(testCredentials.user.password);
    await page.getByTestId(testIds.login.btnSubmit).click();
    await expect(page.getByTestId(testIds.dashboard.page)).toBeVisible();
    await page.goto('/notes');
    await expect(page.getByTestId(testIds.notes.pageTitle)).toBeVisible();
  });

  test('should show "Title is required" error on empty blur', async ({ page }) => {
    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    // Type then clear to trigger onChange validation, then blur
    await page.getByTestId(testIds.notes.inputTitle).fill('a');
    await page.getByTestId(testIds.notes.inputTitle).clear();
    await page.getByTestId(testIds.notes.inputContent).click();
    await expect(page.getByTestId(testIds.notes.errorTitle)).toBeVisible();
    await expect(page.getByTestId(testIds.notes.errorTitle)).toContainText('Title is required');
  });

  test('should show "Content is required" error on empty blur', async ({ page }) => {
    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    // Type then clear to trigger onChange validation, then blur
    await page.getByTestId(testIds.notes.inputContent).fill('a');
    await page.getByTestId(testIds.notes.inputContent).clear();
    await page.getByTestId(testIds.notes.inputTitle).click();
    await expect(page.getByTestId(testIds.notes.errorContent)).toBeVisible();
    await expect(page.getByTestId(testIds.notes.errorContent)).toContainText('Content is required');
  });

  test('should accept title at exactly 255 characters', async ({ page }) => {
    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    await page.getByTestId(testIds.notes.inputTitle).fill('A'.repeat(255));
    await page.getByTestId(testIds.notes.inputContent).fill('Valid content');
    await page.getByTestId(testIds.notes.btnSave).click();
    await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
  });

  test('should accept content at exactly 50,000 characters', async ({ page }) => {
    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    await page.getByTestId(testIds.notes.inputTitle).fill('Boundary Test Note');
    await page.getByTestId(testIds.notes.inputContent).fill('B'.repeat(50_000));
    await page.getByTestId(testIds.notes.btnSave).click();
    await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
  });

  test('should close drawer without saving when cancel is clicked', async ({ page }) => {
    const uniqueTitle = `Cancel Test ${Date.now()}`;
    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    await page.getByTestId(testIds.notes.inputTitle).fill(uniqueTitle);
    await page.getByTestId(testIds.notes.inputContent).fill('Should not be saved');
    await page.getByTestId(testIds.notes.btnCancel).click();
    await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
    // Verify the note was not created - page should not contain a card with that title
    const cards = page.locator('[data-testid^="notes-card-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const cardTestId = await cards.nth(i).getAttribute('data-testid');
      const noteId = cardTestId!.replace('notes-card-', '');
      await expect(page.getByTestId(testIds.notes.title(noteId))).not.toContainText(uniqueTitle);
    }
  });

  test('should edit existing note with pre-filled form and update', async ({ page, request }) => {
    // Create a note via API for this test
    const cookie = await loginAs(request, testCredentials.user);
    const uniqueTitle = `Edit Flow ${Date.now()}`;
    const createRes = await createNote(request, cookie, {
      title: uniqueTitle,
      content: 'Original content for edit test',
    });
    const { note } = await createRes.json();

    // Reload to see the new note
    await page.reload();
    await expect(page.getByTestId(testIds.notes.pageTitle)).toBeVisible();

    // Click edit on the note card
    await page.getByTestId(testIds.notes.btnEdit(note.id)).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();

    // Verify form is pre-filled
    await expect(page.getByTestId(testIds.notes.inputTitle)).toHaveValue(uniqueTitle);
    await expect(page.getByTestId(testIds.notes.inputContent)).toHaveValue('Original content for edit test');

    // Update the title
    const updatedTitle = `Updated ${Date.now()}`;
    await page.getByTestId(testIds.notes.inputTitle).clear();
    await page.getByTestId(testIds.notes.inputTitle).fill(updatedTitle);
    await page.getByTestId(testIds.notes.btnSave).click();
    await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();

    // Verify updated title in the list
    await expect(page.getByTestId(testIds.notes.title(note.id))).toContainText(updatedTitle);
  });

  test('should show "Edit Note" title and "Update" button in edit mode', async ({ page, request }) => {
    // Create a note via API
    const cookie = await loginAs(request, testCredentials.user);
    const createRes = await createNote(request, cookie, {
      title: `Edit Mode UI ${Date.now()}`,
      content: 'Content for edit mode test',
    });
    const { note } = await createRes.json();

    await page.reload();
    await expect(page.getByTestId(testIds.notes.pageTitle)).toBeVisible();

    // Open edit drawer
    await page.getByTestId(testIds.notes.btnEdit(note.id)).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();

    // Verify edit mode UI text
    await expect(page.getByTestId(testIds.notes.form)).toContainText('Edit Note');
    await expect(page.getByTestId(testIds.notes.btnSave)).toContainText('Update');
  });

  test('should show "Saving..." button text during creation', async ({ page }) => {
    // Intercept the POST /notes request and delay it
    let resolveRoute: () => void;
    const routePromise = new Promise<void>((resolve) => {
      resolveRoute = resolve;
    });
    await page.route('**/notes', async (route) => {
      if (route.request().method() === 'POST') {
        await routePromise;
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.getByTestId(testIds.notes.btnCreate).click();
    await expect(page.getByTestId(testIds.notes.form)).toBeVisible();
    await page.getByTestId(testIds.notes.inputTitle).fill('Saving Test Note');
    await page.getByTestId(testIds.notes.inputContent).fill('Testing saving state');
    await page.getByTestId(testIds.notes.btnSave).click();

    // Verify the button shows "Saving..."
    await expect(page.getByTestId(testIds.notes.btnSave)).toContainText('Saving...');

    // Release the route to complete the request
    resolveRoute!();
    await expect(page.getByTestId(testIds.notes.form)).not.toBeVisible();
  });

  test('should delete note from list', async ({ page, request }) => {
    // Create a note via API
    const cookie = await loginAs(request, testCredentials.user);
    const uniqueTitle = `Delete Test ${Date.now()}`;
    const createRes = await createNote(request, cookie, {
      title: uniqueTitle,
      content: 'Content to be deleted',
    });
    const { note } = await createRes.json();

    await page.reload();
    await expect(page.getByTestId(testIds.notes.pageTitle)).toBeVisible();

    // Verify the note exists
    await expect(page.getByTestId(testIds.notes.card(note.id))).toBeVisible();

    // Click delete
    await page.getByTestId(testIds.notes.btnDelete(note.id)).click();

    // Verify the note card is removed
    await expect(page.getByTestId(testIds.notes.card(note.id))).not.toBeVisible();
  });
});
