import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { sendMail } from '../utils/mailer.js';
dotenv.config();
const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const emailWorker = new Worker('email-queue', async (job) => {
    const { email, name, password, roles = [] } = job.data;
    console.log(`📧 Sending welcome email to ${email} with roles: ${roles.join(', ')}`);
    // Format roles nicely
    const roleList = roles.length > 1
        ? `<ul style="margin: 0; padding-left: 20px; color: #4f46e5;">
             ${roles.map((r) => `<li>${r}</li>`).join('')}
           </ul>`
        : `<strong style="color: #4f46e5;">${roles[0] || 'Member'}</strong>`;
    await sendMail({
        to: email,
        subject: 'Welcome to the School ERP Portal 🎓',
        html: `
        <div style="
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f7f9fc;
          padding: 30px;
        ">
          <div style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            padding: 30px;
          ">
            <h2 style="color: #2c3e50; text-align: center;">Welcome to School ERP 🎉</h2>

            <p style="font-size: 16px; color: #555;">
              Hi <strong>${name}</strong>,
            </p>

            <p style="font-size: 15px; color: #555;">
              We're thrilled to have you join our <strong>School ERP System</strong>.
              Your assigned ${roles.length > 1 ? 'roles are' : 'role is'}:
            </p>

            <div style="margin: 10px 0 20px 0; font-size: 15px;">
              ${roleList}
            </div>

            <p style="font-size: 15px; color: #555;">
              You can log in using the credentials below:
            </p>

            <div style="
              background-color: #f1f3f6;
              padding: 15px 20px;
              border-radius: 8px;
              margin: 20px 0;
              line-height: 1.6;
              font-size: 15px;
            ">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 15px; color: #555;">
              Once logged in, please make sure to update your password for security reasons.
            </p>

            <div style="text-align: center; margin-top: 25px;">
              <a href="https://erp.kashishcomputers.com/"
                style="
                  background-color: #4f46e5;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                  font-weight: 500;
                  display: inline-block;
                  margin-bottom: 10px;
                ">
                Go to Dashboard
              </a>
              <br />
              <a href="${'https://erp.kashishcomputers.com/change-password'}"
                style="
                  background-color: #10b981;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                  font-weight: 500;
                  display: inline-block;
                ">
                Change Password
              </a>
            </div>

            <p style="font-size: 13px; color: #888; margin-top: 30px; text-align: center;">
              © ${new Date().getFullYear()} School ERP. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
}, { connection });
emailWorker.on('completed', (job) => {
    console.log(`✅ Email sent to ${job.data.email}`);
});
emailWorker.on('failed', (job, err) => {
    console.error(`❌ Failed to send email to ${job?.data?.email}`, err);
});
//# sourceMappingURL=email.worker.js.map