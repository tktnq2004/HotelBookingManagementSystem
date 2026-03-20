import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    }
  ],

  checkIn: {
    type: Date,
    required: true
  },

  checkOut: {
    type: Date,
    required: true
  },

  guests: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },

  specialRequest: String

}, { timestamps: true, versionKey: false });

export default mongoose.model("Booking", bookingSchema);