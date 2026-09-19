# Decision log: Custom field edit

> Status: Done  
> Date: 2026-09-18

Tech Lead instructed skip-to-implementation. Defaults used:

| Decision | Choice | Why |
|----------|--------|-----|
| Mutable fields | name, label, type, required, options | Matches the existing edit form; values stay keyed by field id |
| Immutable fields | entityType, branchId | Changing entity would orphan or mis-attribute `CustomFieldValue` rows |
| Registry on rename | Update `fieldKey` in place | Avoids a second registry row for the same custom field |
| Placeholder/description | Not persisted | Not on `CustomField`; schema change was out of scope |
| Delete/reorder | Out of scope | Requested edit only; permissions exist but APIs do not |

## Limitations

- Changing type does not convert existing values.
- Saved reports that hard-code the old `fieldKey` need a refresh after rename.
- Delete and reorder buttons still have no backend.

## Future work

- Persist placeholder/description, or remove them from the form.
- Implement delete (cascade or block when values exist) and reorder.
- Optional: refuse type changes when values already exist.
