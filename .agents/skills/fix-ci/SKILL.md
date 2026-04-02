---
name: fix-ci
description: Diagnose and fix CI pipeline failures including lint, test, e2e, build, and dependency issues.
disable-model-invocation: true
---

## Steps

1. **Identify the failure**: `gh run view` or check the GitHub Actions tab
2. **Categorize the failure**:
   - **Lint**: TypeScript errors → run `pnpm lint` locally
   - **Test**: Unit test failure → run `pnpm test` locally
   - **E2E**: Playwright failure → run `pnpm test:e2e` locally
   - **Build**: Compilation error → run `pnpm build` locally
   - **Install**: Dependency issue → check lockfile
3. **Reproduce locally**: Use the same commands as CI
4. **Fix the issue**
5. **Push the fix**: `git push`

## Common CI Fixes

| Issue | Solution |
|-------|----------|
| `frozen-lockfile` error | Run `pnpm install` and commit `pnpm-lock.yaml` |
| Type error in CI but not local | Ensure `skipLibCheck: true` and check tsconfig paths |
| E2E timeout | Increase timeout or check if test data is missing |
| Missing playwright browsers | CI workflow should include `npx playwright install --with-deps` |
