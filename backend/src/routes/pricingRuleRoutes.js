import express from "express";

import { createPricingRule, getPricingRules } from "../controllers/pricingRuleController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  // authorize("admin"),
  createPricingRule
);

router.get("/", getPricingRules);

export default router;