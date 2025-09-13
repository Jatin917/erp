/*
  Warnings:

  - Added the required column `branchId` to the `DiscountPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Permission" ADD VALUE 'CREATE_DISCOUNT_POLICY';
ALTER TYPE "public"."Permission" ADD VALUE 'VIEW_DISCOUNT_POLICY';
ALTER TYPE "public"."Permission" ADD VALUE 'UPDATE_DISCOUNT_POLICY';
ALTER TYPE "public"."Permission" ADD VALUE 'DELETE_DISCOUNT_POLICY';
ALTER TYPE "public"."Permission" ADD VALUE 'APPLY_DISCOUNT';
ALTER TYPE "public"."Permission" ADD VALUE 'DELETE_APPLY_DISCOUNT';
ALTER TYPE "public"."Permission" ADD VALUE 'VIEW_APPLY_DISCOUNT';

-- AlterTable
ALTER TABLE "public"."DiscountPolicy" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."DiscountPolicy" ADD CONSTRAINT "DiscountPolicy_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
