# Knowledge Transfer: Custom field edit

## What changed
Staff can edit custom field definitions from Custom Fields Management. The Edit button now opens the form, and the backend persists the change.

## Why
The page already showed Edit, but the dialog never opened and `PUT /school/update-customField/:id` did not exist.

## Files
- `backend/src/controllers/school/school/index.ts` — `updateCustomFields`
- `backend/src/services/school/index.ts` — `updateCustomFieldService`, option helpers
- `backend/src/routes/version-1.ts/school/branch/index.ts` — PUT route
- `backend/src/registry/seed/sync-custom-fields.ts` — single-field sync + in-place rename
- `backend/src/middlewares/branch-access/index.ts` — resolve branch from custom field id
- `frontend/src/pages/management/student/CustomFieldsPage.tsx` — open/prefill edit dialog

## Decisions
See `docs/decisions/custom-field-edit.md`. Entity type is locked. Name/label/type/options/required are editable.

## Future work
Delete, reorder, persist placeholder/description, optional lock on type when values exist.

## Maintenance
After rename, field registry cache is invalidated. Saved reports using the old `fieldKey` may need to be re-selected.
