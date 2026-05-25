-- CreateEnum
CREATE TYPE "public"."FieldCategory" AS ENUM ('RAW', 'SUMMARY', 'COMPUTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."RegistryDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'DATETIME', 'JSON', 'ENUM', 'RELATION_ID', 'MONEY', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."FieldResolverType" AS ENUM ('COLUMN', 'RELATION', 'AGGREGATE', 'EXPRESSION', 'CUSTOM_FIELD', 'STATIC');

-- CreateEnum
CREATE TYPE "public"."SourceModule" AS ENUM ('STUDENT', 'ENROLLMENT', 'ATTENDANCE', 'FEE', 'PARENT', 'EXAM', 'TRANSPORT', 'ACADEMIC', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."FieldRegistry" (
    "id" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sourceModule" "public"."SourceModule" NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "sourceColumn" TEXT,
    "fieldCategory" "public"."FieldCategory" NOT NULL DEFAULT 'RAW',
    "dataType" "public"."RegistryDataType" NOT NULL,
    "enumName" TEXT,
    "resolverType" "public"."FieldResolverType" NOT NULL DEFAULT 'COLUMN',
    "resolverConfig" JSONB,
    "isFilterable" BOOLEAN NOT NULL DEFAULT true,
    "isSortable" BOOLEAN NOT NULL DEFAULT true,
    "isExportable" BOOLEAN NOT NULL DEFAULT true,
    "isVisibleInPicker" BOOLEAN NOT NULL DEFAULT true,
    "isSystemField" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deprecatedAt" TIMESTAMP(3),
    "branchId" TEXT,
    "schoolId" TEXT,
    "groupKey" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "requiredPermission" "public"."Permission",
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "seededFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FieldRegistry_fieldKey_key" ON "public"."FieldRegistry"("fieldKey");

-- CreateIndex
CREATE INDEX "FieldRegistry_sourceModule_isActive_idx" ON "public"."FieldRegistry"("sourceModule", "isActive");

-- CreateIndex
CREATE INDEX "FieldRegistry_branchId_isCustom_idx" ON "public"."FieldRegistry"("branchId", "isCustom");

-- CreateIndex
CREATE INDEX "FieldRegistry_groupKey_idx" ON "public"."FieldRegistry"("groupKey");
