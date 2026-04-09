# Product Requirements Document

## Overview

This scaffold provides a fullstack monorepo with authentication, RBAC, and an example CRUD entity (Notes). It's designed for agentic development workflows.

## Domain Model

### Entities

| Entity | Description |
|--------|-------------|
| User | Core identity with email/password auth |
| Role | System roles (admin, user) |
| UserRole | User-role assignments |
| Note | Example CRUD entity scoped to user |

### API Contracts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login with credentials |
| POST | /auth/logout | Public | Clear auth cookie |
| GET | /auth/me | Protected | Get current user |
| GET | /notes | Protected | List user's notes |
| POST | /notes | Protected | Create a note |
| GET | /notes/:id | Protected | Get a note |
| PATCH | /notes/:id | Protected | Update a note |
| DELETE | /notes/:id | Protected | Delete a note |
| GET | /health | Public | Health check |

## Implementation Order

### Phase 1: Foundation (Done)
1. E1-US01: Project Setup
2. E1-US02: Auth System
3. E1-US03: Notes CRUD

### Phase 2: Security Hardening (In Progress)
4. E2-US01: JWT Secret & Token Revocation
5. E2-US02: Registration Flow & Email Verification
6. E2-US03: CORS & Environment Hardening
7. E2-US04: Account Lockout & Brute Force Protection
8. E2-US05: Persistent Rate Limiting
9. E2-US06: Password Reset Flow
10. E2-US07: Security Headers & Audit Logging
11. E2-US08: Input Validation Hardening & Payload Size Limits
12. E2-US09: User Enumeration Prevention
13. E2-US10: Token Exposure Reduction
14. E2-US11: Seed Data & Production Safety Guards
15. E2-US12: Dependency Security Scanning & Supply Chain Protection
16. E2-US13: Critical Dependency Vulnerability Remediation
17. E2-US14: Command Injection Fix in Email Preview Service
18. E2-US15: Login Timing Attack Mitigation
19. E2-US16: Security Headers Hardening (Helmet Configuration)
20. E2-US17: Admin Endpoint Input Validation & Audit Trail
21. E2-US18: Structured Logging & Console Cleanup for Production Readiness

### Phase 3: Mobile App (Done)
16. E3-US01: Mobile Project Shell & Design System
17. E3-US02: Mobile Auth
18. E3-US03: Mobile Notes CRUD & Agent Tooling
19. E3-US04: Maestro E2E Tests in CI

### Phase 4: Tech Debt (Done)
20. E4-US01: Share Validation Schemas via @acme/shared
21. E4-US02: Share Note Type and Query Keys via @acme/shared
22. E4-US03: Reduce RegisterUser Constructor Parameter Sprawl

### Phase 5: Test Debt (Done)
23. E5-US01: Login Form Validation & Error Display E2E Tests
24. E5-US02: Registration Form Validation & Error Display E2E Tests
25. E5-US03: Note Drawer Validation & Edit Flow E2E Tests
26. E5-US04: Auth Navigation & Page Flow E2E Tests
27. E5-US05: Notes List States, Dashboard & Layout E2E Tests

### Phase 6: Internationalization (Pending)
28. E6-US01: i18n Foundation — @acme/i18n Package
29. E6-US02: Web i18n Provider & Auth Strings
30. E6-US03: Web Notes & Layout Strings
31. E6-US04: Web Language Switcher
32. E6-US05: Mobile i18n Provider & Auth Strings
33. E6-US06: Mobile Notes, Layout & Language Switcher
34. E6-US07: French Translations
35. E6-US08: i18n CI Guardrails
36. E6-US09: Backend Error Keys & Frontend Error Mapping

## Status Conventions

- **Pending**: Not started
- **In Progress**: Actively being worked on
- **Done**: Implemented with passing tests
- **Blocked**: Cannot proceed (document reason)

## Complexity Reference

| Size | Estimate |
|------|----------|
| XS | ~1 hour |
| S | 2-4 hours |
| M | ~1 day |
| L | 2-3 days |
| XL | ~1 week |
