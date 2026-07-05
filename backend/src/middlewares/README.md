# Middlewares

## Purpose
Cross-cutting HTTP concerns: authentication, branch access, and permission checks.

## Responsibilities
- **auth/token.ts** - Validate JWT Bearer tokens; attach user to req.user
- **branch-access/** - Verify user may access the requested branch (role-based)
- **permission/** - requirePermission checks against user.permissions array

## Dependencies
- prisma (user lookup)
- JWT_SECRET from server.ts
- lib/permission.ts (permission groupings)

## Public interfaces
- TokenCheck - most /api/v1 routes
- requireBranchAccess - school, student, fee, attendance, reports, templates
- requirePermission(permission) - per-route granular checks

## How it works
Request flows: TokenCheck -> requireBranchAccess -> requirePermission -> controller.

## Known limitations
Permissions are global on User, not branch-scoped. See .github/issues/branch-scoped-permissions.md and docs/database/schema-overview.md.

## Extension points
Add new middleware modules under this directory; register in route files under routes/version-1.ts/.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added (workflow bootstrap) |
