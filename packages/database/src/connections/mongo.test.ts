import { describe, it, expect, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createMongoConnection } from './mongo';

describe('createMongoConnection', () => {
  let mongod: MongoMemoryServer;
  let uri: string;

  afterAll(async () => {
    if (mongod) await mongod.stop();
  });

  it('should create a MongoConnection with type "mongo"', async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const conn = await createMongoConnection(uri);
    expect(conn.type).toBe('mongo');
    await conn.close();
  });

  it('should provide a valid Db instance', async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const conn = await createMongoConnection(uri);
    expect(conn.db).toBeDefined();
    expect(conn.db.databaseName).toBeTruthy();
    await conn.close();
  });

  it('should disconnect when close() is called', async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const conn = await createMongoConnection(uri);
    await conn.close();
    // After close, the client should no longer accept commands
    await expect(conn.db.command({ ping: 1 })).rejects.toThrow();
  });
});
