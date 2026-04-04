# E3-US04: Maestro E2E Tests in CI

**User Story**: As a developer, I want Maestro mobile E2E tests to run automatically on pull requests so that regressions in mobile flows are caught before merge.

**Acceptance Criteria**:
- [ ] `e2e-mobile.yml` workflow runs on push to main and pull requests to main
- [ ] Android emulator boots in CI using `reactivecircus/android-emulator-runner`
- [ ] Expo app is prebuilt and compiled into a debug APK via Gradle
- [ ] APK is installed on the emulator and Maestro flows execute against it
- [ ] API server starts in CI with seeded SQLite database so auth/CRUD flows work end-to-end
- [ ] All existing Maestro flows pass (app-launch, auth/login, auth/register)
- [ ] Maestro test artifacts (screenshots, logs) uploaded on failure
- [ ] Workflow uses macOS runner with hardware acceleration for emulator performance
- [ ] Caching for Gradle, pnpm, and Expo prebuild to keep run times reasonable

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Update e2e-mobile workflow with emulator + Maestro setup | `.github/workflows/e2e-mobile.yml` |
| CI | Add Maestro CLI installation step | `.github/workflows/e2e-mobile.yml` |
| CI | Add `reactivecircus/android-emulator-runner` step with API 34 | `.github/workflows/e2e-mobile.yml` |
| CI | Add Expo prebuild + Gradle assembleDebug build step | `.github/workflows/e2e-mobile.yml` |
| CI | Add API server start with seeded database as background process | `.github/workflows/e2e-mobile.yml` |
| CI | Add Maestro test execution step | `.github/workflows/e2e-mobile.yml` |
| CI | Add artifact upload for Maestro screenshots/logs on failure | `.github/workflows/e2e-mobile.yml` |
| CI | Add Gradle and Expo prebuild caching | `.github/workflows/e2e-mobile.yml` |
| Mobile | Add `prebuild` and `build:android` scripts to package.json | `packages/mobile/package.json` |
| Mobile | Verify all Maestro flows pass locally on emulator before CI | `packages/mobile/maestro/flows/` |

**Dependencies**: E3-US02

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: CI runs Maestro tests on pull request
  Given a pull request is opened against main
  When the e2e-mobile workflow triggers
  Then the Android emulator starts
  And the Expo app is built and installed
  And all Maestro flows execute successfully

Scenario: CI uploads artifacts on Maestro failure
  Given a Maestro flow fails in CI
  Then screenshots and logs are uploaded as workflow artifacts
  And the workflow exits with a failure status

Scenario: API is available for authenticated flows
  Given the e2e-mobile workflow is running
  When Maestro executes the login flow
  Then the API server responds to auth requests
  And the seeded test user can log in successfully
```
