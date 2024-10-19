import mongoose from "mongoose";

export interface IRoom extends mongoose.Document {
  name?: string; // Only required for group chats
  description?: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  members?: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  admins?: mongoose.Types.ObjectId[];
  timestamp: Date;
  isGroup: boolean;
}
