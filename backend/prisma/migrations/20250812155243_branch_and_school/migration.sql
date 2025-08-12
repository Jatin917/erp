/*
  Warnings:

  - You are about to drop the column `address` on the `School` table. All the data in the column will be lost.
  - Added the required column `address` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."School" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "password" SET NOT NULL;
