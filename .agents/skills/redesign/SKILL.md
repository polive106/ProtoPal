---
name: redesign
description: Redesign a page or component using the project design system components, CSS variables, and Tailwind utilities.
---

## Design System Components

Available from `@acme/design-system`:

| Component | Usage |
|-----------|-------|
| Button | Primary actions, variants: default, destructive, outline, secondary, ghost, link |
| Input | Text inputs with validation states |
| Label | Form field labels |
| Card | Content containers (CardHeader, CardTitle, CardContent, CardFooter) |
| FrostedPanel | Glass-morphism container for hero sections |
| Dialog | Modal dialogs with overlay |
| Toast | Notification system (default, destructive, success) |
| DropdownMenu | Action menus |
| PageSpinner | Loading states |
| EmptyState | Zero-data states with icon, title, description, action |
| ErrorAlert | Dismissible error messages |
| Skeleton | Loading placeholders |

## CSS Variables

The design system uses HSL CSS variables. See `packages/frontend/src/styles/index.css` for the full list:
- `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`
- `--background`, `--foreground`, `--card`, `--popover`
- `--border`, `--input`, `--ring`

## Guidelines
1. Always use design system components over raw HTML
2. Use Tailwind utility classes for layout
3. Add `data-testid` attributes for E2E testing
4. Follow the existing page patterns in `packages/frontend/src/routes/`
