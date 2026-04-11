# E8-US01: Command Injection Prevention

**User Story**: As a security engineer, I want all shell command execution to use safe APIs so that command injection vulnerabilities are eliminated, even in development-only code.

**Acceptance Criteria**:
- [ ] `PreviewEmailService` uses `execFile()` with an arguments array instead of `exec()` with string interpolation
- [ ] `PreviewEmailService` is guarded from instantiation/execution in production (`NODE_ENV === 'production'`)
- [ ] No other usages of `exec()` with string concatenation exist in the codebase
- [ ] Unit tests verify the production guard prevents execution

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `exec()` with `execFile()` using arguments array | packages/api/src/services/PreviewEmailService.ts |
| API | Add production environment guard that throws if instantiated in production | packages/api/src/services/PreviewEmailService.ts |
| API | Add unit test for production guard | packages/api/src/services/PreviewEmailService.test.ts |
| CI | Add grep-based CI check to flag any future `exec(` usage without `execFile` | .github/workflows/ |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Security Context**:
- **Severity**: High
- **File**: `packages/api/src/services/PreviewEmailService.ts` (Lines 51, 99)
- **Issue**: `exec()` constructs shell commands via string interpolation (`exec(\`${openCmd} "${filePath}"\`)`). While `filePath` is currently generated internally via `Date.now()`, this pattern is inherently unsafe — any future change to the path construction could introduce command injection. `execFile()` with an arguments array avoids shell interpretation entirely.

**Test Scenarios**:
```gherkin
Scenario: PreviewEmailService uses safe shell execution
  Given the PreviewEmailService opens an HTML preview
  When the file path is passed to the OS open command
  Then execFile() is used with an arguments array (not exec with string interpolation)

Scenario: PreviewEmailService cannot run in production
  Given NODE_ENV is set to "production"
  When PreviewEmailService is instantiated
  Then it should throw an error indicating it is development-only
```
