import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({

  roomNumber: {
    type: String,
    required: true,
    unique: true
  },

  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roomtypes",
    required: true
  },

  images: [String]

}, { versionKey: false });

export default mongoose.model("rooms", roomSchema);