-- CreateEnum
CREATE TYPE "BulkUploadJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "BulkUploadRowStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "BulkUploadJob" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "classLabelId" TEXT,
    "className" TEXT NOT NULL,
    "sectionId" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" "BulkUploadJobStatus" NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "BulkUploadJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkUploadRow" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "studentName" TEXT,
    "admissionNo" TEXT,
    "status" "BulkUploadRowStatus" NOT NULL DEFAULT 'PENDING',
    "studentId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUploadRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkUploadJob_branchId_createdAt_idx" ON "BulkUploadJob"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "BulkUploadRow_jobId_status_idx" ON "BulkUploadRow"("jobId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BulkUploadRow_jobId_rowNumber_key" ON "BulkUploadRow"("jobId", "rowNumber");

-- AddForeignKey
ALTER TABLE "BulkUploadJob" ADD CONSTRAINT "BulkUploadJob_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkUploadJob" ADD CONSTRAINT "BulkUploadJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkUploadRow" ADD CONSTRAINT "BulkUploadRow_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BulkUploadJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
