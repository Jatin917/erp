# Implementation Plan: Async student bulk upload

> Status: Done  
> Design: [async-bulk-upload.md](./async-bulk-upload.md)

## Context

Convert sync `POST /student/bulk-upload` into enqueue + BullMQ worker; persist job/row status; dedicated frontend status page.

## Milestones

### M1 — Schema + migration
- **Objective:** Add `BulkUploadJobStatus`, `BulkUploadJob`, `BulkUploadRow`; wire `Branch`/`User` relations.
- **Files:** `backend/prisma/schema.prisma`, new migration, `docs/database/bulk-upload-jobs.md`
- **Complexity:** M | **Deps:** none
- **Risks:** migration apply order in shared envs
- **Deliverables:** migrate applies; Prisma client generates

### M2 — Extract row create + queue/producer
- **Objective:** Move row processing into a service; add BullMQ queue + enqueue helper; upload returns 202.
- **Files:** student services; `queues/queue.ts`; new producer; refactor `bulkUploadStudents` controller
- **Complexity:** L | **Deps:** M1
- **Risks:** behavior drift (sectionId default, barcode soft-fail)
- **Deliverables:** no inline row loop in HTTP handler

### M3 — Worker + Compose
- **Objective:** Process jobs, write rows, finalize status, delete file; Compose `bulk-upload-worker`.
- **Files:** `student-bulk-upload-worker.ts`; `package.json` script; `docker-compose.yml`; module READMEs
- **Complexity:** L | **Deps:** M2
- **Risks:** missing shared uploads volume; mid-job crash
- **Deliverables:** sheet completes end-to-end via worker

### M4 — Status APIs
- **Objective:** List jobs, get job, list rows; branch-scoped; permission `BULK_UPLOAD_STUDENTS` only.
- **Files:** student controller/routes; branch-access resolve for job id; `docs/api/student-bulk-upload.md`
- **Complexity:** M | **Deps:** M1–M2
- **Deliverables:** scoped GETs only

### M5 — Frontend dedicated status page
- **Objective:** Import → toast + navigate; job list + row detail with light polling.
- **Files:** `studentService` (fix missing `return`); store; `BulkUpload.tsx`; new status page; routes + nav
- **Complexity:** M | **Deps:** M4
- **Deliverables:** Student → Bulk Upload Status page

### M6 — Docs + CHANGELOG
- Feature Done, decision log, CHANGELOG, knowledge transfer.

## Order

M1 → M2 → M3 → M4 → M5 → M6

## Out of scope

Per-row retry, websockets, completion email, student-grid status column.

## Manual success check

1. Import → immediate toast + status page shows job running
2. Rows update; job ends SUCCEEDED or PARTIAL
3. Without `BULK_UPLOAD_STUDENTS`, jobs APIs forbidden
4. Sample download + single create still work
