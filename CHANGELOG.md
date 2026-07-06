# Changelog

All notable changes documented per [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
