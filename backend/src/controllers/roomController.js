import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Room from "../models/roomModel.js";
import RoomType from "../models/roomTypeModel.js";

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
    const { page = 1, limit = 10, roomTypeId, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const query = {};

    if (roomTypeId && mongoose.Types.ObjectId.isValid(roomTypeId)) query.roomTypeId = roomTypeId;
    if (search) query.roomNumber = { $regex: search, $options: "i" };

    const rooms = await Room.find(query)
      .populate("roomTypeId", "name basePrice capacity")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(query);

    res.json({
      data: rooms,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

    const room = await Room.findById(id).populate("roomTypeId", "name basePrice capacity");
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({ data: room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
      .populate("roomTypeId", "name basePrice capacity");

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

// ==================== IMAGE UPLOAD/DELETE ====================
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