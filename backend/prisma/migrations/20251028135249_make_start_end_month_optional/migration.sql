/*
  Warnings:

  - Added the required column `schoolDayId` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startTime` on the `Lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `Lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."LectureStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'BLOCKED', 'REOPENED_BY_ADMIN', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."AcademicSession" DROP CONSTRAINT "AcademicSession_endMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AcademicSession" DROP CONSTRAINT "AcademicSession_startMonthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lecture" DROP CONSTRAINT "Lecture_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."AcademicSession" ALTER COLUMN "endMonthId" DROP NOT NULL,
ALTER COLUMN "startMonthId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Lecture" ADD COLUMN     "schoolDayId" TEXT NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherAttendance" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolDayId" TEXT NOT NULL,
    "lectureId" TEXT,
    "type" "public"."AttendanceType" NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "reason" TEXT,
    "markedById" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceAuditLog" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendance_markedById_key" ON "public"."TeacherAttendance"("markedById");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceAuditLog_lectureId_key" ON "public"."AttendanceAuditLog"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceAuditLog_performedById_key" ON "public"."AttendanceAuditLog"("performedById");

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_startMonthId_fkey" FOREIGN KEY ("startMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_endMonthId_fkey" FOREIGN KEY ("endMonthId") REFERENCES "public"."AcademicMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_schoolDayId_fkey" FOREIGN KEY ("schoolDayId") REFERENCES "public"."SchoolDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_schoolDayId_fkey" FOREIGN KEY ("schoolDayId") REFERENCES "public"."SchoolDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceAuditLog" ADD CONSTRAINT "AttendanceAuditLog_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceAuditLog" ADD CONSTRAINT "AttendanceAuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
