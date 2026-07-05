# School Controllers

## Purpose
HTTP handlers for school organization: schools, branches, classes, sections, subjects, faculty, and related uploads.

## Responsibilities
- School and branch CRUD
- Academic structure (class, section, class labels)
- Faculty management
- File uploads (photos, documents) under uploads/

## Dependencies
- services/school
- middlewares (auth, branch access, permissions)
- prisma

## Public interfaces
Mounted at /api/v1/school via routes/version-1.ts/school/.

## Known limitations
Upload files stored under src/controllers/school/uploads/ - consider external storage for production.

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
