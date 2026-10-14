import { existsSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { users, roles, userRoles, notes } from './schema';
import {
  createConnection,
  closeConnection,
  migrateDatabase,
  isPostgresUrl,
  type DatabaseConnection,
} from './connections';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.DATABASE_PATH || resolve(__dirname, '../../../data/pglite');
const BCRYPT_ROUNDS = 12;
const NO_RESET = process.argv.includes('--no-reset');
const IS_POSTGRES = isPostgresUrl(process.env.DATABASE_URL);

const TEST_CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  user: { email: 'user@example.com', password: 'User1234!' },
};

// Fixed IDs for test data
const IDS = {
  roles: { admin: 'role-admin', user: 'role-user' },
  users: { admin: 'user-admin-1', user: 'user-regular-1' },
  notes: { note1: 'note-1', note2: 'note-2', note3: 'note-3' },
};

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script cannot run in production');
    process.exit(1);
  }

  console.log('Seeding database...');

  let db: DatabaseConnection;

  if (IS_POSTGRES) {
    db = await createConnection();
    await migrateDatabase(db);
  } else {
    if (!NO_RESET && existsSync(DATA_DIR)) {
      rmSync(DATA_DIR, { recursive: true, force: true });
      console.log('  Removed existing database');
    }
    // PGlite connections apply migrations on open
    db = await createConnection(DATA_DIR);
  }

  const now = new Date();
  const adminHash = await bcrypt.hash(TEST_CREDENTIALS.admin.password, BCRYPT_ROUNDS);
  const userHash = await bcrypt.hash(TEST_CREDENTIALS.user.password, BCRYPT_ROUNDS);

  try {
    // Existing rows are left untouched so re-seeding is idempotent
    await db
      .insert(roles)
      .values([
        {
          id: IDS.roles.admin,
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full system access',
          isSystem: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: IDS.roles.user,
          name: 'user',
          displayName: 'User',
          description: 'Regular user',
          isSystem: true,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .onConflictDoNothing();

    await db
      .insert(users)
      .values([
        {
          id: IDS.users.admin,
          email: TEST_CREDENTIALS.admin.email,
          passwordHash: adminHash,
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          status: 'approved',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: IDS.users.user,
          email: TEST_CREDENTIALS.user.email,
          passwordHash: userHash,
          firstName: 'Regular',
          lastName: 'User',
          isActive: true,
          status: 'approved',
          createdAt: now,
          updatedAt: now,
        },
      ])
      .onConflictDoNothing();

    await db
      .insert(userRoles)
      .values([
        { id: 'ur-1', userId: IDS.users.admin, roleId: IDS.roles.admin, assignedAt: now },
        { id: 'ur-2', userId: IDS.users.user, roleId: IDS.roles.user, assignedAt: now },
      ])
      .onConflictDoNothing();

    await db
      .insert(notes)
      .values([
        {
          id: IDS.notes.note1,
          title: 'Getting Started',
          content: 'Welcome to the app! This is your first note.',
          userId: IDS.users.user,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: IDS.notes.note2,
          title: 'Meeting Notes',
          content: 'Discussed project roadmap and next milestones.',
          userId: IDS.users.user,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: IDS.notes.note3,
          title: 'Admin Notes',
          content: 'System configuration and maintenance schedule.',
          userId: IDS.users.admin,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .onConflictDoNothing();
  } finally {
    await closeConnection(db);
  }

  console.log('Database seeded successfully!');
  console.log(`  Admin: ${TEST_CREDENTIALS.admin.email}`);
  console.log(`  User: ${TEST_CREDENTIALS.user.email}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
