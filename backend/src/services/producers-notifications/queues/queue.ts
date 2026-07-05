import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const connection = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null,
};

export const emailQueue = new Queue('email-queue', { connection });
export const schedulerQueue = new Queue('daily-scheduler-queue', { connection });
export const teacherAttendanceQueue = new Queue('teacher-attendance-queue', { connection });