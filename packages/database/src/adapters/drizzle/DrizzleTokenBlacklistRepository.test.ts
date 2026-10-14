import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { DatabaseConnection } from '../../connections/sql';
import { setupTestDb, teardownTestDb, clearTables } from './test-helper';
import { DrizzleTokenBlacklistRepository } from './DrizzleTokenBlacklistRepository';

describe('DrizzleTokenBlacklistRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleTokenBlacklistRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTables();
    repo = new DrizzleTokenBlacklistRepository(db);
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
