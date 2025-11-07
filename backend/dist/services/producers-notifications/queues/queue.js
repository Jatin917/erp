import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const connection = new Redis(process.env.REDIS_URL);
export const emailQueue = new Queue('email-queue', { connection });
export const schedulerQueue = new Queue('daily-scheduler-queue', { connection });
export const teacherAttendanceQueue = new Queue('teacher-attendance-queue', { connection });
//# sourceMappingURL=queue.js.map