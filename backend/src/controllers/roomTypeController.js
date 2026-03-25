import RoomType from "../models/roomTypeModel.js";

export const createRoomType = async (req, res) => {
    try {
        const { name, basePrice, capacity, amenities, policy } = req.body;
        if (!name || !basePrice || capacity === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (basePrice <= 0) {
            return res.status(400).json({ message: "Invalid base price" });
        }
        if (capacity <= 0) {
            return res.status(400).json({ message: "Invalid capacity" });
        }

        if (policy?.refundPercent !== undefined) {
            if (policy.refundPercent < 0 || policy.refundPercent > 100)
                return res.status(400).json({ message: "refundPercent must be 0–100" });
        }
        if (policy?.cancelDeadlineHours !== undefined && policy.cancelDeadlineHours < 0) {
            return res.status(400).json({ message: "cancelDeadlineHours must be >= 0" });
        }

        const roomType = await RoomType.create({
            name, basePrice, capacity, amenities,
            policy  
        });
        res.status(201).json({ data: roomType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;

        const roomType = await RoomType.findByIdAndDelete(id);

        if (!roomType) {
            return res.status(404).json({ message: "RoomType not found" });
        }

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await RoomType.findByIdAndUpdate(
            id,
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "RoomType not found" });
        }

        res.json({ data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.find();
        res.json({
            data: roomTypes
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};