import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import RoleModel from "../models/role.model";
import UserModel from "../models/user.model";
import { rolePermissions, AvailableRoles } from "../constants";

/**
 * Create new role
 */
const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;
  const { _id } = getUserFromRequest(req);

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  // Check if role name already exists
  const existingRole = await RoleModel.findOne({ name: name.toUpperCase() });
  if (existingRole) {
    throw new ApiError(409, "Role with this name already exists");
  }

  // Validate permissions structure - Allow any custom permission
  const providedPermissions = Object.keys(permissions || {});
  console.log("Creating role with permissions:", providedPermissions);

  // Validate that all permissions are boolean values
  if (permissions) {
    for (const [permission, value] of Object.entries(permissions)) {
      if (typeof value !== "boolean") {
        throw new ApiError(
          400,
          `Permission ${permission} must be a boolean value`
        );
      }
    }
  }

  const role = await RoleModel.create({
    name: name.toUpperCase(),
    description,
    permissions: permissions || {},
    createdBy: _id,
    updatedBy: _id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, role, "Role created successfully"));
});

/**
 * Get all roles
 */
const getAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await RoleModel.find({ isActive: true }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, roles, "Roles retrieved successfully"));
});

/**
 * Get role by ID
 */
const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role retrieved successfully"));
});

/**
 * Update role
 */
const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { name, description, permissions, isActive } = req.body;
  const { _id } = getUserFromRequest(req);

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  // Check if new name conflicts with existing role
  if (name && name !== role.name) {
    const existingRole = await RoleModel.findOne({
      name: name.toUpperCase(),
      _id: { $ne: roleId },
    });
    if (existingRole) {
      throw new ApiError(409, "Role with this name already exists");
    }
  }

  // Validate permissions if provided
  if (permissions) {
    const providedPermissions = Object.keys(permissions);

    // Validate that all permissions are boolean values
    for (const [permission, value] of Object.entries(permissions)) {
      if (typeof value !== "boolean") {
        throw new ApiError(
          400,
          `Permission ${permission} must be a boolean value`
        );
      }
    }
  }

  const updatedRole = await RoleModel.findByIdAndUpdate(
    roleId,
    {
      ...(name && { name: name.toUpperCase() }),
      ...(description && { description }),
      ...(permissions && { permissions }),
      ...(typeof isActive === "boolean" && { isActive }),
      updatedBy: _id,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRole, "Role updated successfully"));
});

/**
 * Delete role (soft delete)
 */
// const deleteRole = asyncHandler(async (req: Request, res: Response) => {
//   const { roleId } = req.params;
//   const { _id } = getUserFromRequest(req);

//   const role = await RoleModel.findById(roleId);
//   if (!role) {
//     throw new ApiError(404, "Role not found");
//   }

//   // Check if any users are using this role
//   const usersWithRole = await UserModel.countDocuments({ role: role.name });
//   if (usersWithRole > 0) {
//     throw new ApiError(
//       400,
//       `Cannot delete role. ${usersWithRole} users are currently using this role.`
//     );
//   }

//   await RoleModel.findByIdAndUpdate(roleId, {
//     isActive: false,
//     updatedBy: _id,
//   });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Role deleted successfully"));
// });

const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { _id } = getUserFromRequest(req);

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  const usersWithRole = await UserModel.countDocuments({ role: role.name });
  if (usersWithRole > 0) {
    throw new ApiError(
      400,
      `Cannot delete role. ${usersWithRole} users are currently using this role.`
    );
  }

  await RoleModel.findByIdAndDelete(roleId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Role permanently deleted successfully"));
});

/**
 * Assign role to user
 */
const assignRoleToUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const { _id } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  // Check if role exists (either built-in or custom)
  const isBuiltInRole = AvailableRoles.includes(role as any);
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (!isBuiltInRole && !customRole) {
    throw new ApiError(404, "Role not found");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Role assigned successfully"));
});

/**
 * Get users by role
 */
const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const users = await UserModel.find({ role })
    .select("-password -refreshToken")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments({ role });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Users retrieved successfully"
    )
  );
});

/**
 * Get role permissions
 */
const getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;

  // Check if it's a built-in role
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { role, permissions },
          "Role permissions retrieved successfully"
        )
      );
  }

  // Check custom role
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (!customRole) {
    throw new ApiError(404, "Role not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        role: customRole.name,
        permissions: customRole.permissions,
      },
      "Role permissions retrieved successfully"
    )
  );
});

export {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
  getUsersByRole,
  getRolePermissions,
};
