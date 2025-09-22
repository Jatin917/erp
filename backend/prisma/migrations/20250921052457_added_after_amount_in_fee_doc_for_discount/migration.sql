-- AlterTable
ALTER TABLE "public"."FeeDoc" ADD COLUMN     "afterAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."FeeTransaction" ADD COLUMN     "returnedAmt" DOUBLE PRECISION NOT NULL DEFAULT 0;
