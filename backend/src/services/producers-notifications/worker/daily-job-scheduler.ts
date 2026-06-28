import { Worker } from 'bullmq';
import {Redis} from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

import { getLecturesForToday } from '@src/services/school/index.js';
import { LectureStatus } from '../../../../generated/prisma/index.js';
import { teacherAttendanceQueue } from '../queues/queue.js';


function getDelayFromTimeString(timeString: string, minutesBefore = 10): number {
  // 1️⃣ Get current date (for "today's lectures")
  const now = new Date();
  const todayDateString = now.toISOString().split('T')[0]; // e.g., "2025-11-10"

  // 2️⃣ Combine date + time (assuming local IST timezone)
  //    Example → "2025-11-10T09:00:00+05:30"
  const combinedIso = `${todayDateString}T${timeString}:00+05:30`;

  // 3️⃣ Create Date object and compute delay
  const lectureStart = new Date(combinedIso);
  if (isNaN(lectureStart.getTime())) {
    console.error("❌ Invalid time:", timeString, combinedIso);
    return 0;
  }

  const delay = Math.max(lectureStart.getTime() - Date.now() - minutesBefore * 60 * 1000, 0);
  return delay;
}

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('✅ Connected to Redis'));
connection.on('ready', () => console.log('💚 Redis ready for commands'));
connection.on('error', (err) => console.error('❌ Redis error', err));


new Worker(
  'daily-scheduler-queue',
  async (job) => {
    console.log('🌅 Running daily scheduler job at', new Date().toLocaleString());

    const lectures = await getLecturesForToday();
    console.log(`Found ${lectures.length} lectures for today`);
    console.log("lectures are ", lectures);

    let scheduledCount = 0;
    let addedCount = 0;
    
    for (const lec of lectures) {
      const delay = getDelayFromTimeString(lec.startTime);
      console.log(`📅 Lecture ${lec.id}: delay=${delay}ms, status=${lec.status}`);
      
      if (delay < 0) {
        console.log(`⏭️  Skipping lecture ${lec.id} - delay is negative (past class)`);
        continue; // skip past classes
      }
      
      if(lec.status === LectureStatus.SCHEDULED){
        scheduledCount++;
        console.log(`✅ Lecture ${lec.id} is SCHEDULED - attempting to add to queue`);
        try {
          const status = await teacherAttendanceQueue.add(
            'lecture-reminder',
            {
              lectureId: lec.id,
              teacherId: lec.teacherId,
              startTime: lec.startTime,
              teacherName:lec.teacher.name,
              teacherEmail:lec.teacher.user.email
            },
            {
              jobId: `reminder-job-${lec.id}`,
              removeOnComplete: true,
              delay: delay+1000
            }
          );
          addedCount++;
          console.log(`✅ Successfully added to newQueue! Status:`, status);
          console.log(`   Job ID: ${status.id}, Job Name: ${status.name}`);
        } catch (error) {
          console.error(`❌ Error adding lecture ${lec.id} to newQueue:`, error);
        }
      } else {
        console.log(`⚠️  Lecture ${lec.id} status is ${lec.status}, not SCHEDULED - skipping`);
      }
    }
    
    console.log(`📊 Summary: ${scheduledCount} scheduled lectures found, ${addedCount} successfully added to queue`);

    console.log('✅ All today\'s reminders enqueued.', );
  },
  { connection }
);
