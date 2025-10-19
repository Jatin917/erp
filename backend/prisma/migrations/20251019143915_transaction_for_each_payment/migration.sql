-- CreateTable
CREATE TABLE "public"."FeePaymentAllocation" (
    "id" TEXT NOT NULL,
    "feePaymentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FeePaymentAllocation" ADD CONSTRAINT "FeePaymentAllocation_feePaymentId_fkey" FOREIGN KEY ("feePaymentId") REFERENCES "public"."FeePayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePaymentAllocation" ADD CONSTRAINT "FeePaymentAllocation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."FeeTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
