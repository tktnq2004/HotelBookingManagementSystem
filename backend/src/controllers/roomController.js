import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Room from "../models/roomModel.js";
import RoomType from "../models/roomTypeModel.js";
import Booking from "../models/bookingModel.js";
import PricingRule from "../models/pricingRuleModel.js";

export const createRoom = async (req, res) => {
  try {
    const { roomNumber, roomTypeId, images } = req.body;

    if (!roomNumber || !roomTypeId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomTypeId)) {
      return res.status(400).json({ message: "Invalid roomTypeId" });
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) return res.status(400).json({ message: "RoomType not found" });

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) return res.status(400).json({ message: "Room already exists" });

    const room = await Room.create({
      roomNumber,
      roomTypeId,
      images: images || []
    });

    res.status(201).json({ data: room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, roomTypeId, search, checkIn, checkOut } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const query = {};
    if (roomTypeId && mongoose.Types.ObjectId.isValid(roomTypeId))
      query.roomTypeId = roomTypeId;
    if (search)
      query.roomNumber = { $regex: search, $options: "i" };

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate("roomTypeId", "name basePrice capacity policy amenities")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Room.countDocuments(query),
    ]);

    // ── Không có dates ────────────────────────────────────
    if (!checkIn || !checkOut) {
      return res.json({
        data: rooms.map((room) => ({
          ...room.toObject(),
          isAvailable: true,
          displayPrice: {
            basePrice: room.roomTypeId?.basePrice || 0,
            finalPrice: room.roomTypeId?.basePrice || 0,
            hasPricing: false, nights: 0, totalPrice: 0, ruleName: null,
          },
        })),
        pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
      });
    }

    // ── Có dates → validate ───────────────────────────────
    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");

    if (checkInDate >= checkOutDate)
      return res.status(400).json({ message: "checkOut must be after checkIn" });

    const nights = Math.ceil((checkOutDate - checkInDate) / 86400000);

    const roomTypeIds = [...new Set(
      rooms
        .filter((r) => r.roomTypeId?._id)
        .map((r) => r.roomTypeId._id.toString())
    )];

    const [bookings, pricingRules] = await Promise.all([
      Booking.find({
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      }).select("rooms.roomId"),   // ← fix: đúng field
      PricingRule.find({
        roomTypeId: { $in: roomTypeIds },
        isActive: true,
        startDate: { $lte: checkOutDate },
        endDate: { $gte: checkInDate },
      }).sort({ priority: -1 }),
    ]);

    // ← fix: flatMap vì roomId nằm trong mảng rooms[]
    const bookedRoomIds = new Set(
      bookings.flatMap((b) => b.rooms.map((r) => r.roomId.toString()))
    );

    const pricingMap = {};
    for (const rule of pricingRules) {
      const key = rule.roomTypeId.toString();
      if (!pricingMap[key]) pricingMap[key] = rule;
    }

    // ── Map result ────────────────────────────────────────
    const result = rooms.map((room) => {
      const roomObj = room.toObject();
      const roomType = room.roomTypeId;

      // Guard — room không có roomType hợp lệ
      if (!roomType) {
        return {
          ...roomObj,
          isAvailable: !bookedRoomIds.has(roomObj._id.toString()),
          displayPrice: {
            basePrice: 0, finalPrice: 0, totalPrice: 0,
            nights, hasPricing: false, ruleName: null,
          },
        };
      }

      const rule = pricingMap[roomType._id.toString()];
      const multiplier = rule?.multiplier || 1;
      const pricePerNight = Math.round(roomType.basePrice * multiplier);

      return {
        ...roomObj,
        isAvailable: !bookedRoomIds.has(roomObj._id.toString()),
        displayPrice: {
          basePrice: roomType.basePrice,
          finalPrice: pricePerNight,
          totalPrice: pricePerNight * nights,
          nights,
          ruleName: rule?.name || null,
          hasPricing: multiplier !== 1,
        },
      };
    });

    res.json({
      data: result,
      pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const room = await Room.findById(id)
      .populate("roomTypeId", "name basePrice capacity policy amenities");

    if (!room)
      return res.status(404).json({ message: "Room not found" });

    // ── Không có dates ────────────────────────────────────
    if (!checkIn || !checkOut) {
      return res.json({
        data: { ...room.toObject(), pricing: null, availability: true }
      });
    }

    // ── Có dates → validate ───────────────────────────────
    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");
    const nights = Math.ceil((checkOutDate - checkInDate) / 86400000);

    if (nights <= 0)
      return res.status(400).json({ message: "Invalid date range" });

    const roomType = room.roomTypeId;

    // ── Parallel: pricing rule + availability ─────────────
    const [rule, conflict] = await Promise.all([
      PricingRule.findOne({
        roomTypeId: roomType._id,
        isActive: true,
        startDate: { $lte: checkOutDate },
        endDate: { $gte: checkInDate },
      }).sort({ priority: -1 }),
      Booking.findOne({
        "rooms.roomId": room._id,   // ← fix: đúng field
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      }),
    ]);

    const multiplier = rule?.multiplier || 1;
    const pricePerNight = Math.round(roomType.basePrice * multiplier);

    res.json({
      data: {
        ...room.toObject(),
        availability: !conflict,
        pricing: {
          basePrice: roomType.basePrice,
          multiplier,
          pricePerNight,
          nights,
          totalPrice: pricePerNight * nights,
          ruleName: rule?.name || null,
        },
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const adminRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      roomTypeId,
      search,
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const query = {};

    if (roomTypeId && mongoose.Types.ObjectId.isValid(roomTypeId)) {
      query.roomTypeId = roomTypeId;
    }

    if (search) {
      query.roomNumber = { $regex: search, $options: "i" };
    }

    const rooms = await Room.find(query)
      .populate("roomTypeId", "name basePrice capacity")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(query);

    const result = rooms.map((room) => {
      const roomObj = room.toObject();

      return {
        ...roomObj,
        basePrice: room.roomTypeId?.basePrice || 0,
        capacity: room.roomTypeId?.capacity || 0,
        roomTypeName: room.roomTypeId?.name || null,
      };
    });

    res.json({
      data: result,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("getRoomsAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomTypeId, images } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const updatedData = {};

    if (roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: id } });
      if (existingRoom) return res.status(400).json({ message: "Room number already exists" });
      updatedData.roomNumber = roomNumber;
    }

    if (roomTypeId) {
      if (!mongoose.Types.ObjectId.isValid(roomTypeId)) return res.status(400).json({ message: "Invalid roomTypeId" });
      const roomType = await RoomType.findById(roomTypeId);
      if (!roomType) return res.status(400).json({ message: "RoomType not found" });
      updatedData.roomTypeId = roomTypeId;
    }

    if (images) updatedData.images = images;

    const room = await Room.findByIdAndUpdate(id, updatedData, { returnDocument: "after", runValidators: true })
      .populate("roomTypeId", "name basePrice capacity policy amenities");

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ data: room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.images.forEach(img => {
      const fileName = img.split("/uploads/")[1];
      if (!fileName) return;
      const filePath = path.join(process.cwd(), "uploads", fileName);
      fs.unlink(filePath, (err) => {
        if (err) console.log("File delete error:", err);
      });
    });


    await Room.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const uploadRoomImages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid room id" });

    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });

    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    const room = await Room.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { returnDocument: "after" }
    );

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ data: room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const deleteRoomImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid room id" });
    if (!image) return res.status(400).json({ message: "Image is required" });

    const room = await Room.findByIdAndUpdate(
      id,
      { $pull: { images: image } },
      { returnDocument: "after" }
    );

    if (!room) return res.status(404).json({ message: "Room not found" });

    const fileName = image.replace("/uploads/", "");
    const filePath = path.join(process.cwd(), "uploads", fileName);
    fs.unlink(filePath, (err) => {
      if (err) console.log("File delete error:", err);
    });

    res.json({ data: room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete image failed" });
  }
};