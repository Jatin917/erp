-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
