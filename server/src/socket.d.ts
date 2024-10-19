declare module "socket.io" {
  interface Server {
    onlineUsers: Map<string, string>;
  }
}

export {};
