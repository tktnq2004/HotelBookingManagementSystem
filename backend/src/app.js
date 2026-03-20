import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roomTypeRoutes from "./routes/roomTypeRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import pricingRuleRoutes from "./routes/pricingRuleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/room-types", roomTypeRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/pricing-rules", pricingRuleRoutes);

app.use("/api/bookings", bookingRoutes);

export default app;