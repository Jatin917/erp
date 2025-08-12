import express from 'express';
import path from 'path';
import os from 'os';
import cluster from 'node:cluster';
const totalCPUs = os.cpus().length;
import dotenv from 'dotenv';
const app = express();
const PORT = process.env.PORT;
const ENV = process.env.ENV;
console.log("env value ", ENV);
dotenv.config();
// set up server
app.set('view engine', 'ejs');
app.use(express.static(path.resolve('public')));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
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