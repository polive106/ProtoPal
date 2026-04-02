# E3-US01: Mobile Project Shell & Design System

**User Story**: As a developer, I want an Expo project and mobile design system in the monorepo so that agents have the foundation to scaffold mobile features.

**Acceptance Criteria**:
- [ ] Expo managed workflow project in `packages/mobile/` with Expo Router file-based navigation
- [ ] `packages/design-system-mobile/` with React Native Reusables + NativeWind (Button, Input, Card, Label, Toast, PageSpinner, ErrorAlert)
- [ ] TanStack Query configured for data fetching with same defaults as web (staleTime: 60s, retry: 1)
- [ ] Mobile API client in `packages/mobile/src/lib/api.ts` with Bearer auth support
- [ ] Unit test setup with Vitest + `@testing-library/react-native`
- [ ] CI workflow `.github/workflows/e2e-mobile.yml` with `workflow_dispatch` trigger
- [ ] Workspace, Turbo, and root scripts configured for mobile packages
- [ ] App launches and renders a placeholder home screen

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Design System Mobile | Initialize package with NativeWind + React Native Reusables | `packages/design-system-mobile/package.json`, `packages/design-system-mobile/src/index.ts` |
| Design System Mobile | Create core components: Button, Input, Card, Label | `packages/design-system-mobile/src/components/` |
| Design System Mobile | Create feedback components: Toast, PageSpinner, ErrorAlert | `packages/design-system-mobile/src/components/` |
| Design System Mobile | Add `cn()` utility for NativeWind class merging | `packages/design-system-mobile/src/lib/utils.ts` |
| Mobile | Initialize Expo managed project with Expo Router | `packages/mobile/package.json`, `packages/mobile/app/` |
| Mobile | Configure TanStack Query provider | `packages/mobile/src/providers/QueryProvider.tsx` |
| Mobile | Create API client with Bearer token support | `packages/mobile/src/lib/api.ts` |
| Mobile | Create query keys and query client config | `packages/mobile/src/lib/queryClient.ts`, `packages/mobile/src/lib/queryKeys.ts` |
| Mobile | Unit tests for API client | `packages/mobile/src/lib/api.test.ts` |
| Mobile | Vitest + testing-library config | `packages/mobile/vitest.config.ts`, `packages/mobile/src/test-setup.ts` |
| Mobile | Placeholder home screen | `packages/mobile/app/index.tsx` |
| E2E Mobile | Initialize Maestro directory structure | `maestro/` |
| CI | GitHub Actions workflow for Maestro (workflow_dispatch) | `.github/workflows/e2e-mobile.yml` |
| Config | Add packages/mobile and packages/design-system-mobile to pnpm workspace | `pnpm-workspace.yaml` |
| Config | Add turbo tasks for mobile package | `turbo.json` |
| Config | Add root scripts for mobile dev/test | `package.json` |

**Dependencies**: E1-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: App launches successfully
  Given the Expo dev server is running
  When I open the app
  Then I should see the placeholder home screen

Scenario: Design system components render
  Given I import Button from design-system-mobile
  When I render the component
  Then it should display correctly with NativeWind styling

Scenario: API client sends Bearer token
  Given a stored auth token
  When I make an API request
  Then the request should include an Authorization: Bearer header
```
