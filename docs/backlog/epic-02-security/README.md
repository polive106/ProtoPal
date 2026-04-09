# Epic 02: Security Hardening

## Overview

Harden the application against the vulnerabilities and gaps identified in the security review. Covers JWT management, registration verification, environment configuration, brute-force protection, rate limiting persistence, password recovery, observability, dependency vulnerabilities, and production readiness.

## Stories

| ID | Title | Complexity | Status |
|----|-------|-----------|--------|
| E2-US01 | JWT Secret & Token Revocation | M | Done |
| E2-US02 | Registration Flow & Email Verification | L | Done |
| E2-US03 | CORS & Environment Hardening | S | Done |
| E2-US04 | Account Lockout & Brute Force Protection | M | Done |
| E2-US05 | Persistent Rate Limiting | M | Done |
| E2-US06 | Password Reset Flow | L | Done |
| E2-US07 | Security Headers & Audit Logging | S | Done |
| E2-US08 | Input Validation Hardening & Payload Size Limits | S | Done |
| E2-US09 | User Enumeration Prevention | M | Done |
| E2-US10 | Token Exposure Reduction | M | Done |
| E2-US11 | Seed Data & Production Safety Guards | S | Pending |
| E2-US12 | Dependency Security Scanning & Supply Chain Protection | S | Pending |
| E2-US13 | Critical Dependency Vulnerability Remediation | M | Pending |
| E2-US14 | Command Injection Fix in Email Preview Service | S | Pending |
| E2-US15 | Login Timing Attack Mitigation | XS | Pending |
| E2-US16 | Security Headers Hardening (Helmet Configuration) | S | Pending |
| E2-US17 | Admin Endpoint Input Validation & Audit Trail | S | Pending |
| E2-US18 | Structured Logging & Console Cleanup for Production Readiness | S | Pending |
