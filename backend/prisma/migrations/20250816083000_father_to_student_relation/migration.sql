/*
  Warnings:

  - You are about to drop the column `parentId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "parentId",
ADD COLUMN     "fatherId" TEXT,
ADD COLUMN     "motherId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "public"."Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "public"."Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
