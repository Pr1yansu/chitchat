import type { NextFunction, Request, Response } from "express";
import Room from "../schemas/room";
import Chat from "../schemas/chat";
import { Types } from "mongoose";
import user from "../schemas/user";

const GlobalTryCatch = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc Send a message
// @route POST /send
export const sendMessage = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const {
      message,
      room,
      type = "text",
      attachments = [
        {
          url: "",
          type: "text",
        },
      ],
    } = req.body;

    const group = await Room.findById(room);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    group?.members?.forEach(async (member) => {
      await user.findByIdAndUpdate(member, {
        timestamp: new Date(),
        lastActive: new Date(),
      });
    });

    const newMessage = await Chat.create({
      message,
      sender: req.user?._id,
      room,
      type,
      attachments,
    });

    await Room.findByIdAndUpdate(room, {
      lastMessage: newMessage._id,
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  }
);

// @desc Get chat history with a room
// @route GET /history/:roomId
export const getChatHistory = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const userId = req.user?._id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (room.members && !room.members.includes(userId as Types.ObjectId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room.",
      });
    }

    const chatHistory = await Chat.find({
      room: roomId,
    })
      .populate("sender")
      .sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      data: chatHistory,
    });
  }
);

// @desc Create a room
// @route POST /room
export const createRoom = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { name, description, isGroup, members, avatar } = req.body;

    const existingRoom = await Room.findOne({
      name,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room with this name already exists.",
      });
    }

    if (isGroup && !members) {
      return res.status(400).json({
        success: false,
        message: "Members must be provided for group chat.",
      });
    }

    if (isGroup) {
      members.push(req.user?._id);
    }

    await Room.create({
      name,
      description,
      isGroup,
      members,
      admins: isGroup ? [req.user?._id] : [],
      avatar,
      owner: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Room created.",
    });
  }
);

// @desc Add a user to a room
// @route POST /room/:roomId/add
export const addUserToRoom = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userIds } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (!room.isGroup || !room.members || !room.admins || !room.owner) {
      return res.status(400).json({
        success: false,
        message: "Cannot add user to a personal chat.",
      });
    }

    if (
      !room.admins.includes(req.user?._id as Types.ObjectId) &&
      room.owner.toString() !== req.user?._id
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and owner can add users to the Group.",
      });
    }

    if (!userIds.length) {
      return res.status(400).json({
        success: false,
        message: "No users provided.",
      });
    }

    userIds.forEach(async (userId: string) => {
      if (!room.members?.includes(userId as unknown as Types.ObjectId)) {
        room.members?.push(userId as unknown as Types.ObjectId);
      } else {
        return res.status(400).json({
          success: false,
          message: "User already in the room.",
        });
      }
    });

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Users added to room.",
    });
  }
);

// @desc Remove a user from a room
// @route DELETE /room/:roomId/remove/:userId
export const removeUserFromRoom = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId, userId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (!room.isGroup || !room.members || !room.admins || !room.owner) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove user from a personal chat.",
      });
    }

    if (
      !room.admins.includes(req.user?._id as Types.ObjectId) &&
      room.owner.toString() !== req.user?._id
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and owner can remove users from the Group.",
      });
    }

    room.members = room.members.filter(
      (member) => member.toString() !== userId
    );

    await room.save();

    return res.status(200).json({
      success: true,
      message: "User removed from room.",
    });
  }
);

// @desc Get a room by ID
// @route GET /room/:roomId
export const getRoomById = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  }
);

// @desc Get members by IDs
// @route GET /members/:members
export const getMembersByIDs = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { members } = req.params;

    const memberIds = members.split(",");

    const memberObjects = await user.find({
      _id: {
        $in: memberIds,
      },
    });

    return res.status(200).json({
      success: true,
      data: memberObjects,
    });
  }
);

// @desc Change user to admin only owner and admins can do this
// @route PUT /room/:roomId/change-admin/:userId
export const changeAdmin = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId, otherUserId } = req.params;
    const userId = req.user?._id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (!room.isGroup || !room.admins || !room.members || !room.owner) {
      return res.status(400).json({
        success: false,
        message: "Cannot change admin status of a personal chat.",
      });
    }

    if (
      !room.admins.includes(userId as unknown as Types.ObjectId) &&
      room.owner.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to change admin status.",
      });
    }

    if (!room.members.includes(otherUserId as unknown as Types.ObjectId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this room.",
      });
    }

    if (room.owner.toString() === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "cannot change owner status.",
      });
    }

    if (room.admins.includes(otherUserId as unknown as Types.ObjectId)) {
      room.admins = room.admins.filter(
        (admin) => admin.toString() !== otherUserId
      );
    } else {
      room.admins.push(otherUserId as unknown as Types.ObjectId);
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Admin status changed.",
    });
  }
);
