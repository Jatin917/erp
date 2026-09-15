-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('CUSTOM', 'REPORT', 'CERTIFICATE', 'TRANSFER_CERTIFICATE');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'CONFIGURED', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FieldAlignment" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- AlterEnum
ALTER TYPE "SourceModule" ADD VALUE 'CLASS';

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "type" "DocumentTemplateType" NOT NULL DEFAULT 'CUSTOM',
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "branchId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplateFieldMapping" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "systemFieldId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT,
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "xCoordinate" DOUBLE PRECISION NOT NULL,
    "yCoordinate" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "fontSize" DOUBLE PRECISION,
    "alignment" "FieldAlignment" NOT NULL DEFAULT 'LEFT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplateFieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportTemplateFieldMapping_templateId_idx" ON "ReportTemplateFieldMapping"("templateId");

-- RenameForeignKey
ALTER TABLE "SchoolFaculty" RENAME CONSTRAINT "SchoolFaculty_userid_fkey" TO "SchoolFaculty_userId_fkey";

-- AddForeignKey
ALTER TABLE "ReportTemplateFieldMapping" ADD CONSTRAINT "ReportTemplateFieldMapping_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
