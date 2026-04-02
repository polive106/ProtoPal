---
name: commit
description: Automates pre-commit workflow: lint, test, review changes, then commit with conventional commit format.
disable-model-invocation: true
---

## Steps

1. **Run lint**: `pnpm lint`
   - Fix any TypeScript errors
2. **Run tests**: `pnpm test`
   - Fix any failing tests
3. **Review changes**: `git diff --staged`
4. **Format commit message** using conventional commits:
   - `feat: add note deletion`
   - `fix: correct login redirect`
   - `refactor: extract auth guard logic`
   - `test: add notes CRUD e2e tests`
   - `docs: update getting started guide`
5. **Commit**: `git commit -m "type: description"`

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
