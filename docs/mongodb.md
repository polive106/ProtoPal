# MongoDB Support

ProtoPal supports MongoDB as an alternative database backend alongside Drizzle SQL (SQLite/PostgreSQL). Switching between backends requires only an environment variable change — the domain layer and API endpoints remain identical.

## Prerequisites

- **MongoDB 6.0+** installed locally, or accessible via a connection string
- Alternatively, run MongoDB via Docker:
  ```bash
  docker run -d --name mongo -p 27017:27017 mongo:7
  ```

## Configuration

Set the `MONGODB_URL` environment variable in your `.env` file:

```env
MONGODB_URL=mongodb://localhost:27017/protopal
```

When `MONGODB_URL` is set, the application automatically uses MongoDB. When it is not set (or commented out), the application falls back to SQL (SQLite or PostgreSQL).

### Connection String Format

```
mongodb://[username:password@]host[:port]/database[?options]
```

Examples:
- Local: `mongodb://localhost:27017/protopal`
- With auth: `mongodb://admin:secret@localhost:27017/protopal?authSource=admin`
- Atlas: `mongodb+srv://user:pass@cluster0.example.mongodb.net/protopal`

## Setup

Run the setup script to create collections, indexes, and seed default roles:

```bash
pnpm --filter @acme/database db:setup:mongo
```

This script is **idempotent** — safe to run multiple times. It:
1. Creates 9 collections: `users`, `notes`, `roles`, `user_roles`, `login_attempts`, `verification_tokens`, `password_reset_tokens`, `token_blacklist`, `rate_limit_entries`
2. Creates unique indexes (e.g., `users.email`, `roles.name`)
3. Creates compound indexes (e.g., `user_roles(userId, roleId)`)
4. Creates TTL indexes for automatic expiry on token collections
5. Seeds default roles: `admin` and `user`

## Running the Application

```bash
# Start development servers (API + Frontend)
pnpm dev
```

The API will connect to MongoDB automatically when `MONGODB_URL` is set.

## How It Works

### Adapter Architecture

ProtoPal uses a hexagonal (ports and adapters) architecture. The domain layer defines repository **ports** (interfaces), and the database layer provides **adapters** (implementations):

```
Domain Ports (interfaces)          Adapters
─────────────────────────          ────────
UserRepository            ───>     DrizzleUserRepository  (SQL)
                          ───>     MongoUserRepository    (MongoDB)
NoteRepository            ───>     DrizzleNoteRepository  (SQL)
                          ───>     MongoNoteRepository    (MongoDB)
... (9 repositories total)
```

### Database Selection

The `DatabaseModule` in the API layer detects which backend to use:

1. Checks `process.env.MONGODB_URL`
2. If set: creates a MongoDB connection and wires all `Mongo*Repository` adapters
3. If not set: creates a SQL connection and wires all `Drizzle*Repository` adapters

No other code changes are needed — controllers, use-cases, and the frontend are all unaware of which database backend is active.

### MongoDB Design Decisions

- **Official `mongodb` driver** — not Mongoose. Keeps the adapter layer thin and explicit.
- **Flat collections** — one collection per entity, no embedded documents. This mirrors the SQL schema for consistency.
- **UUID primary keys** — stored as `_id` strings via `crypto.randomUUID()`.
- **TTL indexes** — used for automatic cleanup of expired tokens (verification, password reset, blacklist). Rate limit entries use numeric timestamps and are cleaned up manually via `deleteExpired()`.

For the full rationale, see [ADR-0006: MongoDB Database Adapter](../adr/0006-mongodb-database-adapter.md).

## Switching Back to SQL

Comment out or remove `MONGODB_URL` from your `.env` file and restart:

```env
# MONGODB_URL=mongodb://localhost:27017/protopal
```

The application will fall back to SQLite (local dev) or PostgreSQL (if `DATABASE_URL` is set).

## Troubleshooting

### Connection refused

```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

MongoDB is not running. Start it:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Docker
docker start mongo
```

### Authentication failed

```
MongoServerError: Authentication failed
```

Check your connection string credentials. If using a local instance without auth, ensure no `username:password@` is in the URL. If auth is enabled:
```bash
mongosh --eval "db.getSiblingDB('admin').createUser({user:'admin',pwd:'secret',roles:['root']})"
```

### Index conflicts

```
MongoServerError: Index already exists with a different name
```

This can happen if you manually created indexes before running the setup script. Drop conflicting indexes and re-run:
```bash
mongosh protopal --eval "db.users.dropIndexes()"
pnpm --filter @acme/database db:setup:mongo
```

### Rate limit entries not expiring

Rate limit entries use numeric timestamps (`Date.now()`) rather than `Date` objects, so MongoDB TTL indexes cannot auto-expire them. Cleanup is handled by the application's `deleteExpired()` method, which runs periodically via the `TokenCleanupService`.
