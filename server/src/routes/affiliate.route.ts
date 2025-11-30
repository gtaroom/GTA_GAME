import express from "express";
import {
  applyForPartnership,
  getApplicationStatus,
  getAffiliateDashboard,
  getAffiliateLink,
  getAffiliateDashboardPublic,
} from "../controllers/affiliate.controller";
import { verifyJWT, getLoggedInUserOrIgnore } from "../middlewares/auth-middleware";
import { apiLimiter } from "../middlewares/rate-limiters";

const affiliateRouter = express.Router();

// Public routes - no authentication required
affiliateRouter.post("/apply", getLoggedInUserOrIgnore, apiLimiter, applyForPartnership);
affiliateRouter.get("/dashboard-public", apiLimiter, getAffiliateDashboardPublic);

// Protected routes - require authentication
affiliateRouter.get("/status", verifyJWT, apiLimiter, getApplicationStatus);
affiliateRouter.get("/dashboard", verifyJWT, apiLimiter, getAffiliateDashboard);
affiliateRouter.get("/link", verifyJWT, apiLimiter, getAffiliateLink);

export default affiliateRouter;

