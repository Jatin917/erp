/*
  Warnings:

  - A unique constraint covering the columns `[receiptNo]` on the table `FeeTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mode` to the `FeeTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptNo` to the `FeeTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FeeTransaction" ADD COLUMN     "mode" "public"."PaymentMode" NOT NULL,
ADD COLUMN     "receiptNo" TEXT NOT NULL,
ADD COLUMN     "referenceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FeeTransaction_receiptNo_key" ON "public"."FeeTransaction"("receiptNo");
