import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";
import PricingRule from "../models/pricingRuleModel.js";
import RoomType from "../models/roomTypeModel.js";

export const createBooking = async (req, res) => {
  try {
    const { rooms, checkIn, checkOut, guests } = req.body;

    if (!rooms?.length || !checkIn || !checkOut || !guests)
      return res.status(400).json({ message: "Missing required fields" });

    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");

    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate)
      return res.status(400).json({ message: "Invalid date range" });

    const nights = Math.ceil((checkOutDate - checkInDate) / 86400000);

    const conflict = await Booking.findOne({
      "rooms.roomId": { $in: rooms },
      status: { $ne: "cancelled" },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflict) return res.status(400).json({ message: "Room already booked" });

    const roomDocs = await Room.find({ _id: { $in: rooms } });
    const roomTypeIds = [...new Set(roomDocs.map(r => r.roomTypeId.toString()))];

    const [roomTypes, rules] = await Promise.all([
      RoomType.find({ _id: { $in: roomTypeIds } }),
      PricingRule.find({
        roomTypeId: { $in: roomTypeIds },
        isActive: true,
        startDate: { $lte: checkOutDate },
        endDate: { $gte: checkInDate },
      }),
    ]);

    const roomTypeMap = new Map(roomTypes.map(rt => [rt._id.toString(), rt]));
    let totalPrice = 0;
    const roomDetails = [];

    for (const room of roomDocs) {
      const rt = roomTypeMap.get(room.roomTypeId.toString());
      let roomTotal = 0;
      let lastRule = null;
      let current = new Date(checkInDate);

      while (current < checkOutDate) {
        const rule = rules.find(r =>
          r.roomTypeId.toString() === room.roomTypeId.toString() &&
          current >= r.startDate && current <= r.endDate
        );

        if (rule) lastRule = rule;
        roomTotal += Number(rt.basePrice) * (rule ? Number(rule.multiplier) : 1);
        current.setDate(current.getDate() + 1);
      }

      totalPrice += roomTotal;
      roomDetails.push({
        roomId: room._id,
        roomNumber: room.roomNumber,
        roomTypeId: room.roomTypeId,
        roomTypeName: rt.name,
        basePrice: rt.basePrice,
        pricePerNight: Math.round(roomTotal / nights),
        images: room.images[0] || "",

        appliedRules: lastRule ? {
          ruleId: lastRule._id,
          ruleName: lastRule.name,
          multiplier: lastRule.multiplier,
          startDate: lastRule.startDate,
          endDate: lastRule.endDate,
        } : null,
      });
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      rooms: roomDetails,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      totalPrice: Math.round(totalPrice),
      guests,
    });

    res.status(201).json({ data: booking });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const query = req.user.role !== "admin" ? { customerId: req.user.id } : {};
    const bookings = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("rooms.roomId", "roomNumber")
      .sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.customerId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    booking.status = "cancelled";
    await booking.save();
    res.json({ data: booking });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "confirmed", "cancelled"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: "Status updated successfully",
      data: booking
    });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};