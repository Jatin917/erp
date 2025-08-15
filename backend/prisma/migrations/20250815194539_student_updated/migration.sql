/*
  Warnings:

  - You are about to drop the column `balanceRemaining` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `totalPaid` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayable` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_schoolId_fkey";

-- AlterTable
ALTER TABLE "public"."FeeDoc" ALTER COLUMN "transportFee" DROP NOT NULL,
ALTER COLUMN "hostelFee" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "balanceRemaining",
DROP COLUMN "classId",
DROP COLUMN "schoolId",
DROP COLUMN "sessionId",
DROP COLUMN "studentId",
DROP COLUMN "totalPaid",
DROP COLUMN "totalPayable",
ADD COLUMN     "aadhaar" TEXT,
ADD COLUMN     "abcId" TEXT,
ADD COLUMN     "admissionNo" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "barcodeUrl" TEXT,
ADD COLUMN     "birthCertificateUrl" TEXT,
ADD COLUMN     "bpl" TEXT,
ADD COLUMN     "bplCertificateUrl" TEXT,
ADD COLUMN     "citizenship" TEXT,
ADD COLUMN     "currentYearTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentYearTotalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentYearTotalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "familySssmId" TEXT,
ADD COLUMN     "fatherAadhaar" TEXT,
ADD COLUMN     "fatherCitizenship" TEXT,
ADD COLUMN     "fatherEmail" TEXT,
ADD COLUMN     "fatherIdUrl" TEXT,
ADD COLUMN     "fatherMobile" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "fatherPan" TEXT,
ADD COLUMN     "fatherPassport" TEXT,
ADD COLUMN     "fatherVisaNo" TEXT,
ADD COLUMN     "fatherVisaType" TEXT,
ADD COLUMN     "fatherVisaValidity" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastYearTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastYearTotalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastYearTotalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lateFine" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "migrationCertificateUrl" TEXT,
ADD COLUMN     "minority" TEXT,
ADD COLUMN     "motherAadhaar" TEXT,
ADD COLUMN     "motherCitizenship" TEXT,
ADD COLUMN     "motherEmail" TEXT,
ADD COLUMN     "motherIdUrl" TEXT,
ADD COLUMN     "motherMobile" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "motherPan" TEXT,
ADD COLUMN     "motherPassport" TEXT,
ADD COLUMN     "motherVisaNo" TEXT,
ADD COLUMN     "motherVisaType" TEXT,
ADD COLUMN     "motherVisaValidity" TIMESTAMP(3),
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "previousBoard" TEXT,
ADD COLUMN     "previousClassMarks" TEXT,
ADD COLUMN     "previousClassPassed" TEXT,
ADD COLUMN     "previousClassYear" TEXT,
ADD COLUMN     "previousSchoolName" TEXT,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "result" JSONB,
ADD COLUMN     "resultStatus" TEXT,
ADD COLUMN     "scStObc" TEXT,
ADD COLUMN     "scStObcCertificateUrl" TEXT,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "specialChild" BOOLEAN DEFAULT false,
ADD COLUMN     "sssmId" TEXT,
ADD COLUMN     "studentEmail" TEXT,
ADD COLUMN     "studentMobile" TEXT,
ADD COLUMN     "tcNo" TEXT,
ADD COLUMN     "temporaryAddress" TEXT,
ADD COLUMN     "visaNo" TEXT,
ADD COLUMN     "visaType" TEXT,
ADD COLUMN     "visaValidity" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
