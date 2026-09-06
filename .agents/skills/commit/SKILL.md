---
name: commit
description: Automates pre-commit workflow: lint, test, review changes, then commit with conventional commit format.
disable-model-invocation: true
---

## Steps

1. **Run lint**: `pnpm lint` — *skip if it already passed and nothing changed since*
   - Fix any TypeScript errors
2. **Run tests**: `pnpm test` — *skip if it already passed and nothing changed since*
   - Fix any failing tests
3. **Run API E2E tests**: `pnpm test:e2e:api` (~25s)
   - Only when the commit touches domain, database, or API code
   - Fix any failing E2E tests
4. **Review changes**: `git diff --staged`
5. **Format commit message** using conventional commits:
   - `feat: add note deletion`
   - `fix: correct login redirect`
   - `refactor: extract auth guard logic`
   - `test: add notes CRUD e2e tests`
   - `docs: update getting started guide`
6. **Commit**: `git commit -m "type: description"`

## Avoid duplicate test runs

The `pre-commit` hook already runs `pnpm lint` and `pnpm test` on every commit.
Steps 1–2 exist only to surface a failure *before* the commit is attempted — if you
have just run them and nothing changed since, skip straight to step 4.

Never run the full `pnpm test:e2e` suite here. That belongs once, at story
completion (see AGENTS.md → **Test Execution Policy**).

## Conventional Commit Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Build, CI, or tooling changes |
| `style` | Formatting, whitespace (no code change) |

## Guidelines
- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference story IDs when applicable: `feat(E1-US03): add notes CRUD`
