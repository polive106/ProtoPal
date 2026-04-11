import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoUserRepository } from './MongoUserRepository';

describe('MongoUserRepository', () => {
  let db: Db;
  let repo: MongoUserRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoUserRepository(db);
  });

  it('should create and find a user by id', async () => {
    const user = await repo.create({
      email: 'test@example.com',
      passwordHash: 'hash',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(user.id).toBeTruthy();
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
    expect(user.createdAt).toBeInstanceOf(Date);

    const found = await repo.findById(user.id);
    expect(found).not.toBeNull();
    expect(found!.firstName).toBe('John');
  });

  it('should find by email', async () => {
    await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    const found = await repo.findByEmail('test@example.com');
    expect(found).not.toBeNull();
    expect(found!.email).toBe('test@example.com');
  });

  it('should return null for non-existent user', async () => {
    const found = await repo.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should update a user', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    const updated = await repo.update(user.id, { firstName: 'Jane' });
    expect(updated.firstName).toBe('Jane');
    expect(updated.lastName).toBe('Doe');
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

  it('should default to pending status and active', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    expect(user.status).toBe('pending');
    expect(user.isActive).toBe(true);
    expect(user.tokenVersion).toBe(0);
  });

  it('should handle passwordHash as optional', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    expect(user.passwordHash).toBeUndefined();
  });

  it('should update lastLoginAt', async () => {
    const user = await repo.create({ email: 'test@example.com', firstName: 'John', lastName: 'Doe' });
    const loginDate = new Date();
    const updated = await repo.update(user.id, { lastLoginAt: loginDate });
    expect(updated.lastLoginAt).toBeInstanceOf(Date);
    expect(updated.lastLoginAt!.getTime()).toBeCloseTo(loginDate.getTime(), -2);
  });
});
