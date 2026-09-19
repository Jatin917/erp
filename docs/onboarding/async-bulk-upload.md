# Knowledge Transfer: Async student bulk upload

## What changed
Student Excel/CSV import no longer blocks the HTTP request. The API creates a `BulkUploadJob`, enqueues BullMQ work, and returns 202. A worker creates students row-by-row and stores per-row status. The UI has a dedicated Bulk Upload Status page.

## Why
Large sheets timed out and users had no progress visibility.

## Files
- Prisma: `BulkUploadJob`, `BulkUploadRow` + migration `20260918053000_async_bulk_upload_jobs`
- `backend/src/services/student/bulk-upload.ts`
- `backend/src/services/producers-notifications/queues/queue.ts` + `producers/producer.bulk-upload.ts` + `worker/student-bulk-upload-worker.ts`
- Student controller/routes; branch-access for `:jobId`
- `docker-compose.yml` — `bulk-upload-worker`
- Frontend: `BulkUpload.tsx`, `BulkUploadStatusPage.tsx`, store/API, nav/route

## Ops
- Run worker: `npm run worker-student-bulk-upload` (backend) or Compose service `bulk-upload-worker`
- Worker must share Redis + DB + `uploads` volume with API
- Apply migration: `npx prisma migrate deploy`

## Future work
Per-row retry, recovery for stuck RUNNING jobs, completion notifications
