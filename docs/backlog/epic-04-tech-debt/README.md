# Epic 04: Tech Debt

Cleanup and consolidation tasks identified during simplify code reviews. These items reduce duplication across the mobile and frontend packages, optimize database performance, and improve maintainability.

## Stories

| ID | Title | Complexity | Status | Dependencies |
|----|-------|-----------|--------|--------------|
| E4-US01 | Share validation schemas via @acme/shared | S | Done | None |
| E4-US02 | Share Note type and query keys via @acme/shared | S | Done | None |
| E4-US03 | Reduce RegisterUser constructor parameter sprawl | M | Done | None |
| E4-US04 | Unify i18n infrastructure across frontend and mobile | M | To Do | None |
| E4-US05 | Consolidate validation schemas with i18n support | M | To Do | E4-US04 |
| E4-US06 | Add missing MongoDB indexes and optimize queries | S | To Do | None |
| E4-US07 | Consolidate MongoDB adapter test infrastructure and shared types | S | To Do | None |
| E4-US08 | Consolidate ApiError class and error translation | S | To Do | None |
| E4-US09 | Unify test setup mocks across frontend and mobile | S | To Do | None |
