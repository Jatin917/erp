import { studentBulkUploadQueue } from "@src/services/producers-notifications/queues/queue.js";

export const enqueueStudentBulkUpload = async (jobId: string) => {
  await studentBulkUploadQueue.add(
    "process-bulk-upload",
    { jobId },
    {
      jobId: `bulk-upload-${jobId}`,
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    },
  );
  console.log(`Enqueued student bulk upload job ${jobId}`);
};
