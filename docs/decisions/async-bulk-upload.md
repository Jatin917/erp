# Decision log: Async student bulk upload

> Status: Accepted  
> Date: 2026-09-18  
> Design: [async-bulk-upload.md](../features/async-bulk-upload.md)  
> Plan: [async-bulk-upload-plan.md](../features/async-bulk-upload-plan.md)

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Processing | BullMQ + Postgres job/row tables | Survives API timeouts; queryable status UI |
| Worker location | Backend package + Compose `bulk-upload-worker` | Needs Prisma, domain services, shared uploads |
| Status UI | Dedicated Student page | Clear job/row history without cluttering student list |
| Permissions | `BULK_UPLOAD_STUDENTS` for upload + list/detail | Matches who can import |
| Progress UX | Poll while PENDING/RUNNING | Simple; good enough for admin imports |
| sectionId | Job form sectionId as default when row omits it | Matches UI which already selects section |

## Assumptions

- Redis is available (same as email/attendance queues).
- API and worker share the `backend_uploads` volume in Compose.
- Existing per-row create semantics (parents, enrollment, barcode soft-fail) stay the same.

## Limitations

- No per-row retry, websockets, or completion email in v1.
- Mid-job worker crash leaves job RUNNING until manual intervention / future recovery.
- Placeholder historical sync uploads are not backfilled as jobs.

## Trade-offs

Job/row tables add schema surface but make the status page reliable vs storing only BullMQ payload.

## Change summary

Sync bulk upload becomes: accept file → create job → enqueue → worker writes row results → dedicated status page.
