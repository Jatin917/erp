# Lib

## Purpose
Shared utilities, permission definitions, role grants, and HTTP helpers used across the backend.

## Responsibilities
- **permission.ts** - Maps domain keys to Permission enum arrays
- **role-grant.ts** / **permission-grant.ts** - Role-to-permission assignment logic
- **apply-role-permissions.ts** - Apply grants to users
- **http-codes.ts** - HTTP_STATUS constants
- **utils.ts** - sendError and shared helpers
- **contants.ts** - Application constants
- **types.ts** - Shared TypeScript types

## Dependencies
- generated/prisma (Role, Permission enums)

## Public interfaces
Exported constants and functions imported via @src/lib/*.

## Known limitations
Permission model is flat per user; branch context not in permission layer.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
