import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { DatabaseConnection } from '../../connections/sql';
import { setupTestDb, teardownTestDb, clearTables } from './test-helper';
import { DrizzleUserRepository } from './DrizzleUserRepository';
import { DrizzleRoleRepository } from './DrizzleRoleRepository';

describe('DrizzleUserRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleUserRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTables();
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
