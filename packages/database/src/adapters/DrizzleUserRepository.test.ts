import { describe, it, expect, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestConnection, type DatabaseConnection } from '../connection';
import { DrizzleUserRepository } from './DrizzleUserRepository';
import { DrizzleRoleRepository } from './DrizzleRoleRepository';

describe('DrizzleUserRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleUserRepository;

  beforeEach(() => {
    db = createTestConnection();
    // Create tables
    db.run(sql`CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, description TEXT, is_system INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    db.run(sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'pending', last_login_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    db.run(sql`CREATE TABLE IF NOT EXISTS user_roles (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, assigned_at INTEGER NOT NULL, assigned_by TEXT REFERENCES users(id))`);
    db.run(sql`CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    repo = new DrizzleUserRepository(db);
  });

  it('should create and find a user', async () => {
    const user = await repo.create({
      email: 'test@example.com',
      passwordHash: 'hash',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(user.email).toBe('test@example.com');

    const found = await repo.findById(user.id);
    expect(found).toBeDefined();
    expect(found!.firstName).toBe('John');
  });

  it('should find by email', async () => {
    await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    const found = await repo.findByEmail('test@example.com');
    expect(found).toBeDefined();
  });

  it('should return null for non-existent user', async () => {
    const found = await repo.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should update a user', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    const updated = await repo.update(user.id, { firstName: 'Jane' });
    expect(updated.firstName).toBe('Jane');
  });

  it('should delete a user', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    await repo.delete(user.id);
    const found = await repo.findById(user.id);
    expect(found).toBeNull();
  });

  it('should find all users', async () => {
    await repo.create({ email: 'a@example.com', firstName: 'A', lastName: 'User' });
    await repo.create({ email: 'b@example.com', firstName: 'B', lastName: 'User' });
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it('should find by status', async () => {
    await repo.create({ email: 'a@example.com', firstName: 'A', lastName: 'User', status: 'approved' });
    await repo.create({ email: 'b@example.com', firstName: 'B', lastName: 'User', status: 'pending' });
    const approved = await repo.findByStatus('approved');
    expect(approved).toHaveLength(1);
    expect(approved[0]!.email).toBe('a@example.com');
  });
});
