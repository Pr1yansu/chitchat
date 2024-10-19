import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_DATABASE_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("🔄 Attempting to connect to Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("end", () => {
  console.log("🔌 Redis connection closed.");
});

redisClient.connect().catch((err) => {
  console.error("❌ Redis connection error:", err);
});

const gracefulShutdown = () => {
  redisClient
    .quit()
    .then(() => console.log("🔌 Redis connection closed gracefully."));
};

process.on("SIGINT", gracefulShutdown).on("SIGTERM", gracefulShutdown);

export default redisClient;
