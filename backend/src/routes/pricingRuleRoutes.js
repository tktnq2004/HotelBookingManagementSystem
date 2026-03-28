import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  createPricingRule,
  getPricingRules,
  getPricingRule,
  updatePricingRule,
  deletePricingRule,
} from "../controllers/pricingRuleController.js";

const router = express.Router();

router.get("/", getPricingRules);                                         
router.get("/:id", getPricingRule);                                    
router.post("/", authenticate, authorize("admin"), createPricingRule);    
router.put("/:id", authenticate, authorize("admin"), updatePricingRule);  
router.delete("/:id", authenticate, authorize("admin"), deletePricingRule);

export default router;