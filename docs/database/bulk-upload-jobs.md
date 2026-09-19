# DB change: Bulk upload jobs

## Summary
Add `BulkUploadJob` and `BulkUploadRow` to track async student sheet imports and per-row outcomes.

## Schema
See [async-bulk-upload.md](../features/async-bulk-upload.md) — enums `BulkUploadJobStatus`, models `BulkUploadJob`, `BulkUploadRow`, relations on `Branch` and `User`.

## Migration
Standard Prisma migration; no data backfill. Existing sync uploads have no historical jobs.

## Rollback
Drop both tables and enum; remove relations from `Branch` / `User`.

## Risks
- Disk path in `filePath` must only be used server-side.
- Index `(branchId, createdAt)` for list performance.
