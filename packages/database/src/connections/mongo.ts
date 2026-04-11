import { MongoClient } from 'mongodb';
import type { MongoConnection } from './types';

export async function createMongoConnection(url: string): Promise<MongoConnection> {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db();

  return {
    type: 'mongo',
    db,
    client,
    async close() {
      await client.close();
    },
  };
}
