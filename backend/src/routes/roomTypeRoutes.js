import express from "express";
import {
  createRoomType,
  getRoomTypes
} from "../controllers/roomTypeController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.post(
  "/",
  authenticate,
  // authorize("admin"),
  createRoomType
);

router.get("/", getRoomTypes);

export default router;