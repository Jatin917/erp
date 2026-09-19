# Field Registry

## Purpose
Central registry of reportable fields across domains (student, fee, attendance, etc.).

## Responsibilities
- **definitions/** - Field metadata per domain
- **cache/field-registry-cache.ts** - In-memory cache loaded at server startup
- **seed/** - Database seeding for field registry

## Dependencies
- Prisma field registry models
- Loaded in server.ts via loadFieldRegistryCache()

## How it works
Custom fields upsert into FieldRegistry with key `custom_{entity}_{name}`. On rename, `syncCustomFieldToRegistry` updates that key in place and invalidates the Redis/memory cache.

## Recent changes
| Date | Change |
|------|--------|
| 2026-09-18 | Single-field sync, in-place fieldKey rename, cache invalidation |
| 2026-07-05 | Co-located README added |
