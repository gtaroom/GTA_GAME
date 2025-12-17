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

export default adminRouter;