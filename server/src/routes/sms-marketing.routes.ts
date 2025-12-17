import express from "express";
import { asyncHandler } from "../utils/async-handler";
import {
  getOptedInUsers,
  sendSms,
  getSmsStats,
  updateUserOptIn,
  sendTestSms,
} from "../controllers/sms-marketing.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";

const smsMarketingRouter = express.Router();

// All routes require authentication and admin permission
smsMarketingRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

// SMS Marketing routes
smsMarketingRouter.get("/opted-users", asyncHandler(getOptedInUsers));
smsMarketingRouter.post("/send-sms", asyncHandler(sendSms));
smsMarketingRouter.get("/stats", asyncHandler(getSmsStats));
smsMarketingRouter.post("/test-sms", asyncHandler(sendTestSms));
smsMarketingRouter.put("/opt-in/:userId", asyncHandler(updateUserOptIn));

export default smsMarketingRouter;
