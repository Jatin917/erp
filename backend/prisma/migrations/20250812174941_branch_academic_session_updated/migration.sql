/*
  Warnings:

  - You are about to drop the column `schoolId` on the `AcademicSession` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `AcademicSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AcademicSession" DROP CONSTRAINT "AcademicSession_schoolId_fkey";

-- AlterTable
ALTER TABLE "public"."AcademicSession" DROP COLUMN "schoolId",
ADD COLUMN     "branchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
