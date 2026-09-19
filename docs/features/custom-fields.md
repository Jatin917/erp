# Feature: Custom field definitions

> Status: Done

## Problem

Custom field definitions could be created and listed, but not updated. The Custom Fields page already had an Edit control, and the frontend already called `PUT /school/update-customField/:id`, but the dialog never opened and the API did not exist.

## Goals / Non-goals

**Goals**
- Staff with `UPDATE_CUSTOM_FIELD` can change an existing field’s name, label, type, required flag, and options.
- Existing `CustomFieldValue` rows stay attached to the same field id.
- Report `FieldRegistry` rows stay in sync, including when the name (and therefore `fieldKey`) changes.

**Non-goals**
- Deleting or reordering fields (UI stubs remain; APIs are still unimplemented).
- Persisting placeholder/description (present in the form, not in `CustomField`).
- Changing `entityType` or `branchId` after create.

## Requirements

- Edit opens the same dialog as create, prefilled with the current definition.
- Update is branch-scoped and permission-gated.
- Duplicate `name` in the same branch is rejected (excluding the field being edited).
- Select/multiselect/radio/checkbox types require at least one non-empty option.

## Solution

- Backend: `PUT /api/v1/school/update-customField/:id` → `updateCustomFields` → `updateCustomFieldService` → `syncCustomFieldToRegistry`.
- Registry sync updates the existing `fieldKey` in place on rename so report columns do not fork into a second inactive key.
- Frontend: `handleEdit` opens the dialog and loads options/`entityType`; `entityType` is locked while editing.

## Security

- `requirePermission(UPDATE_CUSTOM_FIELD)`
- Field’s `branchId` checked against the caller’s accessible branches
- Body `branchId`, if sent, must match the stored field

## Testing

See [testing notes](../decisions/custom-field-edit.md). Manual: open Custom Fields, edit label/options, save, confirm list and admission form.

## Rollback

Remove the PUT route and revert the Custom Fields page edit-dialog changes. No migration.

## Trade-offs

- `entityType` is immutable so student values are not silently re-homed onto another entity.
- Type can change; stored values remain strings and are not migrated.
- Placeholder/description stay UI-only until the schema is extended.
