/*
  Warnings:

  - You are about to drop the column `amount` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Discount` table. All the data in the column will be lost.
  - Added the required column `appliedAmount` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- DropForeignKey
ALTER TABLE "public"."Discount" DROP CONSTRAINT "Discount_feeDocId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Discount" DROP CONSTRAINT "Discount_feeTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LateFee" DROP CONSTRAINT "LateFee_feeDocId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LateFee" DROP CONSTRAINT "LateFee_feeTemplateId_fkey";

-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "amount",
DROP COLUMN "type",
ADD COLUMN     "appliedAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "policyId" TEXT,
ALTER COLUMN "feeDocId" DROP NOT NULL,
ALTER COLUMN "feeTemplateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."LateFee" ALTER COLUMN "feeDocId" DROP NOT NULL,
ALTER COLUMN "feeTemplateId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."DiscountPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "percentage" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountPolicy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_feeTemplateId_fkey" FOREIGN KEY ("feeTemplateId") REFERENCES "public"."FeeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."DiscountPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_feeDocId_fkey" FOREIGN KEY ("feeDocId") REFERENCES "public"."FeeDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_feeTemplateId_fkey" FOREIGN KEY ("feeTemplateId") REFERENCES "public"."FeeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
