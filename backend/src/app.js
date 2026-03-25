import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roomTypeRoutes from "./routes/roomTypeRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import pricingRuleRoutes from "./routes/pricingRuleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import cookieParser from "cookie-parser";
import dashboardRoutes from "./routes/dashBoardRoutes.js";

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/room-types", roomTypeRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/pricing", pricingRuleRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/api/bookings", bookingRoutes);

app.use("/api/dashboard", dashboardRoutes);

export default app;