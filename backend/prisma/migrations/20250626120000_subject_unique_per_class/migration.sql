-- Reassign lectures from duplicate subjects to the oldest subject per class + name
WITH ranked AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY "classId", LOWER("name")
      ORDER BY "createdAt" ASC
    ) AS keep_id
  FROM "public"."Subject"
)
UPDATE "public"."Lecture" l
SET "subjectId" = r.keep_id
FROM ranked r
WHERE l."subjectId" = r.id
  AND r.id <> r.keep_id;

-- Remove duplicate subjects (keep oldest per class + case-insensitive name)
DELETE FROM "public"."Subject" s
WHERE s.id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "classId", LOWER("name")
        ORDER BY "createdAt" ASC
      ) AS row_num
    FROM "public"."Subject"
  ) ranked
  WHERE row_num > 1
);

CREATE UNIQUE INDEX "Subject_classId_name_key" ON "public"."Subject"("classId", "name");
