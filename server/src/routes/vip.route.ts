import express from "express";
import {
  getVipStatus,
  getVipTiers,
  claimBirthdayBonus,
  checkBonusSpins,
  useBonusSpin,
  getRedemptionLimit,
  getAllVipUsers,
  setVipConfirmation,
  updateUserVipTier,
  getVipStatistics,
  updateBirthday,
  getBirthdayBonusInfo,
  getBirthdayBonusHistory,
  resetAllBirthdayBonusClaims,
} from "../controllers/vip.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";

const vipRouter = express.Router();

// User VIP routes (protected)
vipRouter.get("/status", verifyJWT, getVipStatus);
vipRouter.get("/tiers", verifyJWT, getVipTiers);
vipRouter.post("/birthday-bonus/claim", verifyJWT, claimBirthdayBonus);
vipRouter.get("/birthday-bonus/info", verifyJWT, getBirthdayBonusInfo);
vipRouter.get("/birthday-bonus/history", verifyJWT, getBirthdayBonusHistory);
vipRouter.get("/bonus-spins/check", verifyJWT, checkBonusSpins);
vipRouter.post("/bonus-spins/use", verifyJWT, useBonusSpin);
vipRouter.get("/redemption-limit", verifyJWT, getRedemptionLimit);
vipRouter.put("/birthday", verifyJWT, updateBirthday);

// Admin VIP routes (admin only)
vipRouter.get(
  "/admin/users",
  verifyJWT,
  verifyPermission(['ADMIN']),
  getAllVipUsers
);

vipRouter.put(
  "/admin/users/:userId/confirm",
  verifyJWT,
  verifyPermission(['ADMIN']),
  setVipConfirmation
);

vipRouter.post(
  "/admin/users/:userId/update-tier",
  verifyJWT,
  verifyPermission(['ADMIN']),
  updateUserVipTier
);

vipRouter.get(
  "/admin/statistics",
  verifyJWT,
  verifyPermission(['ADMIN']),
  getVipStatistics
);

vipRouter.post(
  "/admin/birthday-bonus/reset",
  verifyJWT,
  verifyPermission(['ADMIN']),
  resetAllBirthdayBonusClaims
);

export default vipRouter;

