import { emailQueue } from '../../services/producers-notifications/queue.js';
export const sendWelcomeEmail = async (user) => {
    await emailQueue.add('send-welcome-email', user);
    console.log(`📬 Enqueued welcome email for ${user.email}`);
};
//# sourceMappingURL=producer.email.js.map