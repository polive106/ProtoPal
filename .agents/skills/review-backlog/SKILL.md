---
name: review-backlog
description: Review the backlog to determine what to work on next by checking epic and story statuses in docs/backlog/.
---

## Steps

1. Read `docs/backlog/README.md` to understand the implementation order
2. Check each epic folder under `docs/backlog/` for story statuses
3. Identify the next story to implement based on:
   - Implementation order defined in the PRD
   - Dependencies between stories
   - Current status (skip Done stories)

## Output Format

```
## Backlog Status

### Phase 1: Foundation
- [x] E1-US01: Project Setup (Done)
- [x] E1-US02: Auth System (Done)
- [x] E1-US03: Notes CRUD (Done)

### Next Up
<next story to implement>
```

## Notes
- Stories must be implemented in dependency order
- A story is "Done" only when all acceptance criteria AND E2E tests pass
