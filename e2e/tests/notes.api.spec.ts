import { test, expect } from '@playwright/test';
import { apiUrl, registerAndVerify, createNote } from '../fixtures/api-helpers';

let cookie: string;
const testUser = {
  email: `notes-test-${Date.now()}@example.com`,
  password: 'TestPass1',
  firstName: 'Notes',
  lastName: 'Tester',
};

test.beforeAll(async ({ request }) => {
  const result = await registerAndVerify(request, testUser);
  cookie = result.cookie;
});

test.describe('Notes API @api', () => {
  test('List notes (empty for new user)', async ({ request }) => {
    const response = await request.get(apiUrl('/notes'), {
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.notes).toEqual([]);
  });

  test('Create note → appears in list', async ({ request }) => {
    const noteData = { title: 'Test Note', content: 'Some content' };
    const createResponse = await createNote(request, cookie, noteData);

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created.note.title).toBe(noteData.title);

    const listResponse = await request.get(apiUrl('/notes'), {
      headers: { Cookie: cookie },
    });
    const listBody = await listResponse.json();
    const found = listBody.notes.find((n: { id: string }) => n.id === created.note.id);
    expect(found).toBeTruthy();
  });

  test('Get note by ID', async ({ request }) => {
    const noteData = { title: 'Get By ID', content: 'Content here' };
    const createResponse = await createNote(request, cookie, noteData);
    const created = await createResponse.json();

    const response = await request.get(apiUrl(`/notes/${created.note.id}`), {
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.note.title).toBe(noteData.title);
    expect(body.note.content).toBe(noteData.content);
  });

  test('Update note', async ({ request }) => {
    const noteData = { title: 'Before Update', content: 'Original' };
    const createResponse = await createNote(request, cookie, noteData);
    const created = await createResponse.json();

    const updateResponse = await request.patch(apiUrl(`/notes/${created.note.id}`), {
      data: { title: 'After Update' },
      headers: { Cookie: cookie },
    });

    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated.note.title).toBe('After Update');
  });

  test('Delete note → no longer in list', async ({ request }) => {
    const noteData = { title: 'To Delete', content: 'Will be removed' };
    const createResponse = await createNote(request, cookie, noteData);
    const created = await createResponse.json();

    const deleteResponse = await request.delete(apiUrl(`/notes/${created.note.id}`), {
      headers: { Cookie: cookie },
    });
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await request.get(apiUrl(`/notes/${created.note.id}`), {
      headers: { Cookie: cookie },
    });
    expect(getResponse.status()).toBe(404);
  });

  test('Get another user\'s note → 403', async ({ request }) => {
    // Create a note as the test user
    const noteData = { title: 'Private Note', content: 'Not for others' };
    const createResponse = await createNote(request, cookie, noteData);
    const created = await createResponse.json();

    // Register and login as a second user
    const secondUser = {
      email: `notes-other-${Date.now()}@example.com`,
      password: 'TestPass1',
      firstName: 'Other',
      lastName: 'User',
    };
    const secondResult = await registerAndVerify(request, secondUser);
    const secondCookie = secondResult.cookie;

    // Try to access first user's note
    const response = await request.get(apiUrl(`/notes/${created.note.id}`), {
      headers: { Cookie: secondCookie },
    });
    expect(response.status()).toBe(403);
  });

  test('Create note with empty body → 400', async ({ request }) => {
    const response = await request.post(apiUrl('/notes'), {
      data: {},
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(400);
  });

  test('Create note with title exceeding 255 chars → 400', async ({ request }) => {
    const response = await request.post(apiUrl('/notes'), {
      data: { title: 'A'.repeat(256), content: 'Valid content' },
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(400);
  });

  test('Create note with content exceeding 50,000 chars → 400', async ({ request }) => {
    const response = await request.post(apiUrl('/notes'), {
      data: { title: 'Valid title', content: 'A'.repeat(50_001) },
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(400);
  });
});
