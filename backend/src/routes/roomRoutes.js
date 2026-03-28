import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  createRoom,
  getRooms,
  getRoom,
  adminRooms,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/", authenticate, authorize("admin"), createRoom);
router.put("/:id", authenticate, authorize("admin"), updateRoom);
router.delete("/:id", authenticate, authorize("admin"), deleteRoom);
router.get("/admin", authenticate, authorize("admin"), adminRooms);
router.get("/", getRooms);
router.get("/:id", getRoom);

router.post(
  "/upload/:id",
  authenticate,
  authorize("admin"),
  upload.array("images"),
  uploadRoomImages
);

router.delete(
  "/image/:id",
  authenticate,
  authorize("admin"),
  deleteRoomImage
);

export default router;