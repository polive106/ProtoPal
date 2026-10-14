# ADR-0001: Database ORM Choice

## Status

Accepted — the SQLite-for-local-development part is superseded by [ADR-0007](./0007-pglite-local-database.md) (PGlite). Drizzle remains the ORM.

## Context

We need a database ORM that supports:
- SQLite for local development (zero-config, file-based)
- PostgreSQL for production (managed, scalable)
- TypeScript-first with type safety
- Schema-as-code with migration support

## Decision

We chose **Drizzle ORM** because:
- Dual-dialect support (SQLite + PostgreSQL) with a shared API
- Schema defined in TypeScript (schema-as-code)
- Zero runtime overhead (SQL queries, no query builder abstraction)
- Built-in migration tooling via drizzle-kit
- Type-safe queries with full IntelliSense

## Consequences

### Positive
- Developers run SQLite locally with zero setup
- Production uses PostgreSQL without code changes
- Schema changes are type-checked at compile time
- Drizzle Studio provides a visual database explorer

### Negative
- Two schema files must be maintained (sqlite + postgres)
- Some Drizzle-specific patterns differ from other ORMs
- Developers need to understand both SQLite and PostgreSQL quirks

## Alternatives Considered
- **Prisma**: Heavier runtime, no dual-dialect support
- **TypeORM**: Decorator-heavy, weaker type inference
- **Knex**: Query builder only, no schema-as-code
