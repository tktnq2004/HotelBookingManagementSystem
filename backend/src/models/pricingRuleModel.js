import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roomtypes",
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.startDate;
      },
      message: "endDate must be greater than startDate"
    }
  },

  multiplier: {
    type: Number,
    required: true,
    min: 0.1,
    max: 10,
  },

  priority: {
    type: Number,
    default: 1
  },

  isActive: { type: Boolean, default: true }

}, { timestamps: true, versionKey: false });

pricingRuleSchema.index({ roomTypeId: 1, startDate: 1, endDate: 1 });

export default mongoose.model("pricingrules", pricingRuleSchema);