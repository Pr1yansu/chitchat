import type mongoose from "mongoose";

export interface IChat extends mongoose.Document {
  message: string;
  sender: typeof mongoose.Types.ObjectId;
  status: "sent" | "delivered" | "seen";
  type: "text" | "image" | "file";
  attachments?: {
    url: string;
    public_id: string;
    type: string;
  }[];
  room?: mongoose.Types.ObjectId;
  timestamp: Date;
}
