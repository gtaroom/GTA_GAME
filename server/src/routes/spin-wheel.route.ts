import express from "express";
import {
  performSpin,
  claimSpinReward,
  getSpinHistory,
  getSpinWheelConfig,
  checkSpinEligibility,
  validateSpinWheelConfig,
  getSpinWheelStats,
  getSpinWheelConfigAdmin,
  updateSpinWheelConfig,
} from "../controllers/spin-wheel.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";

const spinWheelRouter = express.Router();

// Public routes
spinWheelRouter.get("/config", getSpinWheelConfig);

// User routes (protected)
spinWheelRouter.get("/eligibility", verifyJWT, checkSpinEligibility);
spinWheelRouter.post("/spin", verifyJWT, performSpin);
spinWheelRouter.post("/claim", verifyJWT, claimSpinReward);
spinWheelRouter.get("/history", verifyJWT, getSpinHistory);

// Admin routes (admin only)
spinWheelRouter.get(
  "/admin/config",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  getSpinWheelConfigAdmin
);
spinWheelRouter.put(
  "/admin/config",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  updateSpinWheelConfig
);
spinWheelRouter.get(
  "/admin/validate-config",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  validateSpinWheelConfig
);
spinWheelRouter.get(
  "/admin/stats",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  getSpinWheelStats
);

export default spinWheelRouter;
