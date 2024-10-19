import { Socket } from "socket.io";
import cookie from "cookie";
import redisClient from "../config/redis-client";

interface SocketWithUserId extends Socket {
  data: {
    userId: string;
  };
}

export const socketAuthMiddleware = async (
  socket: SocketWithUserId,
  next: Function
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found."));
    }

    const parsedCookies = cookie.parse(cookieHeader);
    const sessionCookie = parsedCookies["connect.sid"];

    if (!sessionCookie) {
      return next(new Error("Authentication error: No 'connect.sid' cookie."));
    }

    const sessionIdMatch = sessionCookie.match(/^s:([^\.]+)\./);

    if (!sessionIdMatch) {
      return next(new Error("Authentication error: Invalid session format."));
    }

    const sessionId = sessionIdMatch[1];

    // Fetch session data from Redis
    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      return next(new Error("Authentication error: Session not found."));
    }

    const parsedSession = JSON.parse(sessionData);
    const userId = parsedSession.passport?.user;

    if (!userId) {
      return next(
        new Error("Authentication error: User ID not found in session.")
      );
    }

    socket.data.userId = userId;

    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Authentication error"));
  }
};
