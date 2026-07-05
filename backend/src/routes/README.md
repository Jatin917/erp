# Routes

## Purpose
Express router composition for API v1.

## Structure
routes/version-1.ts/ contains:
- route.ts - Main router_v1 mounting all modules
- school/, user/, studentRouter/, feeModuleRouter/, attendanceModuleRouter/, reports/, templates/

## Middleware pattern
Most routes: TokenCheck + requireBranchAccess. Auth routes exempt from token.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
