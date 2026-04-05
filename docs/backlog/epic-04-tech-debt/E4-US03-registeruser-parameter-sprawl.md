# E4-US03: Reduce RegisterUser Constructor Parameter Sprawl

**User Story**: As a developer, I want the `RegisterUser` use case to have a cleaner constructor so that adding future verification-related features doesn't keep inflating its dependency list.

**Acceptance Criteria**:
- [ ] A `VerificationService` domain service encapsulates `VerificationTokenRepository`, `EmailService`, and `TokenGenerator`
- [ ] `RegisterUser` constructor takes 5 params instead of 7 (userRepo, roleRepo, userRoleRepo, passwordHasher, verificationService)
- [ ] `ResendVerification` constructor takes 3 params instead of 4 (userRepo, verificationService)
- [ ] `VerifyEmail` constructor is updated similarly if applicable
- [ ] NestJS DI wiring in `domain.module.ts` is updated to provide `VerificationService`
- [ ] All existing unit and integration tests pass
- [ ] No public API/behavior changes

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Create VerificationService domain service | packages/domain/src/services/VerificationService.ts |
| Domain | Refactor RegisterUser to accept VerificationService | packages/domain/src/use-cases/RegisterUser.ts |
| Domain | Refactor ResendVerification to accept VerificationService | packages/domain/src/use-cases/ResendVerification.ts |
| Domain | Refactor VerifyEmail if applicable | packages/domain/src/use-cases/VerifyEmail.ts |
| Domain | Export new service from index | packages/domain/src/index.ts |
| Domain | Update unit tests for new constructor shape | packages/domain/src/use-cases/RegisterUser.test.ts, ResendVerification.test.ts, VerifyEmail.test.ts |
| API | Update DI wiring for VerificationService | packages/api/src/modules/domain.module.ts |
| API | Update integration tests | packages/api/src/controllers/auth.controller.integration.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: RegisterUser delegates to VerificationService
  Given a RegisterUser instance with a VerificationService
  When I register a new user
  Then a verification token is generated and email is sent via the service

Scenario: ResendVerification delegates to VerificationService
  Given a ResendVerification instance with a VerificationService
  When I resend verification for a pending user
  Then old tokens are invalidated and a new email is sent via the service
```
