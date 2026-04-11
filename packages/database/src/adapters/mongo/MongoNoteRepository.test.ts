import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoNoteRepository } from './MongoNoteRepository';

describe('MongoNoteRepository', () => {
  let db: Db;
  let repo: MongoNoteRepository;
  const userId = 'user-1';

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoNoteRepository(db);
  });

  it('should create and find a note', async () => {
    const note = await repo.create({ title: 'Test', content: 'Content', userId });
    expect(note.id).toBeTruthy();
    expect(note.title).toBe('Test');
    expect(note.content).toBe('Content');
    expect(note.userId).toBe(userId);
    expect(note.createdAt).toBeInstanceOf(Date);

    const found = await repo.findById(note.id);
    expect(found).not.toBeNull();
    expect(found!.content).toBe('Content');
  });

  it('should find notes by user id', async () => {
    await repo.create({ title: 'Note 1', content: 'Content 1', userId });
    await repo.create({ title: 'Note 2', content: 'Content 2', userId });
    const notes = await repo.findByUserId(userId);
    expect(notes).toHaveLength(2);
  });

  it('should not return notes for a different user', async () => {
    await repo.create({ title: 'Note 1', content: 'Content 1', userId });
    const notes = await repo.findByUserId('other-user');
    expect(notes).toHaveLength(0);
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

  it('should return null for non-existent note', async () => {
    const found = await repo.findById('non-existent');
    expect(found).toBeNull();
  });
});
