import express from "express";
import {
  sendPhoneVerificationOTP,
  verifyPhoneOTP,
  resendPhoneVerificationOTP,
} from "../controllers/otp.controller";
import { verifyJWT } from "../middlewares/auth-middleware";
import { authLimiter, sensitiveApiLimiter } from "../middlewares/rate-limiters";

const otpRouter = express.Router();

// Phone verification OTP routes
otpRouter.post(
  "/send-phone-verification",
  authLimiter,
  sendPhoneVerificationOTP
);
// otpRouter.post("/verify-phone", verifyJWT, sensitiveApiLimiter, verifyPhoneOTP);

otpRouter.post("/verify-phone", sensitiveApiLimiter, verifyPhoneOTP);

otpRouter.post(
  "/resend-phone-verification",
  authLimiter,
  resendPhoneVerificationOTP
);

export default otpRouter;
