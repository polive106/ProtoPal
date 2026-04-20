# E2-US28: Container Security Baseline

**User Story**: As a platform operator, I want production Docker images to follow security best practices so that the attack surface of deployed containers is minimized and sensitive files are never included in images.

**Acceptance Criteria**:
- [ ] Multi-stage Dockerfile builds the application and copies only production artifacts to the final image
- [ ] Final image uses a minimal base (e.g., `node:20-alpine` or `distroless`)
- [ ] Container process runs as a non-root user (`node` or custom UID)
- [ ] `.dockerignore` excludes `.env*`, `.git`, `node_modules`, `*.db`, test files, source maps, and IDE configs
- [ ] Docker Compose production template sets `read_only: true` filesystem where possible, drops all Linux capabilities, and adds back only required ones
- [ ] `GET /health` endpoint returns `200 OK` with basic status (no sensitive data) for container orchestration health checks
- [ ] Dockerfile does not install unnecessary system packages or leave behind build tools in the final image
- [ ] Container exposes only the application port (no debug ports, no SSH)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Root | Create multi-stage production Dockerfile (build + runtime stages) | Dockerfile |
| Root | Create `.dockerignore` excluding secrets, tests, source maps, and dev files | .dockerignore |
| Root | Create `docker-compose.prod.yml` with security settings (non-root, read-only, cap-drop) | docker-compose.prod.yml |
| API | Add `GET /health` endpoint (public, returns `{ status: 'ok' }`) | packages/api/src/controllers/health.controller.ts |
| API | Register health controller in AppModule | packages/api/src/app.module.ts |
| E2E | API test for health endpoint | e2e/tests/health.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Health endpoint returns 200
  When I call GET /health
  Then I should receive a 200 status
  And the response body should be { "status": "ok" }
  And the response should not contain version, hostname, or internal details

Scenario: Docker image runs as non-root
  Given the Docker image is built
  When I inspect the running container
  Then the process should not be running as UID 0 (root)

Scenario: Sensitive files excluded from image
  Given the Docker image is built
  When I inspect the image filesystem
  Then .env files, .git directory, and *.db files should not be present
  And test files and source maps should not be present

Scenario: Docker Compose production drops capabilities
  Given docker-compose.prod.yml is used
  When the container starts
  Then all Linux capabilities should be dropped
  And only NET_BIND_SERVICE should be added back (if needed)
```
