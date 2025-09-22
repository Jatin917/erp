-- AlterTable
ALTER TABLE "public"."FeePayment" ADD COLUMN     "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."LateFee" ADD COLUMN     "paymentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."LateFee" ADD CONSTRAINT "LateFee_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."FeePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
