import { describe, it, expect, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestConnection, type DatabaseConnection } from '../connection';
import { DrizzleNoteRepository } from './DrizzleNoteRepository';

describe('DrizzleNoteRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleNoteRepository;
  const userId = 'user-1';

  beforeEach(() => {
    db = createTestConnection();
    db.run(sql`CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, description TEXT, is_system INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    db.run(sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'pending', last_login_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    db.run(sql`CREATE TABLE IF NOT EXISTS user_roles (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, assigned_at INTEGER NOT NULL, assigned_by TEXT REFERENCES users(id))`);
    db.run(sql`CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    // Create test user
    const now = Date.now();
    db.run(sql`INSERT INTO users (id, email, first_name, last_name, is_active, status, created_at, updated_at) VALUES (${userId}, 'test@example.com', 'John', 'Doe', 1, 'approved', ${now}, ${now})`);
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
