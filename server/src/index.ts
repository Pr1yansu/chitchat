import dotenv from "dotenv";
// Load environment variables
dotenv.config({
  path: ".env",
});

import { createServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import RedisStore from "connect-redis";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import redisClient from "./config/redis-client";
import { connectDB } from "./config/db";
import { initializeSocketEvents } from "./sockets/initialize-socket-events";

import "./config/passport";
import { socketAuthMiddleware } from "./middleware/socket-auth";

console.log(process.env.PORT);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  keyGenerator(request: Request, _response: Response): string {
    if (!request.ip) {
      console.warn("Rate limiter: Request IP not found in the request object");
      return "unknown";
    }

    return request.ip.replace(/:\d+[^:]*$/, "");
  },
});

// Database connection
connectDB();

// Express setup
const app = express();

// Middlewares
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
    }),
    secret: process.env.SECRET_KEY || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io setup
const server = createServer(app);
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind =
    typeof process.env.PORT === "string"
      ? "Pipe " + process.env.PORT
      : "Port " + process.env.PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
});
server.on("listening", () => {
  console.log("Server is listening on port", process.env.PORT);
});

const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  pingTimeout: 25000,
  pingInterval: 60000,
});

io.use(socketAuthMiddleware);

io.onlineUsers = new Map<string, string>();

initializeSocketEvents(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on url http://localhost:${PORT}`);
});

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from backend current time is " + new Date().toISOString());
});

// Error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Route not found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

const gracefulExit = () => {
  console.log("Shutting down gracefully...");
  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulExit);
process.on("SIGTERM", gracefulExit);
