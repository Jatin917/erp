import { schedulerQueue } from "../queues/queue.js";
// Run at 5:00 AM every day
export async function initDailyScheduler() {
    await schedulerQueue.add('daily-job', {}, {
        repeat: { cron: '0 5 * * *' }, // Every day at 5:00 AM
        removeOnComplete: true,
        jobId: 'daily-scheduler',
    });
    console.log('✅ Daily scheduler job registered (runs 5 AM every day)');
}
//# sourceMappingURL=daily-job-scheduler.js.map