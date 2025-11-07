import express from 'express';
import { sendWelcomeEmail } from './jobs/producers.js';
// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
// Route to simulate user registration
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Missing name or email' });
    }
    await sendWelcomeEmail({ email, name, password });
    return res.json({ message: 'User registered successfully, email will be sent shortly.' });
});
// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
//# sourceMappingURL=index.js.map