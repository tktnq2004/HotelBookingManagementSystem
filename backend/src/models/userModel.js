import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  phone: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },
  refreshToken: { type: String, default: null }

}, { versionKey: false });

export default mongoose.model("users", userSchema);