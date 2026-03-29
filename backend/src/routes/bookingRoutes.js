import express from "express";
import { createBooking, getBookings, cancelBooking, updateBookingStatus } from "../controllers/bookingController.js";
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

router.patch(
    "/:id/cancel",
    authenticate,
    cancelBooking
);

router.patch("/:id/status",authenticate,authorize("admin"), updateBookingStatus);

export default router;