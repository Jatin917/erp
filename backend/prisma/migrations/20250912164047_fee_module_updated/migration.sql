/*
  Warnings:

  - You are about to drop the column `admissionFee` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `concessions` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `dueInSession` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `hostelFee` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `paidInSession` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayable` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `transportFee` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `tuitionFee` on the `FeeDoc` table. All the data in the column will be lost.
  - You are about to drop the column `appliedToDocIds` on the `FeeTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `FeeTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `FeeTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `FeeTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `FeeTransaction` table. All the data in the column will be lost.
  - Made the column `sectionId` on table `Class` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classLabelId` on table `Class` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amount` to the `FeeDoc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentId` to the `FeeDoc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeHeadId` to the `FeeDoc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `FeeDoc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentId` to the `FeeTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."FeePaymentType" AS ENUM ('MONTHLY', 'INSTALLMENT', 'ONE_TIME');

-- DropForeignKey
ALTER TABLE "public"."Class" DROP CONSTRAINT "Class_classLabelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Class" DROP CONSTRAINT "Class_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FeeDoc" DROP CONSTRAINT "FeeDoc_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FeeDoc" DROP CONSTRAINT "FeeDoc_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FeeTransaction" DROP CONSTRAINT "FeeTransaction_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Class" ALTER COLUMN "sectionId" SET NOT NULL,
ALTER COLUMN "classLabelId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."FeeDoc" DROP COLUMN "admissionFee",
DROP COLUMN "concessions",
DROP COLUMN "dueInSession",
DROP COLUMN "hostelFee",
DROP COLUMN "paidInSession",
DROP COLUMN "sessionId",
DROP COLUMN "studentId",
DROP COLUMN "totalPayable",
DROP COLUMN "transportFee",
DROP COLUMN "tuitionFee",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "enrollmentId" TEXT NOT NULL,
ADD COLUMN     "feeHeadId" TEXT NOT NULL,
ADD COLUMN     "paymentType" "public"."FeePaymentType" NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "public"."FeeTransaction" DROP COLUMN "appliedToDocIds",
DROP COLUMN "createdAt",
DROP COLUMN "mode",
DROP COLUMN "referenceId",
DROP COLUMN "studentId",
ADD COLUMN     "enrollmentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."FeeHead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeTemplate" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classLabelId" TEXT NOT NULL,
    "feeHeadId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeePayment" (
    "id" TEXT NOT NULL,
    "feeDocId" TEXT NOT NULL,
    "academicMonthId" TEXT,
    "name" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeTransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "feeDocId" TEXT NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FeeTransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Discount" (
    "id" TEXT NOT NULL,
    "feeDocId" TEXT NOT NULL,
    "feeTemplateId" TEXT NOT NULL,
    "transactionId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LateFee" (
    "id" TEXT NOT NULL,
    "feeDocId" TEXT NOT NULL,
    "feeTemplateId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,

    CONSTRAINT "LateFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicMonth" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "AcademicMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_academicMonthId_key" ON "public"."FeePayment"("academicMonthId");

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_classLabelId_fkey" FOREIGN KEY ("classLabelId") REFERENCES "public"."ClassLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTemplate" ADD CONSTRAINT "FeeTemplate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTemplate" ADD CONSTRAINT "FeeTemplate_classLabelId_fkey" FOREIGN KEY ("classLabelId") REFERENCES "public"."ClassLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTemplate" ADD CONSTRAINT "FeeTemplate_feeHeadId_fkey" FOREIGN KEY ("feeHeadId") REFERENCES "public"."FeeHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDoc" ADD CONSTRAINT "FeeDoc_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDoc" ADD CONSTRAINT "FeeDoc_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."FeeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDoc" ADD CONSTRAINT "FeeDoc_feeHeadId_fkey" FOREIGN KEY ("feeHeadId") REFERENCES "public"."FeeHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePayment" ADD CONSTRAINT "FeePayment_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePayment" ADD CONSTRAINT "FeePayment_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTransaction" ADD CONSTRAINT "FeeTransaction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTransactionItem" ADD CONSTRAINT "FeeTransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FeeTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTransactionItem" ADD CONSTRAINT "FeeTransactionItem_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_feeTemplateId_fkey" FOREIGN KEY ("feeTemplateId") REFERENCES "public"."FeeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FeeTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_feeTemplateId_fkey" FOREIGN KEY ("feeTemplateId") REFERENCES "public"."FeeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FeeTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicMonth" ADD CONSTRAINT "AcademicMonth_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
