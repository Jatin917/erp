import { prisma } from "@src/server.js";
import { AttendanceMethod, AttendanceStatus, AttendanceType, LectureStatus, Weekday, } from "../../../../generated/prisma/index.js";
import { sendSuccess, sendError } from "@src/lib/utils.js";
import { HTTP_STATUS } from "@src/lib/http-codes.js";
/* ============================================================
   SCHOOL DAYS
============================================================ */
export const getSchoolDays = async (req, res) => {
    try {
        const { sessionId } = req.query;
        // console.log("session id");
        const days = await prisma.schoolDay.findMany({
            where: { sessionId: sessionId },
            orderBy: { date: "asc" },
        });
        sendSuccess(res, "School days fetched successfully", days, HTTP_STATUS.OK);
    }
    catch (err) {
        sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
// /* ============================================================
//    GENERATE LECTURES
// ============================================================ */
/**
 * Helper function to convert time string (HH:MM) to minutes for comparison
 */
function timeToMinutes(t) {
    const parts = t.split(":");
    if (parts.length !== 2) {
        throw new Error(`Invalid time format: ${t}. Expected HH:MM`);
    }
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        throw new Error(`Invalid time format: ${t}. Expected HH:MM`);
    }
    return h * 60 + m;
}
/**
 * Check if two time slots overlap
 * @param start1 Start time of first slot (HH:MM format)
 * @param end1 End time of first slot (HH:MM format)
 * @param start2 Start time of second slot (HH:MM format)
 * @param end2 End time of second slot (HH:MM format)
 * @returns true if slots overlap, false otherwise
 */
function doTimeSlotsOverlap(start1, end1, start2, end2) {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    // Disallow:
    //  - if start2 < end1  (means new starts before previous ends)
    //  - and start2 != end1 (we allow exactly touching boundaries)
    return !(e1 <= s2 || e2 <= s1);
}
export const upsertLectureFromDate = async (req, res) => {
    try {
        const { classId, branchId, weekDay, lecture, // { subjectId, teacherId, startTime, endTime }
        applyDate, } = req.body;
        if (!classId || !branchId || !weekDay || !lecture || !applyDate) {
            return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
        }
        // 1️⃣ Find current session for branch
        const session = await prisma.academicSession.findFirst({
            where: { branchId, isCurrent: true },
            include: {
                months: true,
            },
        });
        if (!session) {
            return sendError(res, "Session not found", HTTP_STATUS.NOT_FOUND);
        }
        // 2️⃣ Get all WORKING days from applyDate → session end
        const schoolDays = await prisma.schoolDay.findMany({
            where: {
                sessionId: session.id,
                type: "WORKING",
                date: {
                    gte: new Date(applyDate),
                },
            },
            orderBy: { date: "asc" },
        });
        console.log("schoolDays date ", schoolDays[0]);
        if (!schoolDays.length) {
            return sendError(res, "No working days found after applyDate", HTTP_STATUS.NOT_FOUND);
        }
        let createdCount = 0;
        let updatedCount = 0;
        let cancelledCount = 0;
        await prisma.$transaction(async (tx) => {
            for (const day of schoolDays) {
                const dayOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][new Date(day.date).getDay()];
                // 🔹 3️⃣ Check for existing lecture in same class with same time (for update)
                const existingLecture = await tx.lecture.findFirst({
                    where: {
                        classId,
                        schoolDayId: day.id,
                        startTime: lecture.startTime,
                        endTime: lecture.endTime,
                    },
                });
                // 🔹 4️⃣ Check for overlapping time slot conflicts BEFORE creating/updating
                // Check for teacher conflicts (same teacher, overlapping time, same day)
                const teacherConflicts = await tx.lecture.findMany({
                    where: {
                        teacherId: lecture.teacherId,
                        schoolDayId: day.id,
                        status: LectureStatus.SCHEDULED,
                        ...(existingLecture ? { NOT: { id: existingLecture.id } } : {}), // Exclude the lecture being updated
                    },
                });
                // Check if any teacher conflict has overlapping time
                const teacherTimeConflict = teacherConflicts.find((conflict) => doTimeSlotsOverlap(conflict.startTime, conflict.endTime, lecture.startTime, lecture.endTime));
                if (teacherTimeConflict) {
                    throw new Error(`Teacher conflict: Teacher is already scheduled for an overlapping time slot (${teacherTimeConflict.startTime} - ${teacherTimeConflict.endTime}) on ${day.date.toISOString().split('T')[0]}`);
                }
                // Check for class conflicts (same class, overlapping time, same day, different lecture)
                const classConflicts = await tx.lecture.findMany({
                    where: {
                        classId,
                        schoolDayId: day.id,
                        status: LectureStatus.SCHEDULED,
                        ...(existingLecture ? { NOT: { id: existingLecture.id } } : {}), // Exclude the lecture being updated
                    },
                });
                // Check if any class conflict has overlapping time
                const classTimeConflict = classConflicts.find((conflict) => doTimeSlotsOverlap(conflict.startTime, conflict.endTime, lecture.startTime, lecture.endTime));
                if (classTimeConflict) {
                    throw new Error(`Class conflict: Class already has a scheduled lecture for an overlapping time slot (${classTimeConflict.startTime} - ${classTimeConflict.endTime}) on ${day.date.toISOString().split('T')[0]}`);
                }
                // 🔹 5️⃣ If no conflicts, proceed with upsert
                if (existingLecture) {
                    await tx.lecture.update({
                        where: { id: existingLecture.id },
                        data: {
                            subjectId: lecture.subjectId,
                            teacherId: lecture.teacherId,
                            status: LectureStatus.SCHEDULED,
                        },
                    });
                    updatedCount++;
                }
                else {
                    await tx.lecture.create({
                        data: {
                            classId,
                            subjectId: lecture.subjectId,
                            teacherId: lecture.teacherId,
                            startTime: lecture.startTime,
                            endTime: lecture.endTime,
                            schoolDayId: day.id,
                            dayOfWeek: weekDay,
                            status: LectureStatus.SCHEDULED,
                        },
                    });
                    createdCount++;
                }
            }
        });
        return sendSuccess(res, "Lecture(s) scheduled successfully", {
            createdCount,
            updatedCount,
            cancelledCount,
            totalAffected: createdCount + updatedCount + cancelledCount,
        }, HTTP_STATUS.OK);
    }
    catch (err) {
        // Check if it's a conflict error
        if (err.message.includes('conflict') || err.message.includes('Conflict')) {
            return sendError(res, err.message, HTTP_STATUS.CONFLICT);
        }
        return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const getTimeTable = async (req, res) => {
    try {
        const { classId, teacherId } = req.query;
        // Validate input
        if (!classId) {
            return sendError(res, "classId are required", HTTP_STATUS.BAD_REQUEST);
        }
        // Build dynamic filter
        const where = {
            classId: String(classId),
            dayOfWeek: {
                in: Object.values(Weekday),
            },
        };
        if (teacherId)
            where.teacherId = String(teacherId);
        // Fetch timetable (sorted by day & startTime)
        const lectures = await prisma.lecture.findMany({
            where,
            orderBy: [
                {
                    // Optional: ensure ordering Monday → Saturday
                    dayOfWeek: "asc",
                },
                {
                    startTime: "asc",
                },
            ],
            include: {
                class: {
                    include: {
                        classLabel: { select: { name: true, } },
                    },
                },
                teacher: {
                    select: { id: true, name: true },
                },
                subject: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!lectures.length) {
            return sendSuccess(res, "No lectures found", [], HTTP_STATUS.OK);
        }
        const seen = new Set();
        const formatLectures = lectures
            .filter(l => {
            const key = `${l.dayOfWeek}-${l.startTime}-${l.endTime}-${l.teacherId}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        })
            .map(l => ({
            day: l.dayOfWeek,
            classId: l.classId,
            class: l.class.classLabel.name,
            teacher: l.teacher.name,
            teacherId: l.teacherId,
            subject: l.subject.name,
            subjectId: l.subject.id,
            startTime: l.startTime,
            endTime: l.endTime,
        }));
        // Optional: group by day for frontend
        const groupedLectures = {};
        for (const lecture of formatLectures) {
            if (!groupedLectures[lecture.day]) {
                groupedLectures[lecture.day] = [];
            }
            // console.log("lecture ", lecture);
            groupedLectures[lecture.day]?.push(lecture);
        }
        return sendSuccess(res, "Lectures fetched successfully", {
            groupedByDay: groupedLectures,
        });
    }
    catch (error) {
        console.error("Error fetching lectures:", error);
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
// /* ============================================================
//    UPDATE LECTURE
// ============================================================ */
// export const updateLecture = async (req: Request, res: Response) => {
//   try {
//     const { lectureId } = req.params;
//     const { teacherId, startTime, endTime } = req.body;
//     const updated = await prisma.lecture.update({
//       where: { id: lectureId },
//       data: { teacherId, startTime, endTime },
//     });
//     sendSuccess(res, "Lecture updated successfully", updated, HTTP_STATUS.OK);
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// /* ============================================================
//    UPDATE LECTURE STATUS + AUDIT LOG
// ============================================================ */
// export const updateLectureStatus = async (req: Request, res: Response) => {
//   try {
//     const { lectureId } = req.params;
//     const { status, remarks } = req.body;
//     const userId = req.user?.id;
//     const lecture = await prisma.lecture.update({
//       where: { id: lectureId },
//       data: { status },
//     });
//     await prisma.attendanceAuditLog.create({
//       data: {
//         lectureId,
//         performedById: userId,
//         action: status,
//         remarks,
//       },
//     });
//     sendSuccess(res, "Lecture status updated", lecture, HTTP_STATUS.OK);
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// /* ============================================================
//    STUDENT ATTENDANCE
// ============================================================ */
// export const markAttendance = async (req: Request, res: Response) => {
//   try {
//     const { enrollmentId, schoolDayId, lectureId, status, method, type } =
//       req.body;
//     const userId = req.user?.id;
//     const attendance = await prisma.attendance.create({
//       data: {
//         enrollmentId,
//         schoolDayId,
//         lectureId,
//         status: status as AttendanceStatus,
//         method: method as AttendanceMethod,
//         type: type as AttendanceType,
//         markedById: userId,
//       },
//     });
//     sendSuccess(
//       res,
//       "Attendance marked successfully",
//       attendance,
//       HTTP_STATUS.CREATED
//     );
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// export const getAttendanceByDay = async (req: Request, res: Response) => {
//   try {
//     const { schoolDayId, classId } = req.query;
//     const records = await prisma.attendance.findMany({
//       where: {
//         schoolDayId: schoolDayId as string,
//         enrollment: { classId: classId as string },
//       },
//       include: {
//         enrollment: { include: { student: true } },
//         lecture: true,
//       },
//     });
//     sendSuccess(res, "Attendance records fetched", records, HTTP_STATUS.OK);
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// /* ============================================================
//    TEACHER ATTENDANCE
// ============================================================ */
// export const markTeacherAttendance = async (req: Request, res: Response) => {
//   try {
//     const { teacherId, schoolDayId, lectureId, status, reason, type } =
//       req.body;
//     const userId = req.user?.id;
//     const attendance = await prisma.teacherAttendance.create({
//       data: {
//         teacherId,
//         schoolDayId,
//         lectureId,
//         status: status as AttendanceStatus,
//         reason,
//         type: type as AttendanceType,
//         markedById: userId,
//       },
//     });
//     sendSuccess(
//       res,
//       "Teacher attendance marked successfully",
//       attendance,
//       HTTP_STATUS.CREATED
//     );
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// export const getTeacherAttendance = async (req: Request, res: Response) => {
//   try {
//     const { schoolDayId } = req.query;
//     const records = await prisma.teacherAttendance.findMany({
//       where: { schoolDayId: schoolDayId as string },
//       include: { teacher: true, lecture: true },
//     });
//     sendSuccess(res, "Teacher attendance fetched", records, HTTP_STATUS.OK);
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
// /* ============================================================
//    AUDIT LOGS
// ============================================================ */
// export const getAuditLogs = async (req: Request, res: Response) => {
//   try {
//     const { lectureId } = req.query;
//     const logs = await prisma.attendanceAuditLog.findMany({
//       where: { lectureId: lectureId as string },
//       include: { performedBy: true, lecture: true },
//       orderBy: { createdAt: "desc" },
//     });
//     sendSuccess(res, "Audit logs fetched successfully", logs, HTTP_STATUS.OK);
//   } catch (err: any) {
//     sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
//   }
// };
//# sourceMappingURL=index.js.map