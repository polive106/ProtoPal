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

### Phase 2: Security Hardening (Pending)
4. E2-US01: JWT Secret & Token Revocation
5. E2-US02: Registration Flow & Email Verification
6. E2-US03: CORS & Environment Hardening
7. E2-US04: Account Lockout & Brute Force Protection
8. E2-US05: Persistent Rate Limiting
9. E2-US06: Password Reset Flow
10. E2-US07: Security Headers & Audit Logging

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
