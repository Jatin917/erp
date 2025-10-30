import { prisma } from "../../../server.js";
import { AttendanceMethod, AttendanceStatus, AttendanceType, LectureStatus, Weekday, } from "../../../../generated/prisma/index.js";
import { sendSuccess, sendError } from "../../../lib/utils.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
/* ============================================================
   SCHOOL DAYS
============================================================ */
export const getSchoolDays = async (req, res) => {
    try {
        const { sessionId } = req.query;
        console.log("session id");
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
export const generateLectures = async (req, res) => {
    try {
        const { classId, timetable, sessionId } = req.body;
        const schoolDays = await prisma.schoolDay.findMany({
            where: { sessionId, type: "WORKING" },
        });
        const lectures = [];
        for (const day of schoolDays) {
            const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(day.date).getDay()];
            const slots = timetable[weekday];
            if (!slots)
                continue;
            for (const slot of slots) {
                lectures.push({
                    classId,
                    subjectId: slot.subjectId,
                    teacherId: slot.teacherId,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    dayOfWeek: weekday,
                    schoolDayId: day.id,
                    status: LectureStatus.SCHEDULED,
                });
            }
        }
        await prisma.lecture.createMany({ data: lectures });
        sendSuccess(res, "Lectures generated successfully", { total: lectures.length }, HTTP_STATUS.CREATED);
    }
    catch (err) {
        sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
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