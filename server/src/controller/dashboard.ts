import { Request, Response } from "express";
import user from "../schemas/user";
import chat from "../schemas/chat";
import room from "../schemas/room";
const { format, subMonths, parseISO, differenceInDays } = require("date-fns");

export const getUsersRegisteredInAMonthOfEachDay = async (
  req: Request,
  res: Response
) => {
  const { start, end } = req.query;

  // Default to one month before the current date if start is not provided
  const endDate = end ? parseISO(end as string) : new Date();
  const startDate = start ? parseISO(start as string) : subMonths(endDate, 1);

  const totalDays = differenceInDays(endDate, startDate) + 1;

  const users = await user.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Generate array of users registered for each day within the date range
  const usersRegisteredInMonth = Array.from({ length: totalDays }, (_, i) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const dayOfMonth = currentDate.getDate();
    const user = users.find((user) => user._id === dayOfMonth);
    const formattedDate = format(currentDate, "do MMM yyyy");

    return {
      day: formattedDate,
      count: user ? user.count : 0,
    };
  });

  res.json(usersRegisteredInMonth);
};

export const totalNumberOfChatsInAMonthOfEachDay = async (
  req: Request,
  res: Response
) => {
  const { start, end } = req.query;

  // Default to one month before the current date if start is not provided
  const endDate = end ? parseISO(end as string) : new Date();
  const startDate = start ? parseISO(start as string) : subMonths(endDate, 1);

  const totalDays = differenceInDays(endDate, startDate) + 1;

  const chats = await chat.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$timestamp" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Generate array of chats for each day within the date range
  const chatsInMonth = Array.from({ length: totalDays }, (_, i) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const dayOfMonth = currentDate.getDate();
    const chat = chats.find((chat) => chat._id === dayOfMonth);
    const formattedDate = format(currentDate, "do MMM yyyy");

    return {
      day: formattedDate,
      count: chat ? chat.count : 0,
    };
  });

  res.json(chatsInMonth);
};

export const totalNumberOfRoomsInAMonthOfEachDay = async (
  req: Request,
  res: Response
) => {
  const { start, end } = req.query;

  // Default to one month before the current date if start is not provided
  const endDate = end ? parseISO(end as string) : new Date();
  const startDate = start ? parseISO(start as string) : subMonths(endDate, 1);

  const totalDays = differenceInDays(endDate, startDate) + 1;

  const rooms = await room.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Generate array of rooms created for each day within the date range
  const roomsInMonth = Array.from({ length: totalDays }, (_, i) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const dayOfMonth = currentDate.getDate();
    const room = rooms.find((room) => room._id === dayOfMonth);
    const formattedDate = format(currentDate, "do MMM yyyy");

    return {
      day: formattedDate,
      count: room ? room.count : 0,
    };
  });

  res.json(roomsInMonth);
};
