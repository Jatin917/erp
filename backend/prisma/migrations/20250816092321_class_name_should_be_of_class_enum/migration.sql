/*
  Warnings:

  - Changed the type of `name` on the `Class` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "name",
ADD COLUMN     "name" "public"."ClassEnum" NOT NULL;
