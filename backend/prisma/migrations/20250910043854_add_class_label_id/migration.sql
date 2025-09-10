/*
  Warnings:

  - You are about to drop the column `name` on the `Class` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "name",
ADD COLUMN     "classLabelId" TEXT;

-- CreateTable
CREATE TABLE "public"."ClassLabel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassLabel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_classLabelId_fkey" FOREIGN KEY ("classLabelId") REFERENCES "public"."ClassLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassLabel" ADD CONSTRAINT "ClassLabel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
