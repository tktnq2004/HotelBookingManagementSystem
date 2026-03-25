import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";
import PricingRule from "../models/pricingRuleModel.js";
import RoomType from "../models/roomTypeModel.js";

export const createBooking = async (req, res) => {
    try {
        const { rooms, checkIn, checkOut, guests } = req.body;

        if (!rooms || rooms.length === 0 || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ===== VALIDATE =====
        const roomObjectIds = rooms.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid roomId: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
        });

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({ message: "Invalid date" });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        // ===== CALCULATE NIGHTS =====
        const nights = Math.ceil(
            (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
        );

        // ===== GET ROOMS =====
        const roomDocs = await Room.find({ _id: { $in: roomObjectIds } });

        if (roomDocs.length !== roomObjectIds.length) {
            return res.status(404).json({ message: "Room not found" });
        }

        // ===== CHECK CONFLICT =====
        const conflict = await Booking.findOne({
            "rooms.roomId": { $in: roomObjectIds },
            status: { $ne: "cancelled" },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
        });

        if (conflict) {
            return res.status(400).json({
                message: "Room already booked"
            });
        }

        // ===== ROOM TYPES =====
        const roomTypeIds = roomDocs.map(r => r.roomTypeId);

        const roomTypes = await RoomType.find({
            _id: { $in: roomTypeIds }
        });

        const roomTypeMap = {};
        roomTypes.forEach(rt => {
            roomTypeMap[rt._id] = rt;
        });

        // ===== PRICING RULES =====
        const rules = await PricingRule.find({
            roomTypeId: { $in: roomTypeIds }
        });

        let totalPrice = 0;
        const roomDetails = [];

        // ===== CALCULATE PRICE =====
        for (const room of roomDocs) {

            const roomType = roomTypeMap[room.roomTypeId];

            if (!roomType) {
                return res.status(400).json({
                    message: "Room type not found"
                });
            }

            let roomTotal = 0;
            let currentDate = new Date(checkInDate);

            while (currentDate < checkOutDate) {

                let basePrice = Number(roomType.basePrice);
                let multiplier = 1;

                const rule = rules.find(r =>
                    r.roomTypeId.toString() === room.roomTypeId.toString() &&
                    currentDate >= r.startDate &&
                    currentDate <= r.endDate
                );

                if (rule) {
                    multiplier = Number(rule.multiplier);
                }

                const pricePerNight = basePrice * multiplier;

                roomTotal += pricePerNight;

                currentDate.setDate(currentDate.getDate() + 1);
            }

            totalPrice += roomTotal;

            // 👉 SNAPSHOT DATA
            roomDetails.push({
                roomId: room._id,
                roomTypeId: room.roomTypeId,
                roomTypeName: roomType.name,
                pricePerNight: roomType.basePrice
            });
        }

        // ===== CREATE =====
        const booking = await Booking.create({
            customerId: req.user.id,
            customerName: req.user.name, // snapshot

            rooms: roomDetails,

            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,

            totalPrice,

            guests,

            status: "pending",
            paymentStatus: "unpaid"
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getBookings = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (req.user.role !== "admin") {
      query.customerId = req.user.id;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(bookings);

  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};