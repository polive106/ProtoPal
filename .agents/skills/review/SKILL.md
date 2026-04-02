---
name: review
description: Pre-commit quality checklist covering security, testing, architecture, and code quality.
---

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
