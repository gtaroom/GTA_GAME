import express from "express";
import {
  getReferralLink,
  getReferralStats,
  generateQRCode,
  validateReferralCode,
} from "../controllers/referral.controller";
import { verifyJWT } from "../middlewares/auth-middleware";
import { apiLimiter } from "../middlewares/rate-limiters";

const referralRouter = express.Router();

// Public route - validate referral code
referralRouter.get("/validate/:code", apiLimiter, validateReferralCode);

// Protected routes - require authentication
referralRouter.get("/link", verifyJWT, apiLimiter, getReferralLink);
referralRouter.get("/stats", verifyJWT, apiLimiter, getReferralStats);
referralRouter.post("/generate-qr", verifyJWT, apiLimiter, generateQRCode);

export default referralRouter;

