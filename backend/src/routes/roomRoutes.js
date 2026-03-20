import express from "express";

import {
  createRoom,
  getRooms,
  getRoom,
  deleteRoom
} from "../controllers/roomController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  // authorize("admin"),
  createRoom
);

router.delete(
  "/:id",
  authenticate,
  // authorize("admin"),
  deleteRoom
);

router.get("/", getRooms);

router.get("/:id", getRoom);

export default router;