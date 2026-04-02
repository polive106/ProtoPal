# Getting Started

## Prerequisites

- Node.js >= 20
- pnpm 9.4.0

## Quick Start

```bash
# Install dependencies
pnpm install

# Seed the database with sample data
pnpm --filter @acme/database db:seed

# Start development servers (API + Frontend)
pnpm dev

# Open the app
open http://localhost:5173
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin123! |
| User | user@example.com | User1234! |

## Available Commands

```bash
# Development
pnpm dev                              # Start all dev servers
pnpm --filter @acme/api dev           # API only (port 3000)
pnpm --filter @acme/frontend dev      # Frontend only (port 5173)

# Database
pnpm --filter @acme/database db:push  # Apply schema to SQLite
pnpm --filter @acme/database db:seed  # Seed with sample data
pnpm --filter @acme/database db:studio # Visual database explorer

# Testing
pnpm test                             # Run all unit tests
pnpm lint                             # TypeScript type checking
pnpm test:e2e                         # E2E tests (requires pnpm dev)

# Building
pnpm build                            # Build all packages
```

## Project Structure

```
packages/
  shared/         # Shared types (UserStatus, RoleName)
  domain/         # Business logic (entities, ports, use cases)
  database/       # Drizzle ORM (SQLite local, PostgreSQL prod)
  api/            # NestJS REST API
  design-system/  # Radix UI + Tailwind components
  frontend/       # React + TanStack Router/Query
```

## Customizing the Scaffold

```bash
# Rename @acme/ scope and project name
./scripts/init.sh my-project myorg
```
