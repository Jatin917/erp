/*
  Warnings:

  - You are about to drop the column `classId` on the `Section` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_classId_fkey";

-- AlterTable
ALTER TABLE "public"."Class" ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "public"."Section" DROP COLUMN "classId";

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
