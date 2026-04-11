import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createMongoConnection } from './mongo';

describe('createMongoConnection', () => {
  let mongod: MongoMemoryServer;
  let uri: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  });

  afterAll(async () => {
    if (mongod) await mongod.stop();
  });

  it('should create a MongoConnection with type "mongo"', async () => {
    const conn = await createMongoConnection(uri);
    expect(conn.type).toBe('mongo');
    await conn.close();
  });

  it('should provide a valid Db instance', async () => {
    const conn = await createMongoConnection(uri);
    expect(conn.db).toBeDefined();
    expect(conn.db.databaseName).toBeTruthy();
    await conn.close();
  });

  it('should disconnect when close() is called', async () => {
    const conn = await createMongoConnection(uri);
    await conn.close();
    await expect(conn.db.command({ ping: 1 })).rejects.toThrow();
  });
});
