---
name: review
description: Pre-commit quality checklist covering security, testing, architecture, and code quality.
---

Run this **before** the E2E gate, not after — this checklist produces code changes, and
any suite run before them is invalidated. See AGENTS.md → **Test Execution Policy** →
*Story gate order*.

## Checklist

### Security
- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] SQL injection prevented (using parameterized queries/ORM)
- [ ] XSS prevented (no dangerouslySetInnerHTML, user input sanitized)
- [ ] Auth required on all non-public endpoints
- [ ] User can only access their own data (ownership checks in use cases)

### Testing
- [ ] All new functions have unit tests
- [ ] Database adapters have integration tests
- [ ] E2E tests cover the feature
- [ ] All tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] E2E specs exist and are written — the full suite runs at the gate *after* this
      checklist and `/simplify`, not now

### Architecture
- [ ] Domain has no external dependencies
- [ ] New entities follow existing patterns
- [ ] Database schema updated in both sqlite and postgres files
- [ ] Seed script updated for schema changes

### Code Quality
- [ ] No TODO/FIXME comments without tracking
- [ ] No console.log in production code
- [ ] Error handling follows existing patterns (custom Error classes)
- [ ] Types are explicit (no `any` without justification)
