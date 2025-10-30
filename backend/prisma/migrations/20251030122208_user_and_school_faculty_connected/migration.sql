/*
  Warnings:

  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherAttendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SchoolFacultyRole" AS ENUM ('TEACHER', 'LIBRARIAN', 'RECEPTIONIST', 'ACCOUNTANT', 'SCHOOL_ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Lecture" DROP CONSTRAINT "Lecture_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_markedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_schoolDayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_teacherId_fkey";

-- DropTable
DROP TABLE "public"."Teacher";

-- DropTable
DROP TABLE "public"."TeacherAttendance";

-- CreateTable
CREATE TABLE "public"."SchoolFaculty" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL DEFAULT '1d04d74e-2e18-4d9e-a1c2-6c65e9d65d42',
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolFacultyAttendance" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolDayId" TEXT NOT NULL,
    "lectureId" TEXT,
    "type" "public"."AttendanceType" NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "reason" TEXT,
    "markedById" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolFacultyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFaculty_userid_key" ON "public"."SchoolFaculty"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFacultyAttendance_markedById_key" ON "public"."SchoolFacultyAttendance"("markedById");

-- AddForeignKey
ALTER TABLE "public"."SchoolFaculty" ADD CONSTRAINT "SchoolFaculty_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFaculty" ADD CONSTRAINT "SchoolFaculty_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFacultyAttendance" ADD CONSTRAINT "SchoolFacultyAttendance_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFacultyAttendance" ADD CONSTRAINT "SchoolFacultyAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFacultyAttendance" ADD CONSTRAINT "SchoolFacultyAttendance_schoolDayId_fkey" FOREIGN KEY ("schoolDayId") REFERENCES "public"."SchoolDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFacultyAttendance" ADD CONSTRAINT "SchoolFacultyAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."SchoolFaculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."SchoolFaculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
