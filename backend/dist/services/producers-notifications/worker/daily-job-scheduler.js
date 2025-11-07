import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
import { getLecturesForToday } from '../../../services/school/index.js';
import { LectureStatus } from '../../../../generated/prisma/index.js';
import { teacherAttendanceQueue } from '../queues/queue.js';
const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});
new Worker('daily-scheduler-queue', async (job) => {
    console.log('🌅 Running daily scheduler job at', new Date().toLocaleString());
    const lectures = await getLecturesForToday();
    console.log(`Found ${lectures.length} lectures for today`);
    for (const lec of lectures) {
        const delay = new Date(lec.startTime).getTime() - Date.now() - 10 * 60 * 1000;
        if (delay <= 0)
            continue; // skip past classes
        if (lec.status === LectureStatus.SCHEDULED) {
            await teacherAttendanceQueue.add('lecture-reminder', {
                lectureId: lec.id,
                teacherId: lec.teacherId,
                startTime: lec.startTime,
                teacherName: lec.teacher.name,
                teacherEmail: lec.teacher.user.email
            }, {
                jobId: `reminder:${lec.id}`,
                delay,
                removeOnComplete: true,
            });
        }
    }
    console.log('✅ All today\'s reminders enqueued.');
}, { connection });
//# sourceMappingURL=daily-job-scheduler.js.map