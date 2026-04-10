import type { Db, MongoClient } from 'mongodb';
import type { DatabaseConnection } from './sql';

export interface SqlConnection {
  type: 'sql';
  db: DatabaseConnection;
}

export interface MongoConnection {
  type: 'mongo';
  db: Db;
  client: MongoClient;
  close(): Promise<void>;
}

export type AppConnection = SqlConnection | MongoConnection;
