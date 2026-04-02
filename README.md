# Fullstack Monorepo Scaffold

A production-ready monorepo scaffold with authentication, RBAC, and an example CRUD entity (Notes). Built for **agentic development workflows** — works with Claude Code, Cursor, and 30+ other AI coding tools via the `AGENTS.md` standard.

## What's Included

- **Auth system**: Register, login, logout, JWT HTTP-only cookies, protected routes
- **Example CRUD entity**: Notes (create, read, update, delete, user-scoped)
- **12 development skills**: review-backlog, implement-story, scaffold, add-migration, add-e2e-tests, add-unit-tests, review, redesign, commit, debug, fix-ci, story-complete
- **Hexagonal architecture**: Domain (pure TS) → Database (Drizzle) → API (NestJS) → Frontend (React)
- **Full test suite**: Unit tests (Vitest), E2E tests (Playwright)
- **CI/CD**: GitHub Actions for tests and E2E
- **Design system**: Radix UI + Tailwind components

## Quick Start

```bash
# Install dependencies
pnpm install

# Seed the database
pnpm --filter @acme/database db:seed

# Start development
pnpm dev

# Open http://localhost:5173
# Login: user@example.com / User1234!
```

## Customize

```bash
# Rename scope and project
./scripts/init.sh my-project myorg
# Replaces @acme/ → @myorg/ everywhere
```

## Stack

| Package | Technology |
|---------|-----------|
| `@acme/shared` | Pure TypeScript types |
| `@acme/domain` | Entities, ports, use cases (zero deps) |
| `@acme/database` | Drizzle ORM (SQLite local, PostgreSQL prod) |
| `@acme/api` | NestJS REST API |
| `@acme/design-system` | Radix UI + Tailwind |
| `@acme/frontend` | React + Vite + TanStack Router/Query |

## Agentic Workflow

This scaffold is designed for AI-assisted development:

- **`AGENTS.md`** — Universal instructions for any AI tool
- **`CLAUDE.md`** — Claude Code-specific config
- **`.cursorrules`** — Cursor-specific config
- **`.agents/skills/`** — 12 development workflow skills
- **`docs/backlog/`** — Backlog with stories in agent-readable format

See [docs/getting-started.md](docs/getting-started.md) for full documentation.
