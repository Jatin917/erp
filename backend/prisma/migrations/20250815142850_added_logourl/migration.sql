-- AlterEnum
ALTER TYPE "public"."Permission" ADD VALUE 'ALL';

-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "logoUrl" TEXT;
