import express from "express";
import {
  createRoomType,
  getRoomTypes,
  deleteRoomType,
  updateRoomType
} from "../controllers/roomTypeController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createRoomType
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteRoomType
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateRoomType
);

router.get("/", getRoomTypes);

export default router;