import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  rooms: [
    {
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: "rooms" },
      roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "roomtypes" },
      roomNumber: String,
      roomTypeName: String,
      pricePerNight: Number,
      basePrice: Number,
      images: String,

      appliedRules:
      {
        ruleId: { type: mongoose.Schema.Types.ObjectId, ref: "pricingrules" },
        ruleName: String,
        multiplier: Number,
        startDate: Date,
        endDate: Date,
      }

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
  }

}, { timestamps: true, versionKey: false });

export default mongoose.model("bookings", bookingSchema);