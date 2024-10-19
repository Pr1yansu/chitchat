import type { NextFunction, Request, Response } from "express";
import Room from "../schemas/room";
import Chat from "../schemas/chat";

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

// @desc Get chat history with a user
// @route GET /history/:otherUserId
export const getChatHistory = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { otherUserId } = req.params;
    const userId = req.user?._id;

    const rooms = await Room.find({
      $or: [
        {
          members: {
            $all: [userId, otherUserId],
          },
        },
        {
          members: {
            $all: [otherUserId, userId],
          },
        },
      ],
    }).populate("lastMessage");

    const chatHistory = await Chat.find({
      room: {
        $in: rooms.map((room) => room._id),
      },
    })
      .sort({ timestamp: 1 })
      .populate("sender");

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
    const { name, description, isGroup, members } = req.body;

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

    const newRoom = await Room.create({
      name,
      description,
      isGroup,
      members,
      admins: isGroup ? [req.user?._id] : [],
    });

    return res.status(201).json({
      success: true,
      data: newRoom,
    });
  }
);

// @desc Add a user to a room
// @route POST /room/:roomId/add
export const addUserToRoom = GlobalTryCatch(
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (!room.isGroup || !room.members) {
      return res.status(400).json({
        success: false,
        message: "Cannot add user to a personal chat.",
      });
    }

    room.members.push(userId);

    await room.save();
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

    if (!room.isGroup || !room.members) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove user from a personal chat.",
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
