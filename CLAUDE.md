# CLAUDE.md

This project uses AGENTS.md as the source of truth for all agent instructions. See [AGENTS.md](./AGENTS.md) for:
- Architecture rules and stack details
- TDD and E2E testing mandates
- **[Test Execution Policy](./AGENTS.md#test-execution-policy)** — which suite to run when, and the commands that never exit
- Process rules and commands
- Database conventions

## Before running any test command

Read **[Test Execution Policy](./AGENTS.md#test-execution-policy)**. In short:

- Run the narrowest command that can disprove your change; widen only at checkpoints.
- `pnpm test:e2e` (the full suite) runs **once per story**, at the end — not per layer, not per commit.
- Never re-run a suite that just passed and whose inputs have not changed.
- After two identical failures, stop and report — a third run will not fix it.
- Never start `pnpm dev`, `test:watch`, `--ui`, `--headed`, `show-report`, or `db:studio`; they never exit.

## Claude Code-Specific

**Skills** are located at `.claude/skills/` (symlinked from `.agents/skills/`).

| Skill | When to Use |
|-------|-------------|
| `discuss-feature` | Exploring and refining a new feature idea into stories |
| `create-story` | Creating new stories/epics in the backlog |
| `review-backlog` | Determining what to work on next |
| `implement-story` | Starting work on a PRD story |
| `scaffold` | Creating entities, repos, controllers, components |
| `add-migration` | Changing database schema |
| `add-e2e-tests` | Writing E2E tests |
| `add-unit-tests` | Writing unit/integration tests |
| `review` | Before committing |
| `redesign` | Redesigning pages/components |
| `commit` | Pre-commit automation |
| `debug` | Structured debugging |
| `fix-ci` | CI failure resolution |
| `story-complete` | Post-implementation verification |
