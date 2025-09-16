/*
  Warnings:

  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `currentYearTotal` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `currentYearTotalBalance` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `currentYearTotalPaid` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastYearTotal` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastYearTotalBalance` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastYearTotalPaid` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lateFine` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `remark` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `rollNo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - Made the column `rollNo` on table `Enrollment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Enrollment" ALTER COLUMN "rollNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "class",
DROP COLUMN "currentYearTotal",
DROP COLUMN "currentYearTotalBalance",
DROP COLUMN "currentYearTotalPaid",
DROP COLUMN "discount",
DROP COLUMN "lastYearTotal",
DROP COLUMN "lastYearTotalBalance",
DROP COLUMN "lastYearTotalPaid",
DROP COLUMN "lateFine",
DROP COLUMN "remark",
DROP COLUMN "rollNo",
DROP COLUMN "section";
