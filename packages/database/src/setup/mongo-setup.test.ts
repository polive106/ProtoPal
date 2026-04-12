import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb } from '../adapters/mongo/test-helper';
import { setupMongo } from './mongo-setup';
import { COLLECTION_NAMES } from './mongo-indexes';

describe('setupMongo', () => {
  let db: Db;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    const collections = await db.listCollections().toArray();
    await Promise.all(collections.map((c) => db.dropCollection(c.name)));
  });

  it('should create all 9 collections', async () => {
    await setupMongo(db);
    const collections = (await db.listCollections().toArray()).map(
      (c) => c.name,
    );
    for (const name of COLLECTION_NAMES) {
      expect(collections).toContain(name);
    }
  });

  it('should create required indexes', async () => {
    await setupMongo(db);

    const userIndexes = await db.collection('users').indexes();
    expect(userIndexes.some((i) => i.key?.email === 1 && i.unique)).toBe(true);

    const roleIndexes = await db.collection('roles').indexes();
    expect(roleIndexes.some((i) => i.key?.name === 1 && i.unique)).toBe(true);

    const userRoleIndexes = await db.collection('user_roles').indexes();
    expect(
      userRoleIndexes.some(
        (i) => i.key?.userId === 1 && i.key?.roleId === 1 && i.unique,
      ),
    ).toBe(true);

    const noteIndexes = await db.collection('notes').indexes();
    expect(noteIndexes.some((i) => i.key?.userId === 1)).toBe(true);

    const tokenBlacklistIndexes = await db
      .collection('token_blacklist')
      .indexes();
    expect(
      tokenBlacklistIndexes.some((i) => i.key?.tokenHash === 1 && i.unique),
    ).toBe(true);
    expect(
      tokenBlacklistIndexes.some(
        (i) => i.key?.expiresAt === 1 && i.expireAfterSeconds === 0,
      ),
    ).toBe(true);

    const loginAttemptIndexes = await db
      .collection('login_attempts')
      .indexes();
    expect(
      loginAttemptIndexes.some((i) => i.key?.email === 1 && i.unique),
    ).toBe(true);
  });

  it('should seed default roles', async () => {
    await setupMongo(db);

    const roles = await db.collection('roles').find().toArray();
    expect(roles).toHaveLength(2);

    const admin = roles.find((r) => r.name === 'admin');
    expect(admin).toBeDefined();
    expect(admin!.displayName).toBe('Administrator');
    expect(admin!.isSystem).toBe(true);

    const user = roles.find((r) => r.name === 'user');
    expect(user).toBeDefined();
    expect(user!.displayName).toBe('User');
    expect(user!.isSystem).toBe(true);
  });

  it('should be idempotent — running twice causes no errors or duplicates', async () => {
    await setupMongo(db);
    await setupMongo(db);

    const collections = (await db.listCollections().toArray()).map(
      (c) => c.name,
    );
    for (const name of COLLECTION_NAMES) {
      expect(collections).toContain(name);
    }

    const roles = await db.collection('roles').find().toArray();
    expect(roles).toHaveLength(2);

    const userIndexes = await db.collection('users').indexes();
    const emailIndexes = userIndexes.filter(
      (i) => i.key?.email === 1 && i.unique,
    );
    expect(emailIndexes).toHaveLength(1);
  });
});
