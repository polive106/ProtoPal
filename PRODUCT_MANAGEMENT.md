# Product Management

This guide explains how features go from idea to production in ProtoPal using the agentic backlog workflow.

## Why This Exists

**With the right architecture and tooling, AI agents can build production-ready software.** Not prototypes, not demos — real features with tests, CI, and code review. The hexagonal architecture, TDD mandate, and E2E requirements aren't just best practices; they're guardrails that make autonomous implementation reliable.

**You don't need fancy frameworks or external tools.** No BMAD, no GSD, no PAUL. No need to manage your backlog in Obsidian, Linear, or Jira. Everything lives in the repo as plain markdown — the skills, the backlog, the stories. Any AI coding tool can read them. `git log` is your activity feed. Pull requests are your review process. The repo is the single source of truth.

## How the Backlog Works

The backlog lives in `docs/backlog/` as structured markdown files. It's organized into **epics** (large scope areas) containing **user stories** (individual deliverables).

### Structure

```
docs/backlog/
  README.md                              # PRD: domain model, API contracts, implementation order
  epic-01-foundation/
    README.md                            # Epic overview + story status table
    E1-US01-project-setup.md             # Individual story
    E1-US02-auth-system.md
    E1-US03-notes-crud.md
  epic-02-security/
    README.md
    E2-US01-jwt-token-security.md
    ...
```

### The PRD (`docs/backlog/README.md`)

The top-level README acts as the **Product Requirements Document**. It defines:
- The domain model (entities and their relationships)
- API contracts (endpoints, auth requirements)
- The global **implementation order** across all epics
- Status conventions and complexity reference

### Epic READMEs

Each epic has a README with an overview and a status table:

```markdown
# Epic 02: Security Hardening

## Stories

| ID | Title | Complexity | Status |
|----|-------|-----------|--------|
| E2-US01 | JWT Secret & Token Revocation | M | Pending |
| E2-US02 | Registration Flow & Email Verification | L | Pending |
| E2-US03 | CORS & Environment Hardening | S | Done |
```

### Story Files

Each story is a self-contained markdown file with everything an agent (or developer) needs to implement it:

```markdown
# E2-US01: JWT Secret & Token Revocation

**User Story**: As a platform operator, I want JWT secrets to be strictly managed
and tokens to be revocable so that compromised sessions can be terminated immediately.

**Acceptance Criteria**:
- [ ] Application refuses to start without an explicit JWT_SECRET
- [ ] Logout adds the current token to the blacklist
- [ ] AuthGuard rejects blacklisted tokens

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | TokenBlacklistRepository port | packages/domain/src/ports/TokenBlacklistRepository.ts |
| Database | Token blacklist repository adapter | packages/database/src/adapters/... |
| API | Update AuthGuard to check blacklist | packages/api/src/common/guards/auth.guard.ts |
| E2E | Token revocation test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None
**Complexity**: M
**Status**: Pending

**Test Scenarios**:
Scenario: Logout invalidates the token
  Given I am logged in with a valid token
  When I call POST /auth/logout
  And I use the same token to call GET /auth/me
  Then I should receive a 401 Unauthorized
```

Stories include the exact file paths, layer-by-layer tasks, Gherkin test scenarios, and dependency information. This makes them directly actionable by any AI coding agent.

### Status Conventions

| Status | Meaning |
|--------|---------|
| **Pending** | Not started |
| **In Progress** | Actively being worked on |
| **Done** | Implemented with passing tests |
| **Blocked** | Cannot proceed (reason documented) |

### Complexity Reference

| Size | Estimate |
|------|----------|
| XS | ~1 hour |
| S | 2-4 hours |
| M | ~1 day |
| L | 2-3 days |
| XL | ~1 week |

---

## Adding a New Feature: The Full Workflow

There are two paths to get a feature into the backlog, depending on how well-defined your idea is.

### Path 1: Explore First with `/discuss-feature`

Use this when you have a rough idea but haven't thought through all the details yet.

**What it does:** The `/discuss-feature` skill runs an interview-driven brainstorming session. It asks probing questions about every aspect of your feature — who it's for, what the edge cases are, which layers are affected, what's in and out of scope. For each question, it provides its own recommended answer based on what it knows about the codebase.

**How it works:**

1. **Discovery interview** — You describe the feature, and the agent drills into it: Who are the affected user roles? What's the expected UX flow? What API contracts are implied? What's explicitly out of scope? It challenges assumptions and pushes for specifics.

2. **Requirements synthesis** — Once all questions are resolved, it produces a structured summary: feature name, acceptance criteria, technical considerations (affected layers, new entities, migrations needed), dependencies, and a complexity estimate.

3. **Backlog decision** — It determines whether this becomes a new story in an existing epic, multiple stories, or an entirely new epic. On your approval, it invokes `/create-story` to write everything to the backlog.

**Example:**
```
You:    /discuss-feature
Agent:  What feature would you like to explore?
You:    I want users to be able to share notes with other users
Agent:  Interesting. Let me ask a few questions:
        1. Should sharing be read-only, or can recipients edit?
           → I'd recommend read-only for a first iteration.
        2. Is sharing by email address, or by selecting from existing users?
        ...
```

This is great for turning a vague "I want X" into concrete, implementable stories.

### Path 2: Go Directly with `/create-story`

Use this when you already know exactly what you want — the user story, acceptance criteria, and which epic it belongs to.

**What it does:** The `/create-story` skill analyzes the codebase to derive technical tasks, determines the exact file paths following existing naming conventions, generates Gherkin test scenarios, and writes the story file to the backlog. It also updates the epic README and the PRD implementation order.

**What you provide:**
- Story title and user story statement
- Acceptance criteria
- Target epic (existing or new)
- Complexity estimate

**What the agent derives by reading the codebase:**
- Which layers are affected (Domain, Database, API, Frontend, E2E)
- Specific file paths for new or modified files
- Migration requirements
- Test scenarios in Gherkin format

### Implementing a Story with `/implement-story`

Once stories are in the backlog, implementation happens through the `/implement-story` skill. This is the most powerful part of the workflow.

**What it does:** Given a story ID, it reads the story file, understands all acceptance criteria, and implements the feature end-to-end following the strict layer order: Domain → Database → API → Frontend → E2E. It uses TDD at every layer (write failing test, implement, verify pass). When done, it runs the full CI suite (`pnpm lint`, `pnpm test`, `pnpm test:e2e`), updates the story status to Done, and creates a pull request.

**How I typically use it:** I run `/implement-story` from the **Claude mobile app**. I kick off a story from my phone, and it runs autonomously — writing code, running tests, fixing issues, and eventually opening a PR when everything passes. By the time I'm back at my desk, there's a PR ready for review.

```
You:    /implement-story E2-US03
Agent:  Reading story E2-US03: CORS & Environment Hardening...
        → Starting with Domain layer...
        → Writing failing test for environment validation...
        → Test fails (RED) ✓
        → Implementing validation...
        → Test passes (GREEN) ✓
        → Moving to Database layer...
        ...
        → All tests pass. Creating PR.
```

### Checking What's Next with `/review-backlog`

Not sure what to work on? The `/review-backlog` skill scans all epic and story statuses, checks the implementation order and dependencies, and tells you the next story to pick up.

---

## Summary

| Step | Skill | When to Use |
|------|-------|-------------|
| Brainstorm | `/discuss-feature` | Rough idea, need to refine |
| Write stories | `/create-story` | Clear requirements, ready to write |
| Check priority | `/review-backlog` | Need to know what's next |
| Build it | `/implement-story` | Ready to implement (works great from mobile) |
