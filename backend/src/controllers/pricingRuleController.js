import PricingRule from "../models/pricingRuleModel.js";

export const createPricingRule = async (req, res) => {
  try {

    const { roomTypeId, startDate, endDate, multiplier } = req.body;

    if (!roomTypeId || !startDate || !endDate || !multiplier) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end < start) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    if (multiplier <= 0) {
      return res.status(400).json({ message: "Invalid multiplier" });
    }

    const existingRule = await PricingRule.findOne({
      roomTypeId,
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (existingRule) {
      return res.status(400).json({
        message: "Overlapping pricing rule exists"
      });
    }

    const rule = await PricingRule.create({
      roomTypeId,
      startDate: start,
      endDate: end,
      multiplier
    });

    res.status(201).json(rule);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPricingRules = async (req, res) => {
  try {

    const rules = await PricingRule
      .find()
      .populate("roomTypeId");

    res.json(rules);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};