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

        const roomObjectIds = rooms.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid roomId: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
        });

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        if (guests <= 0) {
            return res.status(400).json({ message: "Guests must be greater than 0" });
        }

        const roomDocs = await Room.find({ _id: { $in: roomObjectIds } });

        if (roomDocs.length !== roomObjectIds.length) {
            return res.status(404).json({ message: "One or more rooms not found" });
        }

        const conflictingBookings = await Booking.find({
            rooms: { $in: roomObjectIds },
            status: { $ne: "cancelled" },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
        }).select("rooms checkIn checkOut");


        if (conflictingBookings.length > 0) {
            return res.status(400).json({
                message: "One or more rooms already booked in this time"
            });
        }

        const roomTypeIds = roomDocs.map(r => r.roomTypeId);

        const roomTypes = await RoomType.find({
            _id: { $in: roomTypeIds }
        });

        const roomTypeMap = {};
        roomTypes.forEach(rt => {
            roomTypeMap[rt._id] = rt;
        });

        const rules = await PricingRule.find({
            roomTypeId: { $in: roomTypeIds }
        });

        let totalPrice = 0;

        for (const room of roomDocs) {

            const roomType = roomTypeMap[room.roomTypeId];

            if (!roomType || !roomType.basePrice) {
                return res.status(400).json({
                    message: "Invalid room type or base price"
                });
            }

            let currentDate = new Date(checkInDate);

            while (currentDate < checkOutDate) {

                let basePrice = Number(roomType.basePrice) || 0;
                let multiplier = 1;

                const matchedRule = rules.find(rule =>
                    rule.roomTypeId.toString() === room.roomTypeId.toString() &&
                    currentDate >= rule.startDate &&
                    currentDate <= rule.endDate
                );

                if (matchedRule && matchedRule.multiplier) {
                    multiplier = Number(matchedRule.multiplier) || 1;
                }

                const pricePerNight = basePrice * multiplier;

                if (isNaN(pricePerNight)) {
                    return res.status(500).json({
                        message: "Price calculation failed"
                    });
                }

                totalPrice += pricePerNight;

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        const booking = await Booking.create({
            customerId: req.user.id,
            rooms: roomObjectIds,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            price: totalPrice,
            status: "pending"
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error("Create booking error:", error);

        if (error.message.includes("Invalid roomId")) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: "Internal server error"
        });
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
            .populate("rooms")
            .populate("customerId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(bookings);

    } catch (error) {
        console.error("Get bookings error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};