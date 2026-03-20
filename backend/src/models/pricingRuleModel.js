import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema({

  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  multiplier: {
    type: Number,
    required: true
  }

},{ versionKey: false });

export default mongoose.model("pricingrule", pricingRuleSchema);