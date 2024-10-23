import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User from "../schemas/user";
import Room from "../schemas/room";
import { generateMapFromREQ, invalidFieldHandler } from "../lib/error-handlers";
import Chat from "../schemas/chat";

// Utility function to validate ObjectId
const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

const GlobalTryCatch = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Register Controller
export const register = GlobalTryCatch(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const map = generateMapFromREQ(req);

  // Field validation
  if (!map.size) {
    return res
      .status(400)
      .json({ message: "Please provide the required fields." });
  }

  const invalidField = invalidFieldHandler(map);
  if (invalidField) {
    return res.status(400).json(invalidField.message);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use." });
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT!));
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Save new user
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Login user after registration
  req.logIn(user, (err) => {
    if (err) {
      return res.status(400).json({ message: "Error logging in user." });
    }
    return res.status(201).json({
      message: `Welcome ${user.firstName} ${user.lastName}`,
      user,
    });
  });
});

// Get Profile Controller
export const getProfile = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id).populate("contacts");

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ message: "User profile.", user });
  }
);

// Get All Users Controller
export const getAllUsers = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const users = await User.find({
      _id: { $ne: req.user?._id },
      isBanned: false,
    });

    const groups = await Room.find({
      members: req.user?._id,
      isGroup: true,
    })
      .populate("members")
      .populate("admins");

    const combined = await Promise.all([
      ...users.map(async (user) => {
        const lastMessage = await Chat.findOne({
          room: { $in: user.rooms },
        }).sort({ timestamp: -1 });

        return {
          type: "user",
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar || null,
          lastActive: user.lastActive,
          timestamp: user.timestamp,
          rooms: user.rooms,
          lastMessage: lastMessage?.message || null,
        };
      }),
      ...groups.map(async (group) => {
        const lastMessage = await Chat.findOne({
          room: group._id,
        }).sort({ timestamp: -1 });
        return {
          type: "group",
          id: group._id,
          name: group.name,
          description: group.description,
          avatar: group.avatar || null,
          members: group.members,
          admins: group.admins,
          timestamp: group.timestamp,
          lastMessage: lastMessage?.message || null,
        };
      }),
    ]);

    combined.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return res.json({ message: "All users.", users: combined });
  }
);

// Add Contact Controller
export const addContact = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { contactId } = req.params;

    if (!isValidObjectId(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID." });
    }

    const [user, contact] = await Promise.all([
      User.findById(req.user?._id),
      User.findById(contactId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found." });
    if (!contact)
      return res.status(404).json({ message: "Contact not found." });

    // Create Room if it's a new contact
    if (user.contacts.includes(contact._id as Types.ObjectId)) {
      return res.status(400).json({ message: "Contact already added." });
    }

    const room = new Room({ members: [user._id, contact._id], isGroup: false });
    await room.save();

    // Update contact lists
    user.contacts.push(contact._id as Types.ObjectId);
    user.rooms.push(room._id as Types.ObjectId);
    await user.save();

    contact.contacts.push(user._id as Types.ObjectId);
    contact.rooms.push(room._id as Types.ObjectId);
    await contact.save();

    return res.json({ message: "Contact added successfully.", user });
  }
);

// Get Contact Controller
export const getContact = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { contactId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID." });
    }

    const [user, contact, room] = await Promise.all([
      User.findById(userId),
      User.findById(contactId),
      Room.findOne({ members: { $all: [userId, contactId] } }),
    ]);

    if (!user || !contact || !room) {
      return res.status(404).json({ message: "Contact or room not found." });
    }

    return res.json({
      message: "Contact found.",
      sender: user,
      receiver: contact,
      room,
    });
  }
);

// Get Users by ids Controller
export const getUsersByIds = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { userIds } = req.body;
    const userId = req.user?._id;

    if (!userIds.length) {
      return res.status(400).json({ message: "No user IDs provided." });
    }

    const users = await User.find({ _id: { $in: userIds } });

    return res.json({ message: "Users found.", users });
  }
);

// Update User by id Controller
export const updateUser = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save();

    return res.json({ message: "User updated.", user });
  }
);

// Change Password Controller
export const changePassword = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Can't change password of Social Logged in user" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT!));
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    return res.json({ message: "Password updated." });
  }
);

export const banUser = GlobalTryCatch(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found." });

  user.isBanned = true;
  await user.save();

  return res.json({ message: "User banned.", user });
});
