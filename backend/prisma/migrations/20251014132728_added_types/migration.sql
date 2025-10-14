/*
  Warnings:

  - Changed the type of `type` on the `CustomField` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."customFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'EMAIL', 'PHONE', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'FILE', 'IMAGE', 'URL', 'CURRENCY', 'PERCENTAGE', 'RATING', 'COLOR', 'JSON');

-- AlterTable
ALTER TABLE "public"."CustomField" DROP COLUMN "type",
ADD COLUMN     "type" "public"."customFieldType" NOT NULL;
