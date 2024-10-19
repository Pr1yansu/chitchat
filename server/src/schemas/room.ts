import mongoose from "mongoose";
import type { IRoom } from "../types/IRoom";

const roomSchema = new mongoose.Schema<IRoom>({
  name: {
    type: String,
    required: function () {
      return this.isGroup;
    },
    unique: true,
  },
  description: {
    type: String,
  },
  avatar: {
    url: {
      type: String,
      validate: {
        validator: function (v: string | undefined) {
          if (!v) {
            return true;
          }
          return /^https?:\/\/.*/.test(v);
        },
        message: (props: { value: string | undefined }) =>
          `${props.value} is not a valid URL!`,
      },
    },
    public_id: String,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isGroup;
      },
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isGroup; // Only required for group chats
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});

roomSchema.pre("save", function (next) {
  if (this.isGroup && this.admins) {
    this.admins.forEach((admin) => {
      if (!this.members) {
        throw new Error("Members must be provided for group chat.");
      }
      if (!this.members.includes(admin)) {
        throw new Error(`Admin ${admin} must be a member of the room.`);
      }
    });
  }
  next();
});

roomSchema.virtual("memberCount").get(function () {
  return this.members ? this.members.length : 0;
});

roomSchema.virtual("adminCount").get(function () {
  return this.admins ? this.admins.length : 0;
});

roomSchema.index({ name: 1 });
roomSchema.index({ members: 1 });

roomSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<IRoom>("Room", roomSchema);
