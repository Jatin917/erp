import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { prisma } from '../../../server.js';
import { sendMail } from '../../../services/utils/mailer.js';
dotenv.config();
const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});
new Worker('attendance-queue', async (job) => {
    const { teacherId, lectureId, startTime } = job.data;
    const teacher = await prisma.schoolFaculty.findUnique({ where: { id: teacherId }, include: { user: true } });
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId }, include: { subject: true } });
    if (!teacher || !lecture)
        return;
    await sendMail({
        to: teacher.user.email,
        subject: `Class Reminder: ${lecture.subject.name}`,
        html: `<p>Hi ${teacher.name}, your class <b>${lecture.subject.name}</b> starts at ${new Date(startTime).toLocaleTimeString()}.</p>`,
    });
    console.log(`✅ Reminder sent to ${teacher.user.email} for lecture ${lectureId}`);
}, { connection });
//# sourceMappingURL=teacher-attendance-worker.js.map