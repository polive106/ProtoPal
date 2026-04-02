---
name: discuss-feature
description: Interview-driven feature exploration to define and refine a feature idea before it becomes backlog stories.
---

## Objective
Interview the user relentlessly about every aspect of the proposed feature until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one.

For each question, provide your recommended answer.

## Steps

### Phase 1: Discovery Interview
1. Ask the user to describe the feature in their own words
2. For each statement, probe deeper:
   - **Who** — which user roles are affected?
   - **What** — what exactly happens? What are the edge cases?
   - **Why** — what problem does this solve? What happens if we don't build it?
   - **How** — what's the expected UX flow? What API contracts are implied?
   - **Scope** — what's explicitly out of scope?
3. For each question, provide your recommended answer based on what you know about the codebase and domain
4. Challenge assumptions — if something sounds over-engineered or under-specified, say so
5. Continue until no open questions remain

### Phase 2: Requirements Synthesis
6. Summarize the agreed requirements as a structured list:
   - Feature name
   - User-facing description
   - Acceptance criteria (checkbox format)
   - Technical considerations (affected layers, new entities, migrations)
   - Dependencies on existing stories/epics
   - Complexity estimate (XS/S/M/L/XL per `docs/backlog/README.md` reference)
7. Present the summary to the user for final confirmation

### Phase 3: Backlog Decision
8. Determine the backlog outcome — one of:
   - **New story in existing epic** — if the feature fits an existing epic's scope
   - **Multiple stories in existing epic** — if the feature is large but within an existing epic
   - **New epic** — if the feature represents a new scope area
9. Present the proposed structure (epic/story IDs, titles, dependency order)
10. On user approval, invoke `/create-story` for each story to be created

## Guidelines
- Never accept vague requirements — push for specifics
- When the user says "it should just work", ask what "working" looks like concretely
- Track open questions explicitly — revisit them before moving to Phase 2
- If the feature touches existing entities/APIs, read the current code to ground recommendations
