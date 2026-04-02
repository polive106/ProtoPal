---
name: add-migration
description: Guides database schema changes across SQLite and PostgreSQL, including seed updates and schema push.
disable-model-invocation: true
---

## Steps

1. **Modify SQLite schema**: `packages/database/src/schema.sqlite.ts`
2. **Modify PostgreSQL schema**: `packages/database/src/schema.postgres.ts`
3. **Update seed script**: `packages/database/src/seed.ts`
4. **Update E2E seed**: `e2e/seed.ts`
5. **Push schema**: `pnpm --filter @acme/database db:push`
6. **Re-seed**: `pnpm --filter @acme/database db:seed`

## Schema Conventions

- Column names: `snake_case` (e.g., `user_id`, `created_at`)
- Primary keys: `text('id').primaryKey()` with UUID
- Timestamps: `integer('created_at', { mode: 'timestamp_ms' }).notNull()` (SQLite)
- Booleans: `integer('is_active', { mode: 'boolean' })` (SQLite)
- Foreign keys: `.references(() => parentTable.id, { onDelete: 'cascade' })`

## Example: Adding a "tags" column to notes

```typescript
// schema.sqlite.ts
export const notes = sqliteTable('notes', {
  // ... existing columns
  tags: text('tags'), // JSON string of tag names
});

// schema.postgres.ts
export const notes = pgTable('notes', {
  // ... existing columns
  tags: text('tags'),
});
```

## IMPORTANT
- Always update BOTH schema files (sqlite + postgres)
- Always update the seed script with sample data
- Always update the E2E seed script
