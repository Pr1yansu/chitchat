import express from "express";
import {
  addUserToRoom,
  changeAdmin,
  createRoom,
  getChatHistory,
  getMembersByIDs,
  getRoomById,
  removeUserFromRoom,
  sendMessage,
} from "../controller/chat";
import { ensureAuthenticated } from "../middleware/auth";

const router = express.Router();

// @Route POST /send
router.post("/send", ensureAuthenticated, sendMessage);

// @Route GET /room/:roomId
router.get("/room/:roomId", ensureAuthenticated, getRoomById);

// @Route GET /history/:otherUserId
router.get("/history/:roomId", ensureAuthenticated, getChatHistory);

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

// @Route GET /members/:members
router.get("/members/:members", ensureAuthenticated, getMembersByIDs);

// @Route PUT /room/:roomId/change-admin/:otherUserId
router.put(
  "/room/:roomId/change-admin/:otherUserId",
  ensureAuthenticated,
  changeAdmin
);

export default router;
