import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({

  roomNumber: {
    type: Number,
    required: true,
    unique: true
  },

  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: true
  },

  images: [String]

}, { versionKey: false });

export default mongoose.model("rooms", roomSchema);