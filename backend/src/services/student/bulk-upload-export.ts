import ExcelJS from "exceljs";
import type { BulkUploadRow } from "../../../generated/prisma/index.js";

/** Canonical import columns (same order as the sample / UI headers). */
export const BULK_UPLOAD_SHEET_FIELDS = [
  "rollNo",
  "name",
  "admissionNo",
  "gender",
  "dob",
  "aadhaar",
  "birthCertificateUrl",
  "abcId",
  "sssmId",
  "familySssmId",
  "minority",
  "scStObc",
  "bpl",
  "scStObcCertificateUrl",
  "bplCertificateUrl",
  "specialChild",
  "allergies",
  "studentEmail",
  "studentMobile",
  "citizenship",
  "visaNo",
  "visaType",
  "visaValidity",
  "previousSchoolName",
  "previousClassPassed",
  "previousClassMarks",
  "previousClassYear",
  "previousBoard",
  "migrationCertificateUrl",
  "tcNo",
  "permanentAddress",
  "temporaryAddress",
  "fatherName",
  "fatherOccupation",
  "fatherEmail",
  "fatherMobile",
  "fatherAadhaar",
  "fatherIdUrl",
  "fatherPan",
  "fatherPassport",
  "fatherCitizenship",
  "fatherVisaNo",
  "fatherVisaType",
  "fatherVisaValidity",
  "motherName",
  "motherOccupation",
  "motherEmail",
  "motherMobile",
  "motherAadhaar",
  "motherIdUrl",
  "motherPan",
  "motherPassport",
  "motherCitizenship",
  "motherVisaNo",
  "motherVisaType",
  "motherVisaValidity",
  "result",
  "resultStatus",
] as const;

const asRawRecord = (rawData: unknown): Record<string, unknown> | null => {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) return null;
  return rawData as Record<string, unknown>;
};

/**
 * Column order: canonical sheet headers, then any extra keys from the uploaded
 * row (excluding errorMessage — we append that once at the end).
 */
const collectFieldKeys = (rows: BulkUploadRow[]): string[] => {
  const ordered: string[] = [...BULK_UPLOAD_SHEET_FIELDS];
  const seen = new Set<string>(ordered);

  for (const row of rows) {
    const raw = asRawRecord(row.rawData);
    if (!raw) continue;
    for (const key of Object.keys(raw)) {
      if (key === "errorMessage" || seen.has(key)) continue;
      seen.add(key);
      ordered.push(key);
    }
  }

  return ordered;
};

const cellDisplayValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

/**
 * Failed-rows workbook for re-upload:
 * - Each failed student's original uploaded row, copied as-is
 * - Trailing `errorMessage` column with the failure reason
 * - No red fills, notes, or other styling
 */
export const buildFailedBulkUploadWorkbook = async (
  rows: BulkUploadRow[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Failed");
  const fieldKeys = collectFieldKeys(rows);
  const headers = [...fieldKeys, "errorMessage"];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };

  for (const row of rows) {
    const raw = asRawRecord(row.rawData) ?? {};
    sheet.addRow([
      ...fieldKeys.map((key) => cellDisplayValue(raw[key])),
      row.errorMessage ?? "",
    ]);
  }

  sheet.columns.forEach((column) => {
    let max = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > max) max = Math.min(len + 2, 48);
    });
    column.width = max;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
