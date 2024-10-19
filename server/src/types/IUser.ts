import type mongoose from "mongoose";

export interface IUser extends mongoose.Document {
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
  status: "online" | "offline" | "away";
  rooms: mongoose.Types.ObjectId[];
  contacts: mongoose.Types.ObjectId[];
  lastActive: Date;
  timestamp: Date;
}
