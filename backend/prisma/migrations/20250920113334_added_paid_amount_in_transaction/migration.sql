/*
  Warnings:

  - Made the column `endMonthId` on table `AcademicSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startMonthId` on table `AcademicSession` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."AcademicSession" DROP CONSTRAINT "AcademicSession_endMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AcademicSession" DROP CONSTRAINT "AcademicSession_startMonthId_fkey";

-- AlterTable
ALTER TABLE "public"."AcademicSession" ALTER COLUMN "endMonthId" SET NOT NULL,
ALTER COLUMN "startMonthId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."FeePayment" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_startMonthId_fkey" FOREIGN KEY ("startMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_endMonthId_fkey" FOREIGN KEY ("endMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
