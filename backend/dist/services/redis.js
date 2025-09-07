import { createClient } from "redis";
export const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
const client = createClient({
    url: REDIS_URL
});
export const RedisClient = async () => {
    try {
        console.log("Connecting to Redis");
        if (!client.isOpen) {
            await client.connect();
        }
        console.log("Connected to Redis");
        return client;
    }
    catch (error) {
        console.error(error.message);
        throw error;
    }
};
//# sourceMappingURL=redis.js.map