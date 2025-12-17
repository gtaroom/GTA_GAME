import express from 'express';
import { asyncHandler } from '../utils/async-handler';
import { 
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
  getUsersByRole,
  getRolePermissions,
} from '../controllers/role.controller';
import { verifyJWT, verifyPermission } from '../middlewares/auth-middleware';
import { canManageRoles } from '../middlewares/permission-middleware';
import { adminLimiter } from '../middlewares/rate-limiters';

const roleRouter = express.Router();

roleRouter.use(verifyJWT)
roleRouter.get("/users/:role", asyncHandler(getUsersByRole));
roleRouter.get("/permissions/:role", asyncHandler(getRolePermissions));
roleRouter.get("/", asyncHandler(getAllRoles));

// Apply authentication and role management permission
roleRouter.use(verifyJWT, canManageRoles, adminLimiter);

// Role management routes
roleRouter.post("/", asyncHandler(createRole));
roleRouter.get("/:roleId", asyncHandler(getRoleById));
roleRouter.put("/:roleId", asyncHandler(updateRole));
roleRouter.delete("/:roleId", asyncHandler(deleteRole));

// Role assignment routes
roleRouter.post("/assign/:userId", asyncHandler(assignRoleToUser));


export default roleRouter; 