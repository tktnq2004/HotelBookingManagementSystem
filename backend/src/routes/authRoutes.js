import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, getMe);

export default router;