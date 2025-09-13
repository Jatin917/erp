/*
  Warnings:

  - A unique constraint covering the columns `[startMonthId]` on the table `AcademicSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[endMonthId]` on the table `AcademicSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."AcademicSession" ADD COLUMN     "endMonthId" TEXT,
ADD COLUMN     "startMonthId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_startMonthId_key" ON "public"."AcademicSession"("startMonthId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_endMonthId_key" ON "public"."AcademicSession"("endMonthId");

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_startMonthId_fkey" FOREIGN KEY ("startMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_endMonthId_fkey" FOREIGN KEY ("endMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
