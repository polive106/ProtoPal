import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { users } from '../../schema';
import type { DatabaseConnection } from '../../connections/sql';
import { setupTestDb, teardownTestDb, clearTables } from './test-helper';
import { DrizzleNoteRepository } from './DrizzleNoteRepository';

describe('DrizzleNoteRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleNoteRepository;
  const userId = 'user-1';

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTables();
    // Create test user
    const now = new Date();
    await db.insert(users).values({
      id: userId,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'approved',
      createdAt: now,
      updatedAt: now,
    });
    repo = new DrizzleNoteRepository(db);
  });

  it('should create and find a note', async () => {
    const note = await repo.create({ title: 'Test', content: 'Content', userId });
    expect(note.title).toBe('Test');
    const found = await repo.findById(note.id);
    expect(found).toBeDefined();
    expect(found!.content).toBe('Content');
  });

  it('should find notes by user id', async () => {
    await repo.create({ title: 'Note 1', content: 'Content 1', userId });
    await repo.create({ title: 'Note 2', content: 'Content 2', userId });
    const notes = await repo.findByUserId(userId);
    expect(notes).toHaveLength(2);
  });

  it('should update a note', async () => {
    const note = await repo.create({ title: 'Old', content: 'Old content', userId });
    const updated = await repo.update(note.id, { title: 'New' });
    expect(updated.title).toBe('New');
    expect(updated.content).toBe('Old content');
  });

  it('should delete a note', async () => {
    const note = await repo.create({ title: 'To Delete', content: 'Content', userId });
    await repo.delete(note.id);
    const found = await repo.findById(note.id);
    expect(found).toBeNull();
  });
});
