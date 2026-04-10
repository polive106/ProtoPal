import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoVerificationTokenRepository } from './MongoVerificationTokenRepository';

describe('MongoVerificationTokenRepository', () => {
  let db: Db;
  let repo: MongoVerificationTokenRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoVerificationTokenRepository(db);
  });

  it('should create and find by token hash', async () => {
    const token = await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-abc',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    expect(token.id).toBeTruthy();
    expect(token.userId).toBe('user-1');
    expect(token.verifiedAt).toBeNull();

    const found = await repo.findByTokenHash('hash-abc');
    expect(found).not.toBeNull();
    expect(found!.userId).toBe('user-1');
  });

  it('should return null for unknown token hash', async () => {
    const found = await repo.findByTokenHash('unknown');
    expect(found).toBeNull();
  });

  it('should find active token by user id', async () => {
    await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-active',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const found = await repo.findActiveByUserId('user-1');
    expect(found).not.toBeNull();
    expect(found!.tokenHash).toBe('hash-active');
  });

  it('should not return expired token as active', async () => {
    await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-expired',
      expiresAt: new Date(Date.now() - 1000),
    });
    const found = await repo.findActiveByUserId('user-1');
    expect(found).toBeNull();
  });

  it('should not return verified token as active', async () => {
    const token = await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-verified',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.markVerified(token.id);
    const found = await repo.findActiveByUserId('user-1');
    expect(found).toBeNull();
  });

  it('should mark token as verified', async () => {
    const token = await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-mark',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const verified = await repo.markVerified(token.id);
    expect(verified.verifiedAt).toBeInstanceOf(Date);
  });

  it('should invalidate unverified tokens by user id', async () => {
    await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-1',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      userId: 'user-1',
      tokenHash: 'hash-2',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.invalidateByUserId('user-1');
    expect(await repo.findByTokenHash('hash-1')).toBeNull();
    expect(await repo.findByTokenHash('hash-2')).toBeNull();
  });
});
