-- CreateEnum
CREATE TYPE "public"."ClassEnum" AS ENUM ('NURSERY', 'LKG', 'UKG', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH');

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "class" "public"."ClassEnum";
