# Epic 07: MongoDB Database Adapter

## Overview

Add MongoDB as an alternative database engine for the ProtoPal scaffold. Restructure `@acme/database` to cleanly abstract over multiple database backends (Drizzle SQL and MongoDB), using the official `mongodb` driver with flat collection mapping. The domain layer remains unchanged — all adapters implement the same port interfaces.

## Stories

| ID | Title | Complexity | Status | Dependencies |
|----|-------|-----------|--------|--------------|
| E7-US01 | Restructure @acme/database Package | M | Done | None |
| E7-US02 | MongoDB Connection Factory | S | Done | E7-US01 |
| E7-US03 | Core Mongo Adapters | L | Done | E7-US02 |
| E7-US04 | Auth Mongo Adapters | M | Done | E7-US02 |
| E7-US05 | MongoDB Setup Script | S | Pending | E7-US03, E7-US04 |
| E7-US06 | DI Wiring for Database Selection | S | Pending | E7-US05 |
| E7-US07 | Mongo Adapter Unit Tests | M | Pending | E7-US06 |
| E7-US08 | MongoDB Documentation | XS | Pending | E7-US07 |

## Dependency Graph

```
E7-US01 → E7-US02 → E7-US03 ─┐
                    E7-US04 ─┤→ E7-US05 → E7-US06 → E7-US07 → E7-US08
```
