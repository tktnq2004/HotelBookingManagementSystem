import Room from "../models/roomModel.js";

export const createRoom = async (req, res) => {
  try {

    const { roomNumber, roomTypeId, images } = req.body;

    if (!roomNumber || !roomTypeId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await Room.create({
      roomNumber,
      roomTypeId,
      images
    });

    res.status(201).json(room);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRooms = async (req, res) => {
  try {

    const rooms = await Room.find().populate("roomTypeId");

    res.json(rooms);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {

    const room = await Room.findById(req.params.id)
      .populate("roomTypeId");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRoom = async (req, res) => {
  try {

    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};