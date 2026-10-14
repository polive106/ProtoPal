---
name: add-migration
description: Guides database schema changes (PostgreSQL via Drizzle; PGlite locally), including generated migrations and seed updates.
disable-model-invocation: true
---

## Steps

1. **Modify the schema**: `packages/database/src/schema/schema.ts` (Drizzle `pg-core`)
2. **Generate a migration**: `pnpm --filter @acme/database db:generate --name <short_change_name>`
   - Review the SQL in `packages/database/migrations/` and commit it together with the schema change
   - Never edit a migration that has already been applied/merged — add a new one
3. **Update seed script**: `packages/database/src/seed.ts`
4. **Re-seed locally**: `pnpm --filter @acme/database db:seed` (PGlite applies migrations on open)
5. **Postgres servers** (`DATABASE_URL`) are migrated with `pnpm --filter @acme/database db:migrate`

## Schema Conventions

- Column names: `snake_case` (e.g., `user_id`, `created_at`)
- Primary keys: `text('id').primaryKey()` with UUID
- Timestamps: `ts('created_at').notNull()` — the local `ts` helper maps to `timestamptz` and JS `Date`
- Booleans: `boolean('is_active')`
- Epoch-millisecond numbers: `bigint('col', { mode: 'number' })` (they overflow `integer`)
- Foreign keys: `.references(() => parentTable.id, { onDelete: 'cascade' })`

## Example: Adding a "tags" column to notes

```typescript
// schema/schema.ts
export const notes = pgTable('notes', {
  // ... existing columns
  tags: text('tags').array().notNull().default([]),
});
```

```bash
pnpm --filter @acme/database db:generate --name add_note_tags
```

## IMPORTANT
- Always commit the generated migration with the schema change
- Always update the seed script with sample data
- Stop the API before seeding — a file-backed PGlite directory is single-process
