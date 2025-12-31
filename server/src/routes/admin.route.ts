import express from 'express';
import { asyncHandler } from '../utils/async-handler';
import { 
  getUserMetrics, 
  RegistrationTrend, 
  useDashboardStats,
  getRoleStatistics,
  getAdminDashboard,
  getSystemHealth
} from '../controllers/admin.controller';
import {
  getAllAffiliates,
  getAffiliateById,
  approveAffiliate,
  rejectAffiliate,
  updateAffiliate,
  getAffiliateStats,
} from '../controllers/affiliate-admin.controller';
import {
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  markWithdrawalAsPaid,
  getWithdrawalStats,
} from '../controllers/affiliate-withdrawal-admin.controller';
import {
  simulateDeposit,
  getTestUserInfo,
  getReferralInfo,
  triggerReferralCheck,
  getAffiliateInfo,
  createReferralRecord,
} from '../controllers/test.controller';
import { verifyJWT, verifyPermission } from '../middlewares/auth-middleware';
import { adminLimiter } from '../middlewares/rate-limiters';

const adminRouter = express.Router();

adminRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

// Admin dashboard routes
adminRouter.get("/dashboard-stats", asyncHandler(useDashboardStats));
adminRouter.get("/reg-trend", asyncHandler(RegistrationTrend));
adminRouter.get("/user-mterics", asyncHandler(getUserMetrics));
adminRouter.get("/dashboard", asyncHandler(getAdminDashboard));
adminRouter.get("/role-statistics", asyncHandler(getRoleStatistics));
adminRouter.get("/system-health", asyncHandler(getSystemHealth));

// Affiliate management routes
adminRouter.get("/affiliates", asyncHandler(getAllAffiliates));
adminRouter.get("/affiliates/stats", asyncHandler(getAffiliateStats));
adminRouter.get("/affiliates/:id", asyncHandler(getAffiliateById));
adminRouter.post("/affiliates/:id/approve", asyncHandler(approveAffiliate));
adminRouter.post("/affiliates/:id/reject", asyncHandler(rejectAffiliate));
adminRouter.put("/affiliates/:id", asyncHandler(updateAffiliate));

// Affiliate withdrawal management routes
adminRouter.get("/affiliate/withdrawals", asyncHandler(getAllWithdrawalRequests));
adminRouter.get("/affiliate/withdrawals/stats", asyncHandler(getWithdrawalStats));
adminRouter.get("/affiliate/withdrawals/:id", asyncHandler(getWithdrawalRequestById));
adminRouter.post("/affiliate/withdrawals/:id/approve", asyncHandler(approveWithdrawalRequest));
adminRouter.post("/affiliate/withdrawals/:id/reject", asyncHandler(rejectWithdrawalRequest));
adminRouter.post("/affiliate/withdrawals/:id/mark-paid", asyncHandler(markWithdrawalAsPaid));

// Test routes (for testing affiliate/referral flow)
adminRouter.post("/test/simulate-deposit", asyncHandler(simulateDeposit));
adminRouter.post("/test/create-referral", asyncHandler(createReferralRecord));
adminRouter.post("/test/trigger-referral-check", asyncHandler(triggerReferralCheck));
adminRouter.get("/test/user-info", asyncHandler(getTestUserInfo));
adminRouter.get("/test/referral-info", asyncHandler(getReferralInfo));
adminRouter.get("/test/affiliate-info", asyncHandler(getAffiliateInfo));

export default adminRouter;