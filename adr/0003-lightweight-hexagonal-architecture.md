# ADR-0003: Lightweight Hexagonal Architecture

## Status

Accepted

## Context

We want to be able to swap frameworks, databases, or infrastructure dependencies without rewriting business logic. The domain should remain pure and testable without spinning up servers or databases.

## Decision

We adopted a **lightweight hexagonal (ports & adapters) architecture** across three backend packages:

1. **`@acme/domain`** — entities, use-cases, and port interfaces. Zero external dependencies (no ORM, no framework, no HTTP). Use-cases receive repositories via constructor injection.
2. **`@acme/database`** — adapter implementations of domain ports using Drizzle ORM (e.g., `DrizzleNoteRepository` implements `NoteRepository`).
3. **`@acme/api`** — NestJS controllers that inject use-cases, map DTOs to domain calls, and translate domain errors to HTTP responses.

**Dependency direction:** domain ← database ← api (domain knows nothing about its consumers).

We keep it *lightweight* — no event buses, no CQRS, no aggregate roots. Use-cases are simple classes with an `execute()` method, and ports are plain TypeScript interfaces.

## Consequences

### Positive
- Domain logic is tested with plain mocks — no database, no HTTP
- Swapping NestJS for another framework only touches the `api` package
- Swapping Drizzle for another ORM only touches the `database` package
- Clear package boundaries prevent accidental coupling

### Negative
- More packages and indirection than a monolithic NestJS app
- Developers must understand the port/adapter pattern to contribute
- Simple CRUD features still require the full port → adapter → use-case → controller chain

## Alternatives Considered
- **Full DDD**: Aggregate roots, domain events, bounded contexts — too heavy for the current scale of the application
- **Layered MVC (NestJS default)**: Services call ORM directly — tightly couples business logic to framework and database
- **No formal architecture**: Fast initially but leads to tangled dependencies as the codebase grows
