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

export default adminRouter;