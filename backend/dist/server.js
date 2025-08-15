import express from 'express';
import path from 'path';
import os from 'os';
import cluster from 'node:cluster';
const totalCPUs = os.cpus().length;
import dotenv from 'dotenv';
import { router_v1 } from './routes/version-1.ts/route.js';
import { PrismaClient } from '../generated/prisma/index.js';
import cors from 'cors';
dotenv.config();
const PORT = process.env.PORT;
const ENV = process.env.ENV;
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const SUPERADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
export const SUPERADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const app = express();
export const otpStorage = new Map();
export const emailVerified = new Map();
export const defaultPassword = process.env.DEFAULT_PASSWORD || "secret";
// set up server
app.use(cors({ origin: '*' }));
app.set('view engine', 'ejs');
app.use(express.static(path.resolve('public')));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/api/v1', router_v1);
export const prisma = new PrismaClient();
if (ENV === "DEV") {
    app.listen(PORT, () => {
        console.log("Server running on port", PORT);
    });
}
else {
    const totalCPUs = os.cpus().length;
    if (cluster.isPrimary) {
        console.log('Master has started');
        for (let i = 0; i < totalCPUs; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker) => {
            console.log(`Worker ${worker.process.pid} died, restarting...`);
            cluster.fork();
        });
    }
    else {
        console.log('Worker has started', process.pid);
        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    }
}
//# sourceMappingURL=server.js.map