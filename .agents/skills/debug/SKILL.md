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
7. **Run full suite**: `pnpm test && pnpm lint`

## Common Debug Commands

```bash
# Check API responses
curl -s http://localhost:3000/health | jq

# Check database content
pnpm --filter @acme/database db:studio

# Run specific test file
pnpm --filter @acme/domain test -- --run src/use-cases/__tests__/MyUseCase.test.ts

# Run E2E with visible browser
pnpm test:e2e --headed --project=chromium

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
