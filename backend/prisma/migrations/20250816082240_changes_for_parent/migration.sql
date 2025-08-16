/*
  Warnings:

  - You are about to drop the column `fatherUserId` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `motherUserId` on the `Parent` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Parent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Parent" DROP CONSTRAINT "Parent_fatherUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Parent" DROP CONSTRAINT "Parent_motherUserId_fkey";

-- DropIndex
DROP INDEX "public"."Parent_fatherUserId_key";

-- DropIndex
DROP INDEX "public"."Parent_motherUserId_key";

-- AlterTable
ALTER TABLE "public"."Parent" DROP COLUMN "fatherUserId",
DROP COLUMN "motherUserId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
