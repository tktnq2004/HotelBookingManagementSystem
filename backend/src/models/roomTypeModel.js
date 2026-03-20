import mongoose, { version } from "mongoose";

const roomTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String,

    basePrice: {
        type: Number,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    amenities: [String],
    
}, { versionKey: false });

export default mongoose.model("roomtypes", roomTypeSchema);