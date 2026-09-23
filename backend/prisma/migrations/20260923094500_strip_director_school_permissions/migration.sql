-- Strip school-level permissions from Director users.
-- Directors no longer receive these via roleDefaults; remove stored grants so they
-- cannot persist as "custom grants" after the defaults change.

UPDATE "User"
SET "permissions" = ARRAY(
  SELECT p
  FROM unnest("permissions") AS p
  WHERE p::text NOT IN (
    'CREATE_SCHOOL',
    'VIEW_SCHOOL',
    'EDIT_SCHOOL',
    'DELETE_SCHOOL'
  )
)
WHERE 'DIRECTOR' = ANY ("role");
