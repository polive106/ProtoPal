import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, type Db } from 'mongodb';

let mongod: MongoMemoryServer | null = null;
let client: MongoClient | null = null;
let db: Db | null = null;

export async function setupTestDb(): Promise<Db> {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  return db;
}

export async function teardownTestDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  db = null;
}

export async function clearCollections(): Promise<void> {
  if (!db) return;
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }
}
