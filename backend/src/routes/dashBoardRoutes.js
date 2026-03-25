import express from "express";
import { getDashboard } from "../controllers/dashBoardController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// chỉ admin mới xem dashboard
router.get("/", authenticate, authorize("admin"), getDashboard);

export default router;