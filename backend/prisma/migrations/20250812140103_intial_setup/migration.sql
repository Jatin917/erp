-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPERADMIN', 'DIRECTOR', 'PRINCIPAL', 'TEACHER', 'LIBRARIAN', 'RECEPTIONIST', 'ACCOUNTANT', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT');

-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('CASH', 'UPI', 'ONLINE', 'BANK_TRANSFER', 'CHEQUE', 'CARD');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'LOCKED');

-- CreateEnum
CREATE TYPE "public"."LeaveType" AS ENUM ('CASUAL', 'SICK', 'DUTY', 'MATERNITY', 'PATERNITY', 'UNPAID');

-- CreateEnum
CREATE TYPE "public"."FeeHeadType" AS ENUM ('ADMISSION', 'TUITION', 'HOSTEL', 'TRANSPORT', 'LAB', 'EXAM', 'SPORTS', 'LIBRARY', 'ACTIVITY');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "role" "public"."Role"[] DEFAULT ARRAY[]::"public"."Role"[],
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPhoneVerified" BOOLEAN NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "principalId" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classId" TEXT,
    "sessionId" TEXT,
    "rollNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalPayable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceRemaining" DOUBLE PRECISION NOT NULL,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassTeacher" (
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "ClassTeacher_pkey" PRIMARY KEY ("classId","teacherId")
);

-- CreateTable
CREATE TABLE "public"."FeeDoc" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "admissionFee" DOUBLE PRECISION NOT NULL,
    "tuitionFee" DOUBLE PRECISION NOT NULL,
    "transportFee" DOUBLE PRECISION NOT NULL,
    "hostelFee" DOUBLE PRECISION NOT NULL,
    "concessions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayable" DOUBLE PRECISION NOT NULL,
    "paidInSession" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueInSession" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeTransaction" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "mode" "public"."PaymentMode" NOT NULL,
    "referenceId" TEXT,
    "appliedToDocIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT NOT NULL,

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "rollNo" TEXT,
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_principalId_key" ON "public"."Branch"("principalId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userId_key" ON "public"."Parent"("userId");

-- AddForeignKey
ALTER TABLE "public"."School" ADD CONSTRAINT "School_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassTeacher" ADD CONSTRAINT "ClassTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassTeacher" ADD CONSTRAINT "ClassTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDoc" ADD CONSTRAINT "FeeDoc_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDoc" ADD CONSTRAINT "FeeDoc_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTransaction" ADD CONSTRAINT "FeeTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeTransaction" ADD CONSTRAINT "FeeTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicSession" ADD CONSTRAINT "AcademicSession_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
