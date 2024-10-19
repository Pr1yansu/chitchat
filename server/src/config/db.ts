import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_DATABASE_URL) {
      console.error("❌ MongoDB URL not found in .env file");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_DATABASE_URL!, {
      dbName: process.env.MONGODB_DATABASE_NAME,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (e: any) {
    console.error(
      "❌ Error in connecting to the MongoDB database:",
      e.message || e
    );
    process.exit(1);
  }
};

// Graceful shutdown to handle app termination
const gracefulShutdown = () => {
  mongoose.connection
    .close(false)
    .then(() => {
      console.log("🔌 MongoDB connection closed gracefully.");
      process.exit(0);
    })
    .catch((e) => {
      console.error("❌ Error in closing MongoDB connection:", e.message || e);
      process.exit(1);
    });
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection lost.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB connection reestablished.");
});

process.on("SIGINT", gracefulShutdown).on("SIGTERM", gracefulShutdown);
