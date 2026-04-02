# ADR-0004: Shared Design System

## Status

Accepted

## Context

We need consistent UI components across the application (and potentially future apps). Components should be themeable, accessible, and decoupled from application-specific logic.

## Decision

We created a dedicated **`@acme/design-system`** package in the monorepo, built on:

- **Radix UI** for unstyled, accessible component primitives (Dialog, Sheet, DropdownMenu, etc.)
- **Tailwind CSS** for utility-first styling
- **CSS variables** for theming (colors, spacing, radii)
- **TailwindCSS Animate** for transition/animation utilities

The package exports reusable components (Button, Card, Input, Toast, ErrorAlert, EmptyState, etc.) that the frontend and any future consumer apps import directly.

## Consequences

### Positive
- Single source of truth for UI components — visual consistency by default
- Radix UI provides keyboard navigation, focus management, and ARIA attributes out of the box
- CSS variables enable theme switching without rebuilding components
- Design system changes propagate to all consumers via the monorepo

### Negative
- Changes to design-system components can have wide blast radius across consumers
- Radix primitives require understanding their composition API
- The package must remain framework-agnostic enough to support future consumers

## Alternatives Considered
- **Inline components per app**: No shared package — fast to start but diverges across apps over time
- **Copy-paste approach (shadcn/ui style)**: Components live in each app — avoids package coupling but duplicates code and drifts
- **Third-party UI kit (MUI, Chakra)**: Full-featured but opinionated, harder to customize, and adds significant bundle weight
