import { io, Socket } from "socket.io-client";

const URL =
  import.meta.env.NODE_ENV === "production"
    ? import.meta.env.VITE_PROD_URL
    : "http://localhost:5000";

export const socket: Socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {});

socket.on("disconnect", () => {});

socket.onAny((event, ...args) => {
  console.log("event:", event, "args:", args);
});
