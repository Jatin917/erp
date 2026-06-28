import { emailQueue } from '@src/services/producers-notifications/queues/queue.js'
import type { Role } from '../../../../generated/prisma/index.js';

export const sendWelcomeEmail = async (user: { email: string; name: string, password:string, roles:Role[] }) => {
  await emailQueue.add('send-welcome-email', user);
  console.log(`📬 Enqueued welcome email for ${user.email}`);
};
