-- Idempotent permission additions (originally in out-of-order 202506/202507 migrations)
DO $$
DECLARE
  permission_name TEXT;
BEGIN
  FOREACH permission_name IN ARRAY ARRAY[
    'ASSIGN_PERMISSION',
    'CREATE_FACULTY',
    'VIEW_FACULTY',
    'EDIT_FACULTY',
    'DELETE_FACULTY',
    'CREATE_SECTION',
    'VIEW_SECTION',
    'EDIT_SECTION',
    'DELETE_SECTION',
    'CREATE_SUBJECT',
    'VIEW_SUBJECT',
    'EDIT_SUBJECT',
    'DELETE_SUBJECT'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'Permission'
        AND e.enumlabel = permission_name
    ) THEN
      EXECUTE format('ALTER TYPE "public"."Permission" ADD VALUE %L', permission_name);
    END IF;
  END LOOP;
END $$;
