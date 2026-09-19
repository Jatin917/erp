import { Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config();
process.env.RUN_AS_WORKER = "1";
process.env.ENV = process.env.ENV === "DEV" ? "WORKER" : process.env.ENV || "WORKER";

const { processBulkUploadJob } = await import("@src/services/student/bulk-upload.js");

new Worker(
  "student-bulk-upload-queue",
  async (job) => {
    const jobId = job.data?.jobId as string | undefined;
    if (!jobId) {
      throw new Error("Missing jobId in bulk upload queue payload");
    }
    console.log(`Processing student bulk upload ${jobId}`);
    await processBulkUploadJob(jobId);
    console.log(`Finished student bulk upload ${jobId}`);
  },
  {
    connection: { url: process.env.REDIS_URL!, maxRetriesPerRequest: null },
    concurrency: 1,
  },
);

console.log("Student bulk upload worker started");
