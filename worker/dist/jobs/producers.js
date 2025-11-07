import { emailQueue } from './queues.js';
export const sendWelcomeEmail = async (user) => {
    await emailQueue.add('send-welcome-email', user);
    console.log(`📬 Enqueued welcome email for ${user.email}`);
};
//# sourceMappingURL=producers.js.map