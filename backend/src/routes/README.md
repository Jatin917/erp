# Routes

## Purpose
Express router composition for API v1.

## Structure
routes/version-1.ts/ contains:
- route.ts - Main router_v1 mounting all modules
- school/, user/, studentRouter/, feeModuleRouter/, attendanceModuleRouter/, reports/, templates/

## Middleware pattern
Most routes: TokenCheck + requireBranchAccess. Auth routes exempt from token.

Custom field update: `PUT /school/update-customField/:id` (`UPDATE_CUSTOM_FIELD`).

## Recent changes
| Date | Change |
|------|--------|
| 2026-09-18 | PUT update-customField/:id |
| 2026-09-18 | Student bulk-upload-jobs GETs; POST bulk-upload returns 202 |
| 2026-07-05 | Co-located README added |
