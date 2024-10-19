import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User from "../schemas/user";
import Room from "../schemas/room";
import { generateMapFromREQ, invalidFieldHandler } from "../lib/error-handlers";

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
    const users = await User.find({ _id: { $ne: req.user?._id } });

    const groups = await Room.find({
      members: req.user?._id,
      isGroup: true,
    })
      .populate("members")
      .populate("admins");

    const combined = [
      ...users.map((user) => ({
        type: "user",
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || null,
        lastActive: user.lastActive,
        timestamp: user.timestamp,
      })),
      ...groups.map((group) => ({
        type: "group",
        id: group._id,
        name: group.name,
        description: group.description,
        avatar: group.avatar || null,
        members: group.members,
        admins: group.admins,
        timestamp: group.timestamp,
      })),
    ];

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
