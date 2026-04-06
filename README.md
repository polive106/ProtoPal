# ProtoPal

A production-ready fullstack monorepo scaffold built for **agentic development**. No proprietary CLI, no vendor lock-in — just markdown files that any AI coding tool can read.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.4.0-orange)](https://pnpm.io/)

## What's Inside

With the right architecture and tooling, AI agents can build production-ready software — real features with tests, CI, and code review. You don't need BMAD, GSD, PAUL, or external tools like Obsidian, Linear, or Jira. Everything lives in the repo as plain markdown — the skills, the backlog, the stories. Any AI coding tool can read them. `git log` is your activity feed. Pull requests are your review process. **The repo is the single source of truth.**

- **Authentication** — Register, login, logout with JWT HTTP-only cookies and protected routes
- **RBAC** — Admin and User roles with different permissions
- **Example CRUD entity** — Notes (create, read, update, delete, user-scoped)
- **Hexagonal architecture** — Domain (pure TS) → Database (Drizzle) → API (NestJS) → Frontend (React)
- **Full test suite** — Unit tests (Vitest) + E2E tests (Playwright)
- **Design system** — Radix UI + Tailwind components
- **CI/CD** — GitHub Actions

## Built for Agents

ProtoPal is designed from the ground up for AI-assisted development. The `.agents/` directory contains **plain markdown files** that work with Claude Code, Cursor, Windsurf, Copilot, and 30+ other AI coding tools.

### Skills, Not Plugins

The `.agents/skills/` directory contains **14 reusable workflow prompts** — plain text files that guide any AI tool through common development tasks:

| Skill | Purpose |
|-------|---------|
| `discuss-feature` | Interview-driven feature exploration |
| `create-story` | Create backlog stories with technical tasks |
| `review-backlog` | Determine what to work on next |
| `implement-story` | Start work on a story with full context |
| `scaffold` | Generate entities, repos, controllers, components |
| `add-migration` | Database schema changes |
| `add-e2e-tests` | Playwright tests with data-testid selectors |
| `add-unit-tests` | Vitest tests across all layers |
| `review` | Pre-commit security and quality checklist |
| `redesign` | Redesign pages using the design system |
| `commit` | Pre-commit automation (lint, test, commit) |
| `debug` | Structured debugging: reproduce, isolate, fix |
| `fix-ci` | CI failure resolution |
| `story-complete` | Post-implementation verification |

### Architecture as Guardrails

The hexagonal architecture acts as a **safety net for agents**. Strict dependency direction means an AI tool physically can't couple layers incorrectly:

```
Domain (zero deps) → Database → API → Frontend → E2E
```

- **Domain** has zero external dependencies — no Drizzle, no NestJS, no React. Pure TypeScript business logic that agents can't accidentally pollute
- **Database** implements Domain ports (adapter pattern) — the coupling boundary is explicit
- **Layer implementation order** is enforced: Domain → Database → API → Frontend → E2E

The scaffold already proves it:

- **Swap databases**: The app ships with both SQLite (local dev/E2E tests) and PostgreSQL (production) adapters. Switching between them is a single injection change. Want MongoDB? Implement the Domain port — the business logic doesn't change
- **Swap API frameworks**: This repo started on Hono, then moved to NestJS for a project with stricter security requirements. The migration only touched the API adapter layer — Domain and Database stayed untouched

### Quality Guardrails

Every guardrail is documented in `AGENTS.md` so AI tools enforce them automatically:

- **TDD mandate** — Red-Green-Refactor cycle. No implementation without a failing test first
- **E2E tests required** — No feature is complete without Playwright tests
- **`data-testid`-only selectors** — No brittle `getByRole`/`getByText` in E2E tests
- **Pre-commit checklist** — The `review` skill covers security, testing, architecture, and code quality
- **Database conventions** — Snake_case columns, seed scripts updated with every schema change

### Automated Hooks

The `.claude/hooks/` directory contains **5 shell scripts** that run automatically to enforce consistency. These hooks are registered in `.claude/settings.json` and fire on specific events — no manual intervention required.

#### Session Start

| Hook | What it does |
|------|-------------|
| `check-backlog-drift.sh` | Scans all stories for status drift — catches Pending stories whose acceptance criteria are already checked, and status mismatches between story files and epic READMEs. Fires once at the start of every session so stale statuses are caught before any work begins. |

#### Post Tool Use (Edit)

| Hook | Trigger condition | What it does |
|------|-------------------|-------------|
| `validate-story-format.sh` | Any edit to a story file | Ensures all required sections exist (User Story, Acceptance Criteria, Technical Tasks, Dependencies, Complexity, Status, Test Scenarios) |
| `check-story-status-sync.sh` | Any edit to a story file | Verifies the story's `**Status**` field matches the corresponding row in the epic README table — blocks if they're out of sync |
| `check-agents-claude-sync.sh` | Any edit to `AGENTS.md` or `CLAUDE.md` | Keeps skill tables in sync between both files |

#### Post Tool Use (Write)

| Hook | Trigger condition | What it does |
|------|-------------------|-------------|
| `validate-story-format.sh` | New story file created | Same format validation as above |
| `check-backlog-sync.sh` | New story file created | Verifies the new story ID is referenced in both the epic README and the PRD — blocks if indexes are missing |

These hooks form a **closed loop**: `check-backlog-drift.sh` catches historical drift on session start, `check-story-status-sync.sh` prevents new drift on every edit, and `check-backlog-sync.sh` ensures new stories are properly indexed.

### Agent-Readable Context

- **`AGENTS.md`** — Universal instructions any AI tool can follow (architecture, testing rules, conventions)
- **`CLAUDE.md`** / **`.cursorrules`** — Tool-specific config files
- **`docs/backlog/`** — Epics and stories in structured markdown. Agents can pick up work and understand context
- **`adr/`** — Architecture Decision Records so agents understand *why* things are built this way

### Product Management from Your Phone

The backlog in `docs/backlog/` is an **executable product management system**. Features flow from idea to merged PR through a chain of skills. See [`PRODUCT_MANAGEMENT.md`](PRODUCT_MANAGEMENT.md) for the full guide.

| Step | Skill | What Happens |
|------|-------|-------------|
| Brainstorm | `/discuss-feature` | Interview-driven exploration — the agent probes your idea, challenges assumptions, and synthesizes structured requirements |
| Write stories | `/create-story` | Analyzes the codebase to derive technical tasks, file paths, and Gherkin test scenarios, then writes the story to the backlog |
| Check priority | `/review-backlog` | Scans all epic/story statuses and tells you what to implement next |
| Build it | `/implement-story` | Implements end-to-end with TDD (Domain → Database → API → Frontend → E2E), runs the full CI suite, and opens a PR |

The typical workflow: kick off `/implement-story` from the Claude mobile app, and come back to a PR ready for review.

## Stack

| Package | Technology |
|---------|-----------|
| `@acme/shared` | Pure TypeScript types |
| `@acme/domain` | Entities, ports, use cases (zero deps) |
| `@acme/database` | Drizzle ORM — SQLite (local) / PostgreSQL (prod) |
| `@acme/api` | NestJS REST API |
| `@acme/design-system` | Radix UI + Tailwind components |
| `@acme/frontend` | React + Vite + TanStack Router/Query |

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm 9.4.0

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/protopal.git
cd protopal

# Install dependencies
pnpm install

# Seed the database
pnpm --filter @acme/database db:seed

# Start development (API on :3000, Frontend on :5173)
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with:
- **Admin**: admin@example.com / Admin123!
- **User**: user@example.com / User1234!

## Commands

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
pnpm test:watch                       # Watch mode
pnpm test:e2e                         # E2E tests (requires pnpm dev)
pnpm test:e2e --headed                # With visible browser

# Mobile E2E Testing (requires Android emulator + Maestro CLI)
pnpm build:mobile                     # Build Android debug APK
pnpm test:e2e:mobile                  # Run Maestro E2E tests

# Building
pnpm build                            # Build all packages
pnpm lint                             # Type check all packages
```

## CI Workflows

| Workflow | File | Trigger | What it does |
|----------|------|---------|-------------|
| Tests | `test.yml` | push/PR to main | Lint + unit tests |
| E2E Tests | `e2e.yml` | push/PR to main | Playwright browser E2E tests |
| Mobile E2E Tests | `e2e-mobile.yml` | manual (`workflow_dispatch`) | Builds Android debug APK + runs Maestro flows on emulator |

> **Note:** Mobile E2E tests are fully configured but trigger manually only because the Android emulator + SDK download exceeds GitHub Actions free-tier runner limits (~45+ min). To enable automatic runs, add `push`/`pull_request` triggers to `e2e-mobile.yml` or use self-hosted runners with more capacity.

## Project Structure

```
packages/
  shared/           # Shared TypeScript types
  domain/           # Business logic (entities, ports, use cases)
  database/         # Drizzle ORM (SQLite local, PostgreSQL prod)
  api/              # NestJS REST API
  design-system/    # Radix UI + Tailwind components
  frontend/         # React + TanStack Router/Query
e2e/                # Playwright E2E tests
docs/backlog/       # User stories organized by epic
adr/                # Architecture Decision Records
.agents/skills/     # 14 AI workflow skills
```

## Customize

```bash
# Rename @acme/ scope and project name
./scripts/init.sh my-project myorg
# Replaces @acme/ → @myorg/ everywhere
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Use the `review-backlog` skill to find work, or `discuss-feature` to propose something new
4. Follow TDD: write a failing test first, then implement
5. Run `pnpm lint && pnpm test` before committing
6. Open a pull request

## License

[MIT](LICENSE)
