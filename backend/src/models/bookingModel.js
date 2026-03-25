import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  customerName: String,

  rooms: [
    {
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms"
      },
      roomTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roomtypes"
      },
      roomTypeName: String,
      pricePerNight: Number
    }
  ],

  checkIn: Date,
  checkOut: Date,

  nights: Number,

  totalPrice: Number,

  guests: Number,

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid"
  }

}, { timestamps: true },{versionKey: false });

export default mongoose.model("bookings", bookingSchema);