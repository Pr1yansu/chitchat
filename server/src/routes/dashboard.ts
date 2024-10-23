import { Router } from "express";
import {
  getUsersRegisteredInAMonthOfEachDay,
  totalNumberOfChatsInAMonthOfEachDay,
  totalNumberOfRoomsInAMonthOfEachDay,
} from "../controller/dashboard";
import { ensureAdmin, ensureAuthenticated } from "../middleware/auth";

const router = Router();

router.get(
  "/users",
  ensureAuthenticated,
  ensureAdmin,
  getUsersRegisteredInAMonthOfEachDay
);

router.get(
  "/get/chats",
  ensureAuthenticated,
  ensureAdmin,
  totalNumberOfChatsInAMonthOfEachDay
);

router.get(
  "/get/rooms",
  ensureAuthenticated,
  ensureAdmin,
  totalNumberOfRoomsInAMonthOfEachDay
);

export default router;
