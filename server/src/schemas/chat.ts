import mongoose from "mongoose";
import type { IChat } from "../types/IChat";

const chatSchema = new mongoose.Schema<IChat>({
  message: {
    type: String,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },
  type: {
    type: String,
    enum: ["text", "image", "file"],
    default: "text",
  },
  attachments: [
    {
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
      type: {
        type: String,
        required: true,
      },
    },
  ],
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.index({ room: 1, timestamp: -1 });
chatSchema.index({ sender: 1, timestamp: -1 });

export default mongoose.model<IChat>("Chat", chatSchema);
