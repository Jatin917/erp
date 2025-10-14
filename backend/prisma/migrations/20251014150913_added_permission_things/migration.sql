-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Permission" ADD VALUE 'GET_CUSTOM_FIELD';
ALTER TYPE "public"."Permission" ADD VALUE 'CREATE_CUSTOM_FIELD';
ALTER TYPE "public"."Permission" ADD VALUE 'UPDATE_CUSTOM_FIELD';
ALTER TYPE "public"."Permission" ADD VALUE 'DELETE_CUSTOM_FIELD';
ALTER TYPE "public"."Permission" ADD VALUE 'REORDER_CUSTOM_FIELD';
