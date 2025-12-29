import express from "express";
import {
  applyForPartnership,
  getApplicationStatus,
  getAffiliateDashboard,
  getAffiliateLink,
  getAffiliateDashboardPublic,
} from "../controllers/affiliate.controller";
import {
  getAffiliateBalance,
  createWithdrawalRequest,
  getWithdrawalHistory,
} from "../controllers/affiliate-withdrawal.controller";
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

// Withdrawal routes (support both JWT and token-based access)
affiliateRouter.get("/withdrawal/balance", verifyJWT, apiLimiter, getAffiliateBalance);
affiliateRouter.post("/withdrawal/request", verifyJWT, apiLimiter, createWithdrawalRequest);
affiliateRouter.get("/withdrawal/history", verifyJWT, apiLimiter, getWithdrawalHistory);

// Public withdrawal routes (token-based access for public affiliates)
affiliateRouter.get("/withdrawal/balance-public", apiLimiter, getAffiliateBalance);
affiliateRouter.post("/withdrawal/request-public", apiLimiter, createWithdrawalRequest);
affiliateRouter.get("/withdrawal/history-public", apiLimiter, getWithdrawalHistory);

export default affiliateRouter;

