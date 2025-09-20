-- AlterTable
ALTER TABLE "public"."FeeTemplate" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "installements" DOUBLE PRECISION,
ADD COLUMN     "paymentType" "public"."FeePaymentType" NOT NULL DEFAULT 'ONE_TIME';
