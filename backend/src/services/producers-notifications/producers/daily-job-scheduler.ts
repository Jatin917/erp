import { schedulerQueue, teacherAttendanceQueue } from "../queues/queue.js";


// Run at 5:00 AM every day
export async function initDailyScheduler() {
  await schedulerQueue.add(
    'daily-job',
    {},
    {
      repeat: { cron: '00 5 * * *' } as any, // Every day at 5:00 AM
      removeOnComplete: true,
      jobId: 'daily-scheduler',
    }
  );
  console.log(' Daily scheduler job registered (runs 5 am every day)');
}
