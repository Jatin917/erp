import { createClient, type RedisClientType } from "redis";
import dotenv from 'dotenv'

dotenv.config();
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
console.log("redis url ", REDIS_URL)
const client: RedisClientType = createClient({ 
  url: REDIS_URL 
});

export const RedisClient = async (): Promise<RedisClientType> => {
  try {
    console.log("Connecting to Redis");
    if (!client.isOpen) {
      await client.connect();
    }
    console.log("Connected to Redis");
    return client;
  } catch (error) {
    console.error((error as Error).message);
    throw error;
  }
};
