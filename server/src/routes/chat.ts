import express from "express";
import {
  addUserToRoom,
  createRoom,
  getChatHistory,
  removeUserFromRoom,
  sendMessage,
} from "../controller/chat";
import { ensureAuthenticated } from "../middleware/auth";

const router = express.Router();

// @Route POST /send
router.post("/send", ensureAuthenticated, sendMessage);

// @Route GET /history/:otherUserId
router.get("/history/:otherUserId", ensureAuthenticated, getChatHistory);

// @Route POST /room
router.post("/room", ensureAuthenticated, createRoom);

// @Route POST /room/:roomId/add
router.post("/room/:roomId/add", ensureAuthenticated, addUserToRoom);

// @Route DELETE /room/:roomId/remove/:userId
router.delete(
  "/room/:roomId/remove/:userId",
  ensureAuthenticated,
  removeUserFromRoom
);

export default router;
