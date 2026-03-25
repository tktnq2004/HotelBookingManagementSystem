import mongoose, { version } from "mongoose";

const roomTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    basePrice: {
        type: Number,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    amenities: [String],

    policy: {
    cancellation: {
      type: String,
      enum: ["free", "partial", "non-refundable"],
      default: "free"
    },
    cancelDeadlineHours: { type: Number, default: 24 }, 
    refundPercent: { type: Number, default: 100 },      
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "12:00" },
    extraGuestFee: { type: Number, default: 0 },        
  }

}, { versionKey: false });

export default mongoose.model("roomtypes", roomTypeSchema);