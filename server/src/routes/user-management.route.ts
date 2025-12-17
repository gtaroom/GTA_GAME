import express from "express";
import { asyncHandler } from "../utils/async-handler";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkAssignRole,
  getUserStatistics,
  searchUsers,
} from "../controllers/user-management.controller";
import { verifyJWT } from "../middlewares/auth-middleware";
import {
  canViewUsers,
  canEditUsers,
  canManageUser,
  checkPermission,
} from "../middlewares/permission-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";

const userManagementRouter = express.Router();

// Apply authentication and rate limiting
userManagementRouter.use(verifyJWT, adminLimiter);

// User management routes (require view permission)
userManagementRouter.get("/", canViewUsers, asyncHandler(getAllUsers));
userManagementRouter.get("/search", canViewUsers, asyncHandler(searchUsers));
userManagementRouter.get(
  "/statistics",
  checkPermission("canViewAnalytics"),
  asyncHandler(getUserStatistics)
);
userManagementRouter.get("/:userId", canViewUsers, asyncHandler(getUserById));

// User creation (admin only)
userManagementRouter.post(
  "/",
  checkPermission("canCreateUsers"),
  asyncHandler(createUser)
);

// User editing (require edit permission)
userManagementRouter.put("/:userId", canEditUsers, asyncHandler(updateUser));

// User deletion (admin only)
userManagementRouter.delete(
  "/:userId",
  checkPermission("canDeleteUsers"),
  asyncHandler(deleteUser)
);

// Bulk operations (admin only)
userManagementRouter.post(
  "/bulk-assign-role",
  checkPermission("canEditUsers"),
  asyncHandler(bulkAssignRole)
);

// Role-specific user routes
userManagementRouter.get(
  "/by-role/:role",
  canViewUsers,
  asyncHandler(getAllUsers)
);

export default userManagementRouter;
