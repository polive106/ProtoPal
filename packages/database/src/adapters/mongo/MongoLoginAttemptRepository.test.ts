import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoLoginAttemptRepository } from './MongoLoginAttemptRepository';

describe('MongoLoginAttemptRepository', () => {
  let db: Db;
  let repo: MongoLoginAttemptRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoLoginAttemptRepository(db);
  });

  it('should return null for unknown email', async () => {
    const result = await repo.findByEmail('unknown@example.com');
    expect(result).toBeNull();
  });

  it('should insert a new attempt via upsertFailedAttempt', async () => {
    const result = await repo.upsertFailedAttempt('test@example.com', 1, 0, null);
    expect(result.email).toBe('test@example.com');
    expect(result.attempts).toBe(1);
    expect(result.lockoutCount).toBe(0);
    expect(result.lockedUntil).toBeNull();
  });

  it('should update existing attempt via upsertFailedAttempt', async () => {
    await repo.upsertFailedAttempt('test@example.com', 1, 0, null);
    const result = await repo.upsertFailedAttempt('test@example.com', 3, 0, null);
    expect(result.attempts).toBe(3);
  });

  it('should set lockout via upsertFailedAttempt', async () => {
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    const result = await repo.upsertFailedAttempt('test@example.com', 5, 1, lockedUntil);
    expect(result.attempts).toBe(5);
    expect(result.lockoutCount).toBe(1);
    expect(result.lockedUntil).not.toBeNull();
    expect(result.lockedUntil!.getTime()).toBeCloseTo(lockedUntil.getTime(), -2);
  });

  it('should reset attempts', async () => {
    await repo.upsertFailedAttempt('test@example.com', 4, 1, new Date(Date.now() + 60000));
    await repo.resetAttempts('test@example.com');
    const result = await repo.findByEmail('test@example.com');
    expect(result).not.toBeNull();
    expect(result!.attempts).toBe(0);
    expect(result!.lockedUntil).toBeNull();
    expect(result!.lockoutCount).toBe(1);
  });

  it('should fully unlock account (reset everything)', async () => {
    await repo.upsertFailedAttempt('test@example.com', 5, 3, new Date(Date.now() + 60000));
    await repo.unlockAccount('test@example.com');
    const result = await repo.findByEmail('test@example.com');
    expect(result).not.toBeNull();
    expect(result!.attempts).toBe(0);
    expect(result!.lockoutCount).toBe(0);
    expect(result!.lockedUntil).toBeNull();
  });
});
