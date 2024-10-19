import { Server as OriginalServer } from "socket.io";

declare module "socket.io" {
  interface Server {
    onlineUsers: Map<string, string>;
  }
}
