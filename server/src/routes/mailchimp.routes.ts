import express from "express";
import { asyncHandler } from "../utils/async-handler";
import {
  getUserSegments,
  sendIndividualEmail,
  sendEmailCampaign,
  getEmailHistory,
} from "../controllers/mailchimp.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";

const mailchimpRouter = express.Router();

// All routes require authentication and admin permission
mailchimpRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

// Mailchimp routes
mailchimpRouter.get("/segments", asyncHandler(getUserSegments));
mailchimpRouter.post("/send-individual", asyncHandler(sendIndividualEmail));
mailchimpRouter.post("/send-campaign", asyncHandler(sendEmailCampaign));
mailchimpRouter.get("/history", asyncHandler(getEmailHistory));

export default mailchimpRouter;
