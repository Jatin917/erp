import path, { dirname } from "path";
import fs from "fs";
import QRCode from "qrcode";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import type { Prisma } from "@prisma/client/extension";
import {
  BulkUploadJobStatus,
  BulkUploadRowStatus,
  type Student,
} from "../../../generated/prisma/index.js";
import { prisma } from "@src/server.js";
import { findOrCreateUser } from "@src/services/user/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getStudentDir(sid: string, bid: string, admissionNo: string | null) {
  return path.join(
    __dirname,
    "..",
    "..",
    "..",
    "uploads",
    String(sid),
    String(bid),
    String(admissionNo),
  );
}

async function generateBarcode(student: Student & { branch: { schoolId: string }; enrollments: { id: string; sessionId: string }[] }) {
  const lastEnrollment = student.enrollments.at(-1);
  const sessionId = lastEnrollment ? lastEnrollment.sessionId : "";
  const qrText = `${student.id}|${student.branchId}|${student.name}||${
    lastEnrollment?.id || ""
  }|${sessionId}`;

  const qrDir = getStudentDir(
    student.branch.schoolId,
    student.branchId,
    student.admissionNo,
  );
  fs.mkdirSync(qrDir, { recursive: true });
  const qrPath = path.join(qrDir, `${student.id}-barcode.png`);
  try {
    const buffer = await QRCode.toBuffer(qrText, { width: 350 });
    fs.writeFileSync(qrPath, buffer);
  } catch (err) {
    console.error("Failed to generate QR code:", err);
  }

  return path.join(
    "uploads",
    student.branch.schoolId,
    student.branchId,
    String(student.admissionNo),
    `${student.id}-barcode.png`,
  );
}

async function createEnrollment(
  tx: Prisma.TransactionClient,
  classNameId: string,
  branchId: string,
  studentId: string,
  sectionId: string | null,
  rollNo: string | null,
) {
  let cls = await tx.class.findFirst({
    where: {
      classLabelId: classNameId,
      sectionId: sectionId ?? undefined,
      branchId,
    },
  });

  if (!cls) {
    cls = await tx.class.create({
      data: { classLabelId: classNameId, sectionId, branchId },
    });
  }

  const branch = await tx.branch.findUnique({
    where: { id: branchId },
    include: { academicSession: true },
  });
  if (!branch) throw Error("Branch does not exist");

  const currentSession = branch.academicSession.find(
    (s: { isCurrent: boolean }) => s.isCurrent === true,
  );
  if (!currentSession) throw Error("No current session for branch");

  return tx.enrollment.create({
    data: {
      student: { connect: { id: studentId } },
      class: { connect: { id: cls.id } },
      session: { connect: { id: currentSession.id } },
      rollNo,
    },
  });
}

async function findOrCreateParentRecord(
  tx: Prisma.TransactionClient,
  type: "FATHER" | "MOTHER",
  userId: string,
) {
  const existing = await tx.parent.findFirst({ where: { userId, type } });
  if (existing) return existing;
  return tx.parent.create({ data: { type, userId } });
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const asNumber =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())
        ? Number(value.trim())
        : null;

  if (asNumber !== null && Number.isFinite(asNumber) && asNumber > 20000 && asNumber < 80000) {
    const parsed = XLSX.SSF.parse_date_code(asNumber);
    if (parsed) {
      return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    }
  }

  const date = new Date(String(value).trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function parseOptionalBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "1", "y"].includes(normalized);
}

async function createStudentFromBulkRow(params: {
  row: Record<string, unknown>;
  branchId: string;
  classLabelId: string;
  defaultSectionId: string | null;
}) {
  const { row, branchId, classLabelId, defaultSectionId } = params;
  const { rollNo, dob, ...raw } = row;
  const data = {
    name: toNullableString(raw.name),
    studentId: toNullableString(raw.studentId),
    admissionNo: toNullableString(raw.admissionNo),
    gender: toNullableString(raw.gender),
    aadhaar: toNullableString(raw.aadhaar),
    birthCertificateUrl: toNullableString(raw.birthCertificateUrl),
    abcId: toNullableString(raw.abcId),
    sssmId: toNullableString(raw.sssmId),
    familySssmId: toNullableString(raw.familySssmId),
    minority: toNullableString(raw.minority),
    scStObc: toNullableString(raw.scStObc),
    bpl: toNullableString(raw.bpl),
    scStObcCertificateUrl: toNullableString(raw.scStObcCertificateUrl),
    bplCertificateUrl: toNullableString(raw.bplCertificateUrl),
    specialChild: parseOptionalBool(raw.specialChild),
    allergies: toNullableString(raw.allergies),
    studentEmail: toNullableString(raw.studentEmail ?? raw.email),
    studentMobile: toNullableString(raw.studentMobile ?? raw.mobile ?? raw.phone),
    citizenship: toNullableString(raw.citizenship),
    visaNo: toNullableString(raw.visaNo),
    visaType: toNullableString(raw.visaType),
    visaValidity: parseOptionalDate(raw.visaValidity),
    fatherName: toNullableString(raw.fatherName),
    fatherOccupation: toNullableString(raw.fatherOccupation),
    fatherEmail: toNullableString(raw.fatherEmail),
    fatherMobile: toNullableString(raw.fatherMobile),
    fatherAadhaar: toNullableString(raw.fatherAadhaar),
    fatherIdUrl: toNullableString(raw.fatherIdUrl),
    fatherPan: toNullableString(raw.fatherPan),
    fatherPassport: toNullableString(raw.fatherPassport),
    fatherCitizenship: toNullableString(raw.fatherCitizenship),
    fatherVisaNo: toNullableString(raw.fatherVisaNo),
    fatherVisaType: toNullableString(raw.fatherVisaType),
    fatherVisaValidity: parseOptionalDate(raw.fatherVisaValidity),
    motherName: toNullableString(raw.motherName),
    motherOccupation: toNullableString(raw.motherOccupation),
    motherEmail: toNullableString(raw.motherEmail),
    motherMobile: toNullableString(raw.motherMobile),
    motherAadhaar: toNullableString(raw.motherAadhaar),
    motherIdUrl: toNullableString(raw.motherIdUrl),
    motherPan: toNullableString(raw.motherPan),
    motherPassport: toNullableString(raw.motherPassport),
    motherCitizenship: toNullableString(raw.motherCitizenship),
    motherVisaNo: toNullableString(raw.motherVisaNo),
    motherVisaType: toNullableString(raw.motherVisaType),
    motherVisaValidity: parseOptionalDate(raw.motherVisaValidity),
    previousSchoolName: toNullableString(raw.previousSchoolName),
    previousClassPassed: toNullableString(raw.previousClassPassed),
    previousClassMarks: toNullableString(raw.previousClassMarks),
    previousClassYear: toNullableString(raw.previousClassYear),
    previousBoard: toNullableString(raw.previousBoard),
    migrationCertificateUrl: toNullableString(raw.migrationCertificateUrl),
    tcNo: toNullableString(raw.tcNo),
    permanentAddress: toNullableString(raw.permanentAddress),
    temporaryAddress: toNullableString(raw.temporaryAddress),
    result: toNullableString(raw.result),
    resultStatus: toNullableString(raw.resultStatus),
    sectionId: toNullableString(raw.sectionId) ?? defaultSectionId,
  };
  const parsedDob = parseOptionalDate(dob);
  const parsedRollNo = toNullableString(rollNo);

  if (!data.name) throw new Error("Student name is required");
  if (!data.fatherName || !data.fatherMobile) throw new Error("Father details required");
  if (!data.motherName || !data.motherMobile) throw new Error("Mother details required");

  const student = await prisma.$transaction(async (tx) => {
    const studentUser = await findOrCreateUser({
      tx,
      role: "STUDENT",
      name: data.name!,
      email: data.studentEmail as any,
      phone: data.studentMobile as any,
    });

    const fatherUser = await findOrCreateUser({
      tx,
      role: "FATHER",
      name: data.fatherName!,
      email: data.fatherEmail as any,
      phone: data.fatherMobile as any,
    });
    const fatherParent = fatherUser
      ? await findOrCreateParentRecord(tx, "FATHER", fatherUser.id)
      : null;

    const motherUser = await findOrCreateUser({
      tx,
      role: "MOTHER",
      name: data.motherName!,
      email: data.motherEmail as any,
      phone: data.motherMobile as any,
    });
    const motherParent = motherUser
      ? await findOrCreateParentRecord(tx, "MOTHER", motherUser.id)
      : null;

    const created = await tx.student.create({
      data: {
        ...(studentUser ? { user: { connect: { id: String(studentUser.id) } } } : {}),
        ...(fatherParent ? { father: { connect: { id: String(fatherParent.id) } } } : {}),
        ...(motherParent ? { mother: { connect: { id: String(motherParent.id) } } } : {}),
        branch: { connect: { id: branchId } },
        name: data.name!,
        studentId: data.studentId,
        admissionNo: data.admissionNo,
        gender: data.gender,
        dob: parsedDob,
        aadhaar: data.aadhaar,
        birthCertificateUrl: data.birthCertificateUrl,
        abcId: data.abcId,
        sssmId: data.sssmId,
        familySssmId: data.familySssmId,
        minority: data.minority,
        scStObc: data.scStObc,
        bpl: data.bpl,
        scStObcCertificateUrl: data.scStObcCertificateUrl,
        bplCertificateUrl: data.bplCertificateUrl,
        specialChild: data.specialChild,
        allergies: data.allergies,
        studentEmail: data.studentEmail,
        studentMobile: data.studentMobile,
        citizenship: data.citizenship,
        visaNo: data.visaNo,
        visaType: data.visaType,
        visaValidity: data.visaValidity,
        fatherName: data.fatherName,
        fatherOccupation: data.fatherOccupation,
        fatherEmail: data.fatherEmail,
        fatherMobile: data.fatherMobile,
        fatherAadhaar: data.fatherAadhaar,
        fatherIdUrl: data.fatherIdUrl,
        fatherPan: data.fatherPan,
        fatherPassport: data.fatherPassport,
        fatherCitizenship: data.fatherCitizenship,
        fatherVisaNo: data.fatherVisaNo,
        fatherVisaType: data.fatherVisaType,
        fatherVisaValidity: data.fatherVisaValidity,
        motherName: data.motherName,
        motherOccupation: data.motherOccupation,
        motherEmail: data.motherEmail,
        motherMobile: data.motherMobile,
        motherAadhaar: data.motherAadhaar,
        motherIdUrl: data.motherIdUrl,
        motherPan: data.motherPan,
        motherPassport: data.motherPassport,
        motherCitizenship: data.motherCitizenship,
        motherVisaNo: data.motherVisaNo,
        motherVisaType: data.motherVisaType,
        motherVisaValidity: data.motherVisaValidity,
        previousSchoolName: data.previousSchoolName,
        previousClassPassed: data.previousClassPassed,
        previousClassMarks: data.previousClassMarks,
        previousClassYear: data.previousClassYear,
        previousBoard: data.previousBoard,
        migrationCertificateUrl: data.migrationCertificateUrl,
        tcNo: data.tcNo,
        permanentAddress: data.permanentAddress,
        temporaryAddress: data.temporaryAddress,
        result: data.result as any,
        resultStatus: data.resultStatus,
      },
      include: {
        user: true,
        enrollments: true,
        branch: true,
      },
    });

    await createEnrollment(
      tx,
      classLabelId,
      branchId,
      created.id,
      data.sectionId,
      parsedRollNo,
    );

    return created;
  });

  let barcodeWarning: string | undefined;
  try {
    const withEnrollments = await prisma.student.findUnique({
      where: { id: student.id },
      include: { branch: true, enrollments: true },
    });
    if (withEnrollments) {
      const barcodeUrl = await generateBarcode(withEnrollments as any);
      await prisma.student.update({
        where: { id: student.id },
        data: { barcodeUrl },
      });
    }
  } catch (barcodeErr: any) {
    barcodeWarning = `Created but barcode failed: ${barcodeErr.message}`;
  }

  return {
    studentId: student.id,
    studentName: data.name!,
    admissionNo: data.admissionNo,
    barcodeWarning,
  };
}

export const createBulkUploadJob = async (data: {
  branchId: string;
  classLabelId: string;
  className: string;
  sectionId: string | null;
  fileName: string;
  filePath: string;
  createdById: string;
}) => {
  return prisma.bulkUploadJob.create({
    data: {
      branchId: data.branchId,
      classLabelId: data.classLabelId,
      className: data.className,
      sectionId: data.sectionId,
      fileName: data.fileName,
      filePath: data.filePath,
      createdById: data.createdById,
      status: BulkUploadJobStatus.PENDING,
    },
  });
};

export const getBulkUploadJobs = async (branchId: string) => {
  return prisma.bulkUploadJob.findMany({
    where: { branchId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      branchId: true,
      className: true,
      sectionId: true,
      fileName: true,
      status: true,
      totalRows: true,
      successCount: true,
      failCount: true,
      errorMessage: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getBulkUploadJobById = async (id: string) => {
  return prisma.bulkUploadJob.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getBulkUploadRows = async (
  jobId: string,
  status?: BulkUploadRowStatus,
) => {
  return prisma.bulkUploadRow.findMany({
    where: {
      jobId,
      ...(status ? { status } : {}),
    },
    orderBy: { rowNumber: "asc" },
  });
};

export const markBulkUploadJobFailed = async (jobId: string, errorMessage: string) => {
  return prisma.bulkUploadJob.update({
    where: { id: jobId },
    data: {
      status: BulkUploadJobStatus.FAILED,
      errorMessage,
      finishedAt: new Date(),
    },
  });
};

/**
 * Processes a persisted bulk-upload job: reads the sheet, creates students, writes row results.
 */
export const processBulkUploadJob = async (jobId: string) => {
  const job = await prisma.bulkUploadJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error(`Bulk upload job ${jobId} not found`);
  }

  if (
    job.status !== BulkUploadJobStatus.PENDING &&
    job.status !== BulkUploadJobStatus.RUNNING
  ) {
    console.log(`Skipping bulk upload job ${jobId}; status=${job.status}`);
    return job;
  }

  await prisma.bulkUploadJob.update({
    where: { id: jobId },
    data: { status: BulkUploadJobStatus.RUNNING, startedAt: job.startedAt ?? new Date() },
  });

  const filePath = job.filePath;
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Uploaded file no longer exists on server");
    }

    const classLabelId =
      job.classLabelId ||
      (
        await prisma.classLabel.findFirst({
          where: { branchId: job.branchId, name: job.className },
        })
      )?.id;

    if (!classLabelId) {
      throw new Error("ClassName don't exist");
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName || !workbook.Sheets[sheetName]) {
      throw new Error("Spreadsheet has no sheets");
    }
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: false,
      defval: null,
    }) as Record<string, unknown>[];

    await prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: { totalRows: sheetData.length },
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row) continue;
      const rowNumber = i + 2;
      const studentName = toNullableString(row.name);
      const admissionNo = toNullableString(row.admissionNo);

      const rowRecord = await prisma.bulkUploadRow.upsert({
        where: { jobId_rowNumber: { jobId, rowNumber } },
        create: {
          jobId,
          rowNumber,
          studentName,
          admissionNo,
          status: BulkUploadRowStatus.PENDING,
        },
        update: {
          studentName,
          admissionNo,
          status: BulkUploadRowStatus.PENDING,
          errorMessage: null,
          studentId: null,
        },
      });

      if (rowRecord.status === BulkUploadRowStatus.SUCCESS && rowRecord.studentId) {
        successCount += 1;
        continue;
      }

      try {
        const result = await createStudentFromBulkRow({
          row,
          branchId: job.branchId,
          classLabelId,
          defaultSectionId: job.sectionId,
        });

        await prisma.bulkUploadRow.update({
          where: { id: rowRecord.id },
          data: {
            status: BulkUploadRowStatus.SUCCESS,
            studentId: result.studentId,
            studentName: result.studentName,
            admissionNo: result.admissionNo,
            errorMessage: result.barcodeWarning ?? null,
          },
        });
        successCount += 1;
      } catch (err: any) {
        await prisma.bulkUploadRow.update({
          where: { id: rowRecord.id },
          data: {
            status: BulkUploadRowStatus.FAILED,
            errorMessage: err.message ?? "Unknown error",
          },
        });
        failCount += 1;
      }

      if ((i + 1) % 10 === 0 || i === sheetData.length - 1) {
        await prisma.bulkUploadJob.update({
          where: { id: jobId },
          data: { successCount, failCount },
        });
      }
    }

    const finalStatus =
      failCount === 0
        ? BulkUploadJobStatus.SUCCEEDED
        : successCount === 0
          ? BulkUploadJobStatus.FAILED
          : BulkUploadJobStatus.PARTIAL;

    return prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        successCount,
        failCount,
        finishedAt: new Date(),
        errorMessage: null,
      },
    });
  } catch (error: any) {
    await markBulkUploadJobFailed(jobId, error.message ?? "Bulk upload failed");
    throw error;
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* ignore cleanup errors */
      }
    }
  }
};
