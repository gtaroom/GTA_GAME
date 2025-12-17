import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import UserModel from "../models/user.model";
import RoleModel from "../models/role.model";
import { AvailableRoles } from "../constants";
import bcrypt from "bcryptjs";

/**
 * Create a new user (Admin only)
 */
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role = "USER",
    phone,
    address,
    zipCode,
    city,
    state,
    gender,
    dob,
  } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Check if email already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Validate role
  const isBuiltInRole = AvailableRoles.includes(role as any);
  const customRole = await RoleModel.findOne({ name: role, isActive: true });

  if (!isBuiltInRole && !customRole) {
    throw new ApiError(400, "Invalid role");
  }
  const user = await UserModel.create({
    name: {
      first: firstName,
      last: lastName,
    },
    email,
    password,
    role,
    phone,
    address,
    zipCode,
    city,
    state,
    gender,
    dob,
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, "User created successfully"));
});

/**
 * Get all users with pagination and filters
 */
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    isEmailVerified,
    isPhoneVerified,
    isKYC,
    isOpted,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const filter: any = {};

  // Apply filters
  if (role) filter.role = role;
  if (isEmailVerified !== undefined)
    filter.isEmailVerified = isEmailVerified === "true";
  if (isPhoneVerified !== undefined)
    filter.isPhoneVerified = isPhoneVerified === "true";
  if (isKYC !== undefined) filter.isKYC = isKYC === "true";
  if (isOpted !== undefined) filter.isOpted = isOpted === "true";

  // Search functionality
  if (search) {
    filter.$or = [
      { "name.first": { $regex: search, $options: "i" } },
      { "name.last": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const users = await UserModel.find(filter)
    .select("-password -refreshToken")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments(filter);

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
 * Get user by ID
 */
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await UserModel.findById(userId).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

/**
 * Update user
 */
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If role is being updated, validate it
  if (updateData.role) {
    const isBuiltInRole = AvailableRoles.includes(updateData.role as any);
    const customRole = await RoleModel.findOne({
      name: updateData.role,
      isActive: true,
    });

    if (!isBuiltInRole && !customRole) {
      throw new ApiError(400, "Invalid role");
    }
  }

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

/**
 * Delete user (soft delete)
 */
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent deleting admin users
  if (user.role === "ADMIN") {
    throw new ApiError(403, "Cannot delete admin users");
  }

  await UserModel.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

/**
 * Bulk assign role to users
 */
const bulkAssignRole = asyncHandler(async (req: Request, res: Response) => {
  const { userIds, role } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "User IDs array is required");
  }

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  // Validate role
  const isBuiltInRole = AvailableRoles.includes(role as any);
  const customRole = await RoleModel.findOne({ name: role, isActive: true });

  if (!isBuiltInRole && !customRole) {
    throw new ApiError(400, "Invalid role");
  }

  const result = await UserModel.updateMany(
    { _id: { $in: userIds } },
    { role }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        modifiedCount: result.modifiedCount,
        totalRequested: userIds.length,
      },
      "Roles assigned successfully"
    )
  );
});

/**
 * Get user statistics
 */
const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await UserModel.countDocuments();
  const usersByRole = await UserModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const emailVerifiedUsers = await UserModel.countDocuments({
    isEmailVerified: true,
  });
  const phoneVerifiedUsers = await UserModel.countDocuments({
    isPhoneVerified: true,
  });
  const kycVerifiedUsers = await UserModel.countDocuments({ isKYC: true });
  const optedUsers = await UserModel.countDocuments({ isOpted: true });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        usersByRole,
        emailVerifiedUsers,
        phoneVerifiedUsers,
        kycVerifiedUsers,
        optedUsers,
      },
      "User statistics retrieved successfully"
    )
  );
});

/**
 * Search users
 */
const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const users = await UserModel.find({
    $or: [
      { "name.first": { $regex: query, $options: "i" } },
      { "name.last": { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
    ],
  })
    .select("-password -refreshToken")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments({
    $or: [
      { "name.first": { $regex: query, $options: "i" } },
      { "name.last": { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
    ],
  });

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
      "Search results retrieved successfully"
    )
  );
});

export {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkAssignRole,
  getUserStatistics,
  searchUsers,
};
