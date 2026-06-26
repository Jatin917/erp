-- Remove duplicate class labels per branch (keep oldest), case-insensitive
DELETE FROM "public"."ClassLabel" AS cl
WHERE cl.id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "branchId", LOWER("name")
        ORDER BY "createdAt" ASC
      ) AS row_num
    FROM "public"."ClassLabel"
  ) ranked
  WHERE row_num > 1
);

CREATE UNIQUE INDEX "ClassLabel_branchId_name_key" ON "public"."ClassLabel"("branchId", "name");