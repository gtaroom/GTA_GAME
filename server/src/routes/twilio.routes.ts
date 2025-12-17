import express from "express";
import { asyncHandler } from "../utils/async-handler";
import {
  getUserSegments,
  sendIndividualSms,
  sendBulkSms,
  getSmsHistory,
} from "../controllers/twilio.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";

const twilioRouter = express.Router();

// All routes require authentication and admin permission
twilioRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

// Twilio routes
twilioRouter.get("/segments", asyncHandler(getUserSegments));
twilioRouter.post("/send-individual", asyncHandler(sendIndividualSms));
twilioRouter.post("/send-bulk", asyncHandler(sendBulkSms));
twilioRouter.get("/history", asyncHandler(getSmsHistory));

export default twilioRouter;
