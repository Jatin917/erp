/*
  Warnings:

  - The values [PARENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Parent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fatherUserId]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[motherUserId]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fatherUserId` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherUserId` to the `Parent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('SUPERADMIN', 'DIRECTOR', 'PRINCIPAL', 'TEACHER', 'LIBRARIAN', 'RECEPTIONIST', 'ACCOUNTANT', 'SCHOOL_ADMIN', 'STUDENT', 'FATHER', 'MOTHER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new"[] USING ("role"::text::"public"."Role_new"[]);
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT ARRAY[]::"public"."Role"[];
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Parent" DROP CONSTRAINT "Parent_userId_fkey";

-- DropIndex
DROP INDEX "public"."Parent_userId_key";

-- AlterTable
ALTER TABLE "public"."Parent" DROP COLUMN "userId",
ADD COLUMN     "fatherUserId" TEXT NOT NULL,
ADD COLUMN     "motherUserId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'FATHER';

-- CreateIndex
CREATE UNIQUE INDEX "Parent_fatherUserId_key" ON "public"."Parent"("fatherUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_motherUserId_key" ON "public"."Parent"("motherUserId");

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_fatherUserId_fkey" FOREIGN KEY ("fatherUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_motherUserId_fkey" FOREIGN KEY ("motherUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
