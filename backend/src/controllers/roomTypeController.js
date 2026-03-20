import RoomType from "../models/roomTypeModel.js";

export const createRoomType = async (req, res) => {
    try {

        const { name, basePrice, capacity, amenities } = req.body;

        if (!name || !basePrice || capacity === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (basePrice <= 0) {
            return res.status(400).json({ message: "Invalid base price" });
        }

        if (capacity <= 0) {
            return res.status(400).json({ message: "Invalid capacity" });
        }

        const roomType = await RoomType.create({
            name,
            basePrice,
            capacity,
            amenities
        });

        res.status(201).json(roomType);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRoomTypes = async (req, res) => {
    try {

        const roomTypes = await RoomType.find();

        res.json(roomTypes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};