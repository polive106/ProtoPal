import { describe, it, expect, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestConnection, type DatabaseConnection } from '../../connections/sql';
import { DrizzleRateLimitRepository } from './DrizzleRateLimitRepository';

describe('DrizzleRateLimitRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleRateLimitRepository;

  beforeEach(() => {
    db = createTestConnection();
    db.run(sql`CREATE TABLE IF NOT EXISTS rate_limit_entries (key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL, prev_count INTEGER NOT NULL DEFAULT 0, prev_window_start INTEGER, expires_at INTEGER NOT NULL)`);
    repo = new DrizzleRateLimitRepository(db);
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
