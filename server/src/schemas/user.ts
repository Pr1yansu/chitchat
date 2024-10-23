import mongoose, { type CallbackError } from "mongoose";
import type { IUser } from "../types/IUser";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  googleId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.githubId && !this.facebookId;
    },
    minlength: 6,
  },
  avatar: {
    url: {
      type: String,
      validate: {
        validator: function (v: string | undefined) {
          if (!v) return true;
          return /^https?:\/\/.*/.test(v);
        },
        message: (props: { value: string | undefined }) =>
          `${props.value} is not a valid URL!`,
      },
    },
    public_id: String,
  },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.comparePassword = function (
  candidatePassword: string | undefined
) {
  if (!candidatePassword) {
    return false;
  }
  return bcrypt.compareSync(candidatePassword, this.password);
};

userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ email: 1 });

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

userSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IUser>("User", userSchema);
