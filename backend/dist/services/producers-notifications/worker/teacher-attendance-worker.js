import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { prisma } from '../../../server.js';
import { sendMail } from '../../../services/utils/mailer.js';
dotenv.config();
new Worker('teacher-attendance-queue', async (job) => {
    console.log("teacher attendance queue");
    const { teacherId, lectureId, startTime } = job.data;
    const teacher = await prisma.schoolFaculty.findUnique({ where: { id: teacherId }, include: { user: true } });
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId }, include: { subject: true } });
    console.log("teacher ", teacher, lecture);
    if (!teacher || !lecture)
        return;
    await sendMail({
        to: teacher.user.email,
        subject: `Class Reminder – ${lecture.subject.name}`,
        html: `
        <p>Dear ${teacher.name},</p>
    
        <p>This is a reminder that your class for <strong>${lecture.subject.name}</strong> is scheduled to begin at <strong>${startTime}</strong>.</p>
    
        <p>Please ensure you join on time.</p>
    
        <p>Regards,<br/>School Administration</p>
      `,
    });
    console.log(`✅ Reminder sent to ${teacher.user.email} for lecture ${lectureId}`);
}, { connection: { url: process.env.REDIS_URL, maxRetriesPerRequest: null } });
//# sourceMappingURL=teacher-attendance-worker.js.map