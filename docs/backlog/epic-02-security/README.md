# Epic 02: Security Hardening

## Overview

Harden the application against the vulnerabilities and gaps identified in security reviews. Covers JWT management, registration verification, environment configuration, brute-force protection, rate limiting persistence, password recovery, observability, CORS hardening, database schema parity, transaction safety, and mobile security.

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
| E2-US11 | Seed Data & Production Safety Guards | S | Done |
| E2-US12 | Dependency Security Scanning & Supply Chain Protection | S | Done |
| E2-US13 | Refresh Token Rotation & Short-Lived Access Tokens | L | Pending |
| E2-US14 | Non-Production Token Exposure Hardening | S | Pending |
| E2-US15 | Persistent Audit Log Storage | M | Pending |
| E2-US16 | Admin Endpoint Hardening | S | Pending |
| E2-US17 | Data Mutation Audit Trail | S | Pending |
| E2-US18 | Session Management & Forced Logout | M | Pending |
| E2-US19 | Production Environment Hardening | S | Pending |
| E2-US20 | Security Disclosure Policy | XS | Pending |
| E2-US21 | Two-Factor Authentication (TOTP) | XL | Pending |
| E2-US22 | Password History & Reuse Prevention | M | Pending |
| E2-US23 | Mobile Certificate Pinning | M | Pending |
| E2-US24 | Frontend CSP & Source Map Hardening | S | Pending |
| E2-US25 | Mobile Token Storage Hardening | S | Pending |
| E2-US26 | JWT Secret Rotation | M | Pending |
| E2-US27 | Database Connection Security & TLS Enforcement | M | Pending |
| E2-US28 | Container Security Baseline | M | Pending |
| E2-US29 | Security Event Monitoring & Alerting | L | Pending |
| E2-US30 | User Account Deletion & Data Privacy | L | Pending |
| E2-US31 | Unhandled Exception Logging & Error Correlation | M | Pending |
| E2-US32 | CSRF Protection | M | Pending |
| E2-US33 | Auth Endpoint Rate Limit & Access Gaps | S | Pending |
| E2-US34 | PostgreSQL Schema Security Parity | M | Pending |
| E2-US35 | Dependency Vulnerability Remediation | XS | Pending |
| E2-US36 | JWT Claim Hardening | S | Pending |
| E2-US37 | Password Policy Strengthening | S | Pending |
| E2-US38 | Mobile Network & Deep Link Hardening | M | Pending |
| E2-US39 | CORS Null Origin Rejection | XS | Pending |
| E2-US40 | Auth Column Database Indexes | S | Pending |
| E2-US41 | Atomic Password Reset Transaction Safety | M | Pending |
| E2-US42 | Password Reset Token URL Exposure Prevention | S | Pending |
