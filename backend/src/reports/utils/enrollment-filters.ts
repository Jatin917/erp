import type { Prisma } from "../../../generated/prisma/index.js";
import type { ReportFilters } from "../types/report.types.js";

export const buildEnrollmentWhere = (
  branchId: string,
  sessionId: string,
  filters: ReportFilters
): Prisma.EnrollmentWhereInput => {
  const where: Prisma.EnrollmentWhereInput = {
    sessionId,
    student: { branchId },
  };

  const className = filters.class ?? filters.className;
  const section = filters.section ?? filters.sectionName;
  const rollNo = filters.rollNo;

  if (className || section) {
    where.class = {};
    if (className) {
      where.class.classLabel = {
        name: String(className),
      };
    }
    if (section) {
      where.class.section = {
        id: String(section),
      };
    }
  }

  if (rollNo) {
    where.rollNo = {
      contains: String(rollNo),
      mode: "insensitive",
    };
  }
  return where;
};
