import PricingRule from "../models/pricingRuleModel.js";
import RoomType from "../models/roomTypeModel.js";

export const createPricingRule = async (req, res) => {
  try {
    const { name, roomTypeId, startDate, endDate, multiplier, priority } = req.body;

    if (!name || !roomTypeId || !startDate || !endDate || !multiplier) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end))
      return res.status(400).json({ message: "Invalid date format" });

    if (end < start)
      return res.status(400).json({ message: "Invalid date range" });

    if (multiplier <= 0)
      return res.status(400).json({ message: "Invalid multiplier" });

    const existingRule = await PricingRule.findOne({
      roomTypeId,
      isActive: true,
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (existingRule)
      return res.status(400).json({ message: "Overlapping pricing rule exists" });

    const rule = await PricingRule.create({
      name,
      roomTypeId,
      startDate: start,
      endDate: end,
      multiplier,
      priority: priority || 1
    });

    res.status(201).json({ data: rule });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPricingRules = async (req, res) => {
  try {
    const { roomTypeId, isActive } = req.query;
    const query = {};

    if (roomTypeId) query.roomTypeId = roomTypeId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const rules = await PricingRule.find(query)
      .populate("roomTypeId", "name basePrice")
      .sort({ priority: -1, startDate: 1 });

    res.json({ data: rules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findById(req.params.id)
      .populate("roomTypeId", "name basePrice");
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json({ data: rule });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePricingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roomTypeId, startDate, endDate, multiplier, priority, isActive } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (roomTypeId) updatedData.roomTypeId = roomTypeId;
    if (multiplier) updatedData.multiplier = multiplier;
    if (priority) updatedData.priority = priority;
    if (isActive !== undefined) updatedData.isActive = isActive;

    if (startDate) updatedData.startDate = new Date(startDate);
    if (endDate) updatedData.endDate = new Date(endDate);

    if (startDate || endDate) {
      const current = await PricingRule.findById(id);
      const start = updatedData.startDate || current.startDate;
      const end = updatedData.endDate || current.endDate;

      const overlap = await PricingRule.findOne({
        _id: { $ne: id },
        roomTypeId: updatedData.roomTypeId || current.roomTypeId,
        isActive: true,
        startDate: { $lt: end },
        endDate: { $gt: start }
      });
      if (overlap) return res.status(400).json({ message: "Overlapping pricing rule exists" });
    }

    const rule = await PricingRule.findByIdAndUpdate(id, updatedData, { returnDocument: "after", runValidators: true })
      .populate("roomTypeId", "name basePrice");

    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json({ data: rule });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const calculatePrice = async (req, res) => {
  try {
    const { roomTypeId, checkIn, checkOut } = req.query;

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0)
      return res.status(400).json({ message: "Invalid date range" });

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) return res.status(404).json({ message: "RoomType not found" });

    const rule = await PricingRule.findOne({
      roomTypeId,
      isActive: true,
      startDate: { $lte: new Date(checkOut) },
      endDate: { $gte: new Date(checkIn) }
    }).sort({ priority: -1 });

    const multiplier = rule?.multiplier || 1;
    const pricePerNight = Math.round(roomType.basePrice * multiplier);
    const totalPrice = pricePerNight * nights;

    res.json({
      data: {
        roomTypeId,
        basePrice: roomType.basePrice,
        multiplier,
        pricePerNight,
        nights,
        totalPrice,
        ruleName: rule?.name || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};