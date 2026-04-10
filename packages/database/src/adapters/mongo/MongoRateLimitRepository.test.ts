import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoRateLimitRepository } from './MongoRateLimitRepository';

describe('MongoRateLimitRepository', () => {
  let db: Db;
  let repo: MongoRateLimitRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearCollections();
    repo = new MongoRateLimitRepository(db);
  });

  it('should return null for unknown key', async () => {
    const result = await repo.get('unknown-key');
    expect(result).toBeNull();
  });

  it('should insert a new entry via upsert', async () => {
    const now = Date.now();
    await repo.upsert({
      key: 'login:127.0.0.1',
      count: 1,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });

    const entry = await repo.get('login:127.0.0.1');
    expect(entry).not.toBeNull();
    expect(entry!.key).toBe('login:127.0.0.1');
    expect(entry!.count).toBe(1);
    expect(entry!.windowStart).toBe(now);
    expect(entry!.prevCount).toBe(0);
    expect(entry!.prevWindowStart).toBeNull();
  });

  it('should update existing entry via upsert', async () => {
    const now = Date.now();
    await repo.upsert({
      key: 'login:127.0.0.1',
      count: 1,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });

    await repo.upsert({
      key: 'login:127.0.0.1',
      count: 3,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });

    const entry = await repo.get('login:127.0.0.1');
    expect(entry!.count).toBe(3);
  });

  it('should delete only expired entries', async () => {
    const now = Date.now();
    await repo.upsert({
      key: 'expired-key',
      count: 5,
      windowStart: now - 200_000,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now - 100,
    });
    await repo.upsert({
      key: 'valid-key',
      count: 1,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });

    const deleted = await repo.deleteExpired();
    expect(deleted).toBe(1);
    expect(await repo.get('expired-key')).toBeNull();
    expect(await repo.get('valid-key')).not.toBeNull();
  });

  it('should delete all entries', async () => {
    const now = Date.now();
    await repo.upsert({
      key: 'key-1',
      count: 1,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });
    await repo.upsert({
      key: 'key-2',
      count: 2,
      windowStart: now,
      prevCount: 0,
      prevWindowStart: null,
      expiresAt: now + 120_000,
    });

    await repo.deleteAll();
    expect(await repo.get('key-1')).toBeNull();
    expect(await repo.get('key-2')).toBeNull();
  });

  it('should preserve prevCount and prevWindowStart', async () => {
    const now = Date.now();
    const prevStart = now - 60_000;

    await repo.upsert({
      key: 'login:test@test.com',
      count: 2,
      windowStart: now,
      prevCount: 4,
      prevWindowStart: prevStart,
      expiresAt: now + 120_000,
    });

    const entry = await repo.get('login:test@test.com');
    expect(entry!.prevCount).toBe(4);
    expect(entry!.prevWindowStart).toBe(prevStart);
  });
});
