import { randomUUID } from "crypto";
import { Server, Socket } from "socket.io";

export const initializeSocketEvents = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    if (userId) {
      io.onlineUsers.set(userId, socket.id);
    }

    const onlineUsers = Array.from(io.onlineUsers.keys());
    socket.emit("online-users", onlineUsers);

    // Handle joining a room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      socket.on("send-message", (data) => {
        const { formatData } = data;
        const formatMSG = {
          messageId: randomUUID(),
          fromUserId: userId,
          message: formatData.message,
          type: formatData.type,
          attachments: formatData.attachments || [],
          timestamp: new Date().toISOString(),
          status: "sent",
          username: formatData.username,
          avatar: formatData.avatar,
          roomId,
        };
        socket.to(roomId).emit("receive-message", formatMSG);
        socket.emit("receive-message", formatMSG);
      });

      socket.on("typing", ({ roomId, userId, username }) => {
        io.emit("user_typing", { roomId, userId, username });
      });

      socket.on("stop-typing", ({ roomId, userId, username }) => {
        io.emit("user_stop_typing", { roomId, userId, username });
      });

      socket.on("call-user", ({ signalData, roomId }) => {
        socket
          .to(roomId)
          .emit("receive-call", { signalData, roomId, callerId: userId });
      });

      socket.on("accept-call", ({ signalData, roomId }) => {
        socket
          .to(roomId)
          .emit("call-accepted", { signalData, roomId, responderId: userId });
      });

      socket.on("end-call", (roomId) => {
        socket.to(roomId).emit("call-ended", { roomId });
      });
    });

    io.emit("user_connected", { userId, status: "online" });

    socket.on("user_idle", () => {
      io.emit("user_idle", { userId, status: "idle" });
    });

    socket.on("user_active", () => {
      io.emit("user_connected", { userId, status: "online" });
    });

    socket.on("disconnect", () => {
      if (userId) {
        io.onlineUsers.delete(userId);
      }
      io.emit("user_disconnected", { userId, status: "offline" });
    });
  });
};
