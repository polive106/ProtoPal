import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoTokenBlacklistRepository } from './MongoTokenBlacklistRepository';

describe('MongoTokenBlacklistRepository', () => {
  let db: Db;
  let repo: MongoTokenBlacklistRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoTokenBlacklistRepository(db);
  });

  it('should add a token and confirm it exists', async () => {
    const hash = 'abc123hash';
    const expiresAt = new Date(Date.now() + 60_000);
    await repo.add(hash, expiresAt);
    const result = await repo.exists(hash);
    expect(result).toBe(true);
  });

  it('should return false for unknown token hash', async () => {
    const result = await repo.exists('nonexistent-hash');
    expect(result).toBe(false);
  });

  it('should delete only expired entries', async () => {
    const past = new Date(Date.now() - 60_000);
    const future = new Date(Date.now() + 60_000);

    await repo.add('expired-hash', past);
    await repo.add('valid-hash', future);

    const deleted = await repo.deleteExpired();
    expect(deleted).toBe(1);
    expect(await repo.exists('expired-hash')).toBe(false);
    expect(await repo.exists('valid-hash')).toBe(true);
  });
});
