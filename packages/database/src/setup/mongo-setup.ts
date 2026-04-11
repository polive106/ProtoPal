import { randomUUID } from 'crypto';
import type { Db } from 'mongodb';
import { MONGO_INDEXES, COLLECTION_NAMES } from './mongo-indexes';

const DEFAULT_ROLES = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    isSystem: true,
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Regular user',
    isSystem: true,
  },
];

async function createCollections(db: Db): Promise<void> {
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  for (const name of COLLECTION_NAMES) {
    if (!existing.includes(name)) {
      await db.createCollection(name);
    }
  }
}

async function createIndexes(db: Db): Promise<void> {
  for (const [collection, indexes] of Object.entries(MONGO_INDEXES)) {
    for (const index of indexes) {
      await db.collection(collection).createIndex(index.key, {
        unique: index.unique ?? false,
        ...(index.expireAfterSeconds != null && {
          expireAfterSeconds: index.expireAfterSeconds,
        }),
      });
    }
  }
}

async function seedRoles(db: Db): Promise<void> {
  const roles = db.collection('roles');
  const now = new Date();

  for (const role of DEFAULT_ROLES) {
    await roles.updateOne(
      { name: role.name },
      {
        $setOnInsert: {
          _id: randomUUID(),
          ...role,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }
}

export async function setupMongo(db: Db): Promise<void> {
  await createCollections(db);
  await createIndexes(db);
  await seedRoles(db);
}

// CLI entrypoint
const isCli =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].includes('mongo-setup');

if (isCli) {
  (async () => {
    const url = process.env.MONGODB_URL;
    if (!url) {
      console.error('ERROR: MONGODB_URL environment variable is not set');
      process.exit(1);
    }

    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(url);
    try {
      await client.connect();
      const db = client.db();
      console.log('Running MongoDB setup...');
      await setupMongo(db);
      console.log('MongoDB setup complete!');
      console.log('  Collections created: ' + COLLECTION_NAMES.join(', '));
      console.log('  Default roles seeded: admin, user');
    } finally {
      await client.close();
    }
  })().catch((err) => {
    console.error('MongoDB setup failed:', err);
    process.exit(1);
  });
}
