import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoPasswordResetTokenRepository } from './MongoPasswordResetTokenRepository';

describe('MongoPasswordResetTokenRepository', () => {
  let db: Db;
  let repo: MongoPasswordResetTokenRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoPasswordResetTokenRepository(db);
  });

  it('should create and find by token hash', async () => {
    const token = await repo.create({
      userId: 'user-1',
      tokenHash: 'reset-hash',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    expect(token.id).toBeTruthy();
    expect(token.userId).toBe('user-1');
    expect(token.usedAt).toBeNull();

    const found = await repo.findByTokenHash('reset-hash');
    expect(found).not.toBeNull();
    expect(found!.userId).toBe('user-1');
  });

  it('should return null for unknown token hash', async () => {
    const found = await repo.findByTokenHash('unknown');
    expect(found).toBeNull();
  });

  it('should mark token as used', async () => {
    const token = await repo.create({
      userId: 'user-1',
      tokenHash: 'reset-use',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const used = await repo.markUsed(token.id);
    expect(used.usedAt).toBeInstanceOf(Date);
  });

  it('should invalidate unused tokens by user id', async () => {
    await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-1',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const used = await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-2',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.markUsed(used.id);

    await repo.invalidateByUserId('user-1');
    // Unused token should be deleted
    expect(await repo.findByTokenHash('hash-1')).toBeNull();
    // Used token should remain
    expect(await repo.findByTokenHash('hash-2')).not.toBeNull();
  });
});
