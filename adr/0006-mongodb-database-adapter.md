# ADR-0006: MongoDB Database Adapter

## Status

Accepted

## Context

ProtoPal is a scaffold designed to be forked for real projects. The current persistence layer supports SQLite (local) and PostgreSQL (production) via Drizzle ORM. Some teams prefer document databases, and MongoDB is the most widely adopted. We need to offer MongoDB as an alternative database backend without compromising the existing SQL path or the hexagonal architecture.

Key constraints:
- The domain layer (`@acme/domain`) must remain database-agnostic — no MongoDB imports
- The existing SQL path must continue to work with zero regressions
- The scaffold should stay lean — no heavy ORM layers
- Switching databases should require only an environment variable change

## Decision

### MongoDB as a parallel adapter (not a replacement)

We will add MongoDB support as an alternative database engine alongside Drizzle SQL. The official `mongodb` driver will be used directly (not Mongoose, not Prisma).

### Key design choices:

1. **Official `mongodb` driver** — Mongoose adds schema enforcement, middleware, and population that overlaps with what the domain layer already handles. The raw driver keeps adapters thin and mirrors the Drizzle approach.

2. **Flat collections with references** (one collection per entity, no embedded documents) — This keeps the data model identical across SQL and MongoDB, making adapters simple and consistent. Teams that want embedded documents can optimize in their fork.

3. **`MONGODB_URL` environment variable** — When set, the connection factory returns a MongoDB connection. When unset, the existing SQL behavior is preserved. This is explicit opt-in with no ambiguity.

4. **Restructured `@acme/database` package** — The package is reorganized into `connections/`, `adapters/drizzle/`, `adapters/mongo/`, `schema/`, and `setup/` directories to cleanly separate concerns and make adding future backends straightforward.

5. **`mongodb-memory-server` for testing** — Provides isolated in-memory MongoDB instances for unit tests, analogous to SQLite `:memory:` for the Drizzle adapters.

### Architecture

```
@acme/domain (ports — unchanged)
    ↑ implements
@acme/database
  ├── connections/
  │   ├── sql.ts          # Drizzle SQLite/PostgreSQL
  │   ├── mongo.ts         # MongoDB client
  │   └── index.ts         # Factory: MONGODB_URL → Mongo, else → SQL
  ├── adapters/
  │   ├── drizzle/         # Existing Drizzle adapters (moved here)
  │   └── mongo/           # New Mongo adapters
  ├── schema/              # SQL schemas (Drizzle-only)
  └── setup/
      └── mongo-setup.ts   # Collections, indexes, seed data
```

### What each Mongo adapter does

Each `Mongo*Repository` implements the same domain port interface as its `Drizzle*` counterpart:
- Accepts a MongoDB `Db` instance via constructor
- Maps between MongoDB documents and domain entities
- Uses `crypto.randomUUID()` for ID generation (consistent with Drizzle adapters)
- No MongoDB-specific features leak into the domain

### DI wiring

The NestJS `DatabaseModule` detects the active connection type and conditionally registers either Drizzle or Mongo adapters. Consumer modules (`DomainModule`, controllers) are unaffected — they inject via the same repository tokens regardless of backend.

## Consequences

### Positive
- Developers can choose MongoDB at project start by setting one env var
- Domain layer stays completely database-agnostic
- Existing SQL path is untouched — zero regression risk after restructure
- Clean adapter pattern makes it easy to add future backends (e.g., DynamoDB, Turso)
- `@acme/database` package structure is clearer and more maintainable

### Negative
- Flat collection mapping is not idiomatic MongoDB (no embedded documents)
- Two sets of adapters to maintain (9 Drizzle + 9 Mongo)
- `mongodb` and `mongodb-memory-server` add to dependency footprint
- No Drizzle migration tooling for MongoDB — relies on a manual setup script

## Alternatives Considered

- **Mongoose**: Adds schema validation, middleware, and population. Too opinionated for a scaffold where the domain layer already handles validation and entity mapping.
- **Prisma**: Supports both SQL and MongoDB, but would require replacing Drizzle entirely — too invasive.
- **Supabase**: Considered as a managed Postgres host, but doesn't address the document database use case. Could be a separate future ADR.
- **Embedded documents**: More idiomatic MongoDB, but complicates adapters and creates divergence between SQL and Mongo data models. Flat mapping chosen for scaffold clarity.
