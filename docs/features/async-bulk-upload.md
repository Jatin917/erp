# Feature Design: Async student bulk upload

> Status: Done  
> Date: 2026-09-18  
> Approach: Option A — BullMQ job + Postgres job/row tables

### Tech Lead decisions (2026-09-18)
1. Status UI: **dedicated page** under Student
2. List/detail jobs: permission **`BULK_UPLOAD_STUDENTS` only**
3. Docker: **add `bulk-upload-worker`** Compose service from backend image

## Problem

`POST /student/bulk-upload` processes every Excel row inside the HTTP request. Large sheets time out or leave the user blocked with no progress. The UI only learns outcomes when the whole request finishes.

## Goals / Non-goals

**Goals**
- Accept the sheet quickly and process students in the background.
- Persist a **job** plus **per-row** success/fail/error so the user can inspect status later.
- Reuse existing row-create logic (user/parent/student/enrollment/barcode) with minimal duplication.
- Branch-scope jobs and enforce existing bulk-upload permissions.

**Non-goals (v1)**
- Per-row retry from the UI.
- Email/SMS when a job finishes.
- Live websocket progress (polling / refresh is enough).
- Changing the sample-sheet column contract.

## Requirements

### Functional
1. Upload returns **202** with `{ jobId }` after validation + enqueue (not after all rows).
2. Background worker processes rows and writes results as it goes.
3. User can list jobs for the active branch and open a job to see each row’s status.
4. Job summary: status, total/success/fail counts, class, file name, uploader, timestamps.

### Non-functional
- Survives API process restarts if Redis + DB + worker are up (file must remain on shared storage until worker finishes).
- Worker concurrency: **1 job at a time per worker** initially (avoid DB/barcode stampede); configurable later.
- Max file size: keep current multer/disk behavior unless Tech Lead sets a limit.

## Solution

### Data model

```prisma
enum BulkUploadJobStatus {
  PENDING
  RUNNING
  SUCCEEDED   // all rows succeeded
  PARTIAL     // some failed
  FAILED      // job-level failure (bad file, class missing after enqueue, worker crash after mark)
}

model BulkUploadJob {
  id            String               @id @default(uuid())
  branchId      String
  classLabelId  String?
  className     String               // denormalized for display
  sectionId     String?              // from upload form (UI today sends it; rows may also carry sectionId)
  fileName      String
  filePath      String               // server path until processed
  status        BulkUploadJobStatus  @default(PENDING)
  totalRows     Int                  @default(0)
  successCount  Int                  @default(0)
  failCount     Int                  @default(0)
  errorMessage  String?              // job-level error
  createdById   String
  createdAt     DateTime             @default(now())
  startedAt     DateTime?
  finishedAt    DateTime?
  branch        Branch               @relation(...)
  createdBy     User                 @relation(...)
  rows          BulkUploadRow[]

  @@index([branchId, createdAt])
}

model BulkUploadRow {
  id            String   @id @default(uuid())
  jobId         String
  rowNumber     Int      // Excel row (header = 1)
  studentName   String?
  admissionNo   String?
  status        String   // PENDING | SUCCESS | FAILED (or small enum)
  studentId     String?  // created Student.id
  errorMessage  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  job           BulkUploadJob @relation(...)

  @@unique([jobId, rowNumber])
  @@index([jobId, status])
}
```

No schema change to `Student` for v1 — status lives on the job/row tables. “See status in the list” = **bulk-upload job/results list**, not a new column on the main student grid.

### API

| Method | Path | Permission | Behavior |
|--------|------|------------|----------|
| POST | `/student/bulk-upload` | `BULK_UPLOAD_STUDENTS` | Validate branch/class/file → create `BulkUploadJob` (PENDING) → enqueue BullMQ → **202** `{ jobId, status }` |
| GET | `/student/bulk-upload-jobs?branchId=` | `BULK_UPLOAD_STUDENTS` | List jobs for branch, newest first |
| GET | `/student/bulk-upload-jobs/:jobId` | `BULK_UPLOAD_STUDENTS` | Job summary |
| GET | `/student/bulk-upload-jobs/:jobId/rows?status=` | `BULK_UPLOAD_STUDENTS` | Per-row results |

`GET /download-bulk-sample` unchanged.

### Controller (upload) flow

1. Multer saves file under `uploads/`.
2. Validate `branchId`, `className` (class label exists), file present.
3. Optionally peek sheet for `totalRows` (or set total when worker starts).
4. `BulkUploadJob.create({ filePath, fileName, branchId, className, sectionId, createdById, status: PENDING })`.
5. `studentBulkUploadQueue.add('process-bulk-upload', { jobId })`.
6. Return 202. **Do not** unlink the file in the HTTP handler.

### Queue / worker

- New queue: `student-bulk-upload-queue` (same Redis connection pattern as email/attendance).
- New producer helper under `producers-notifications/producers/`.
- New worker script in **backend** (not the email-only `worker/` package), because it needs Prisma, student services, barcode, and the uploads volume:
  - npm script: `worker-student-bulk-upload`
  - Docker Compose: new service `bulk-upload-worker` built from `backend`, command runs that script, mounts `backend_uploads`, has `DATABASE_URL` + `REDIS_URL`.

Worker algorithm:
1. Load job; if missing → fail.
2. Set `RUNNING` + `startedAt`.
3. Read workbook from `filePath`; set `totalRows`.
4. For each data row (same mapping as today’s `bulkUploadStudents`):
   - Upsert/create `BulkUploadRow` (PENDING → SUCCESS/FAILED).
   - On success: existing transaction (user/parent/student/enrollment) + barcode; store `studentId`.
   - On failure: store `errorMessage`; continue.
   - Periodically bump job `successCount` / `failCount` (or once at end).
5. Set final status `SUCCEEDED` | `PARTIAL` | `FAILED`, `finishedAt`.
6. Unlink `filePath` in `finally`.

Extract current loop body into a service e.g. `createStudentFromBulkRow(...)` used only by the worker (controller stops owning the loop).

### Frontend

- Fix missing `return` on `bulkUploadStudents` API call (pre-existing).
- After upload: toast “Import started” + navigate to **Bulk Upload Status** (or show inline job panel).
- New page (or section on `BulkUpload.tsx`):
  - Table of jobs (status badge, counts, time, file name).
  - Job detail: row table (row #, name, admissionNo, status, error, link to student if SUCCESS).
  - Poll every ~5s while selected job is `PENDING`/`RUNNING`, stop when terminal.

Nav: dedicated **Bulk Upload Status** page under Student (separate from the import page).

### Security

- Create/list/detail: branch access via `requireBranchAccess` + permission.
- Resolve job’s `branchId` for `:jobId` routes (same pattern as custom-field id → branch).
- Do not expose `filePath` in API responses.
- Worker does not trust client for branch; uses job record only.

### Errors

| Case | Behavior |
|------|----------|
| Invalid class on upload | 4xx, no job |
| Worker file missing | Job `FAILED`, `errorMessage` |
| Row validation fail | Row `FAILED`, job continues |
| Redis down on enqueue | 503; delete job or mark FAILED; delete file |

### Testing

- Unit: row mapper / status aggregation.
- Manual: small sheet → 202 → poll → all SUCCESS; sheet with bad rows → PARTIAL; kill worker mid-job → document recovery (re-queue out of scope v1).
- Regression: sample download still works; single-student create unchanged.

### Rollback

- Feature-flag or revert route to synchronous handler.
- Drop tables via reverse migration if needed.
- Stop Compose `bulk-upload-worker` service.

### Trade-offs

| Choice | Why |
|--------|-----|
| Backend worker, not `worker/` package | Needs Prisma + uploads + domain code |
| Job/row tables vs BullMQ job data only | Survives Redis eviction; queryable UI |
| Polling not websockets | Simpler; enough for admin import |
| Status not on Student list | Clear ownership; avoid cluttering student grid |

## Critique notes (Phase 4)

- **Shared uploads volume** is mandatory for API + worker; without it jobs fail after 202.
- **sectionId**: UI sends form `sectionId` but current loop uses row `sectionId` for enrollment — design keeps both: store form `sectionId` on job as default when row omits it (small fix while extracting).
- **Idempotency**: re-running the same BullMQ job id must not double-create students; use job status guard (`if status !== PENDING && !== RUNNING` skip) and unique admissionNo behavior as today.
- **Orphan PENDING jobs** if enqueue fails after DB insert — wrap create+enqueue carefully or mark FAILED.
- **Large sheets**: writing one DB result per row is fine for school-scale; batch inserts optional later.

## Open items for Tech Lead

Resolved 2026-09-18 (dedicated page; `BULK_UPLOAD_STUDENTS` only; Compose worker OK).
