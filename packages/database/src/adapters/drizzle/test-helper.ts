import { sql } from 'drizzle-orm';
import {
  createTestConnection,
  closeConnection,
  type DatabaseConnection,
} from '../../connections/sql';
import { users } from '../../schema';

let db: DatabaseConnection | null = null;

/** Boots one migrated in-memory PGlite database for the test file. */
export async function setupTestDb(): Promise<DatabaseConnection> {
  db = await createTestConnection();
  return db;
}

export async function teardownTestDb(): Promise<void> {
  if (db) {
    await closeConnection(db);
    db = null;
  }
}

/** Empties every table in the public schema, keeping the schema itself. */
export async function clearTables(): Promise<void> {
  if (!db) return;
  const rows = await db
    .select({ name: sql<string>`tablename` })
    .from(sql`pg_tables`)
    .where(sql`schemaname = 'public'`);
  if (rows.length === 0) return;
  const tables = rows.map((r) => `"${r.name}"`).join(', ');
  await db.execute(sql.raw(`TRUNCATE ${tables} CASCADE`));
}

/** Inserts a minimal user row so foreign keys to users(id) are satisfied. */
export async function insertTestUser(
  db: DatabaseConnection,
  id: string,
  email = `${id}@example.com`
): Promise<void> {
  const now = new Date();
  await db.insert(users).values({
    id,
    email,
    firstName: 'John',
    lastName: 'Doe',
    status: 'approved',
    createdAt: now,
    updatedAt: now,
  });
}
