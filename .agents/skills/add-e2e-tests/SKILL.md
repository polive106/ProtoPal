---
name: add-e2e-tests
description: Add end-to-end Playwright tests for a feature using data-testid selectors, with API and UI test patterns.
---

## Selector Strategy: data-testid ONLY

**CRITICAL:** Always use `data-testid` selectors. Do NOT use `getByRole`, `getByLabel`, `getByText`.

### Naming Convention

`{page}-{element-type}-{name}` in kebab-case:

| Type | Prefix | Example |
|------|--------|---------|
| Input | `input-` | `notes-input-title` |
| Button | `btn-` | `notes-btn-save` |
| Link | `link-` | `dashboard-link-notes` |
| Alert | `alert-` | `notes-alert-error` |
| Card | `card-` | `notes-card-{id}` |
| Row | `row-` | `notes-row-{id}` |
| Page | `page` | `notes-page` |
| Title | `title` | `notes-page-title` |

## Test File Template

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials, apiUrls, testIds } from '../../fixtures';

test.describe('Feature Name', () => {
  test.describe('API @api', () => {
    test('should do something via API', async ({ request }) => {
      // Login
      await request.post(`${apiUrls.base}/auth/login`, {
        data: testCredentials.user,
      });
      // Test API endpoint
      const response = await request.get(`${apiUrls.base}/endpoint`);
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('UI @ui', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId('login-input-email').fill(testCredentials.user.email);
      await page.getByTestId('login-input-password').fill(testCredentials.user.password);
      await page.getByTestId('login-btn-submit').click();
      await expect(page.getByTestId('dashboard-page')).toBeVisible();
    });

    test('should show the feature page', async ({ page }) => {
      await page.goto('/feature');
      await expect(page.getByTestId('feature-page')).toBeVisible();
    });
  });
});
```

## Maestro E2E Tests (Mobile)

For mobile features, create Maestro YAML flows in `packages/mobile/maestro/flows/<feature>/`.

### Mobile testID Convention
Use `testID` prop (not `data-testid`) on React Native components. Same naming: `{screen}-{element-type}-{name}`.

### Maestro Flow Template

```yaml
appId: com.acme.protopal
---
- launchApp:
    clearState: true
- assertVisible:
    id: "login-card"
- tapOn:
    id: "login-input-email"
- inputText: "admin@protopal.com"
- tapOn:
    id: "login-input-password"
- inputText: "Password1!"
- tapOn:
    id: "login-btn-submit"
- assertVisible:
    id: "dashboard-screen"
# ... feature-specific steps
```

### Maestro Commands Reference
- `tapOn: { id: "testID" }` — tap an element
- `inputText: "value"` — type text into focused field
- `assertVisible: { id: "testID" }` — assert element visible
- `clearText` — clear focused input
- `launchApp: { clearState: true }` — fresh app start

## Steps

### Web (Playwright)
1. Add `data-testid` attributes to all interactive components
2. Update `e2e/fixtures/index.ts` with new testIds
3. Update `e2e/seed.ts` if new test data is needed
4. Create test file at `e2e/tests/<feature>/<test-name>.spec.ts`
5. Tag tests with `@api` or `@ui`
6. Run: `pnpm test:e2e`

### Mobile (Maestro)
1. Add `testID` props to all interactive React Native components
2. Create flow files at `packages/mobile/maestro/flows/<feature>/<flow-name>.yaml`
3. Run: `pnpm test:e2e:mobile`
