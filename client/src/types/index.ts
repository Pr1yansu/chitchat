export interface User {
  id: string;
  type?: "user" | "group";
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  facebookId?: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  contacts: User[];
  rooms: string[];
  lastActive: Date;
  timestamp: Date;
  roomId?: string;
}

export interface Attachment {
  url: string;
  type: string;
}

// types.ts
export interface ChatMessage {
  id: string;
  attachments?: Attachment[];
  message: string;
  room: string;
  sender: User;
  status: "sent" | "delivered" | "read";
  timestamp: string;
  type: "text" | "image" | "video" | "audio";
}

export interface Room {
  id: string;
  name?: string;
  isGroup: boolean;
  memberCount: number;
  members: User[];
  timestamp: Date;
  admins: User[];
  adminCount: number;
}
