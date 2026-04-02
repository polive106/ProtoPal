# CLAUDE.md

This project uses AGENTS.md as the source of truth for all agent instructions. See [AGENTS.md](./AGENTS.md) for:
- Architecture rules and stack details
- TDD and E2E testing mandates
- Process rules and commands
- Database conventions

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
