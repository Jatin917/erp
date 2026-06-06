export const buildEnrollmentWhere = (branchId, sessionId, filters) => {
    const where = {
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
//# sourceMappingURL=enrollment-filters.js.map