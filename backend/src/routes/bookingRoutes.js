import express from "express";
import {
    createBooking,
    getBookings
} from "../controllers/bookingController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    createBooking
);

router.get(
    "/",
    authenticate,
    getBookings
);

export default router;