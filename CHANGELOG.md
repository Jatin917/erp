# Changelog

All notable changes documented per [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Docker Compose stack for `db`, `redis`, `backend`, `worker` (email), and `frontend`, with Dockerfiles and `.env.docker.example`

### Security
- API permission middleware (`requirePermission`/`requireAnyPermission`) now enforces branch-scoped effective permissions (same resolution as login/session) instead of the raw global `user.permissions` column; role assignment (`create-faculty`, `update-faculty`) and permission grants use the same scoped set
- `change-password` no longer accepts an email in the body (IDOR); it only changes the authenticated user's password, and the missing `await` on the current-password check is fixed
- `GET /student` now requires `branchId` (previously returned students across all branches when omitted)
- `GET /attendance/get-school-days` validates the session's branch against the caller's accessible branches
- `assign-permission` and `user-permissions/:userId` are tenant-scoped: non-ALL grantors can only view/modify users belonging to their accessible branches

### Fixed
- `get-branches` for DIRECTOR no longer calls the HTTP `getSchools` controller (which caused `req.user` / `res.status` TypeErrors); it uses `getSchoolsWithBranchesService` instead
- Frontend-mode routes added for Subject, Time Table, and Student Custom Fields (nav items previously pointed at missing routes)
- Collect Fees path unified to `/management/fee/collect-fees` in both router modes; School Manager menu visible to users with only `CREATE_SCHOOL` in backend router mode
- `create-user` page now uses the canonical `RoleCode` from `types/entity.ts`; stale duplicate `RoleCode`/`PermissionConstant`/`Weekday` removed from `types/contant.ts`
- Branch-scoped session permissions: login and `/auth/session` now return roles/permissions for the active branch only
- Login as a different user no longer keeps the previous user's permissions (client store fully replaced on sign-in)
- Branch picker triggers permission refresh when switching schools/branches

### Removed
- Ungated Slash Admin demo pages (components, functions, calendar, kanban, menu levels, permission demo, link, blank, analysis) and stub System Role/User pages from frontend router mode nav and routes

### Changed
- Enforce role separation: super admin, director, principal, and school admin cannot be combined on one user
- Block self-assignment of director/principal during school creation (backend + frontend)
- Remove "Assign Myself" option from school creation UI for director and principal
- Director cannot be assigned any school faculty role or SchoolFaculty record (any branch)
- Principal may only receive faculty roles / SchoolFaculty at their own principal branch
- Centralize `SCHOOL_FACULTY_ROLES` and branch-scoped validation in `role-grant.ts`
- Fix super admin error message to reflect total role lock (no additional roles allowed)

- 16 document templates under docs/templates/
- Engineering workflow (Phases 0-11), review policy, behavior rules
- ADR-0001: Adopt engineering workflow
- Co-located README.md for 15 major modules
- Root README.md and Cursor workflow rule
- Repository analysis and architecture overview

## [2026-07-05]

### Added
- Repository bootstrap for formal AI engineering workflow
