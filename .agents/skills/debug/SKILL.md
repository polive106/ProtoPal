---
name: debug
description: Investigate bugs using a systematic approach: reproduce, identify the layer, write a failing test, fix root cause.
---

## Steps

1. **Reproduce**: Identify the exact steps to reproduce the issue
2. **Read errors**: Check terminal, browser console, and test output
3. **Identify the layer**: Is the bug in Domain, Database, API, or Frontend?
4. **Write a failing test** that demonstrates the bug
5. **Fix the root cause** (not just the symptom)
6. **Verify**: Run the test, ensure it passes
7. **Verify narrowly, then widen once**: re-run the failing test, then
   `pnpm test && pnpm lint`. See AGENTS.md → **Test Execution Policy**.

## Common Debug Commands

```bash
# Check API responses
curl -s http://localhost:3000/health | jq

# Check database content (db:studio is a persistent server — ask the user to run it)
pnpm --filter @acme/database db:seed

# Run specific test file
pnpm --filter @acme/domain test -- --run src/use-cases/__tests__/MyUseCase.test.ts

# Re-run a single E2E spec (headless — never use --headed, it needs a display)
pnpm test:e2e e2e/tests/notes/crud.spec.ts

# Inspect the last failure without re-running anything
cat test-results/*/error-context.md      # page snapshot at failure
ls test-results/*/*.png                  # screenshot

# Check TypeScript errors
pnpm lint
```

## Layer-Specific Tips

| Layer | Common Issues |
|-------|---------------|
| Domain | Missing validation, wrong error type |
| Database | Schema mismatch, missing seed data, FK constraints |
| API | Missing @Public() decorator, wrong DI token, DTO validation |
| Frontend | Wrong query key, missing invalidation, stale cache |
