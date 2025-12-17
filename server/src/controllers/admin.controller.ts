import { Request, Response } from "express";
import GameModel from "../models/games.model";
import UserModel from "../models/user.model"
import RoleModel from "../models/role.model";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { AvailableRoles } from "../constants";

export const useDashboardStats = async (req: Request, res: Response) => {
    const Users = await UserModel.find().countDocuments();
    const SubscribedUsers = await UserModel.find({isOpted:true}).countDocuments();
    const totalGames = await GameModel.find().countDocuments();
    res.status(200).json(new ApiResponse(200,{totalUsers:Users,subscribedUsers:SubscribedUsers,totalGames:totalGames},"Dashboard Stats"))
}

export const RegistrationTrend=async (req: Request, res: Response) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }, // Filter users created in the last 30 days
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, trend, "Registration Trend"));
}

export const getUserMetrics=async (req: Request, res: Response) => {
    const totalUsers = await UserModel.countDocuments({});
    const emailVerifiedUsers = await UserModel.countDocuments({ isEmailVerified: true });
    const kycVerifiedUsers = await UserModel.countDocuments({ isKYC: true });
    const optedInUsers = await UserModel.countDocuments({ isOpted: true });
  
    const response =  [
      { name: "All Users", value: totalUsers },
      { name: "Email Verified Users", value: emailVerifiedUsers },
      { name: "KYC Verified Users", value: kycVerifiedUsers },
      { name: "Subscribed Users", value: optedInUsers },
    ];

    res.status(200).json(new ApiResponse(200,response,"User Metrics"))
};

/**
 * Get role statistics for admin dashboard
 */
export const getRoleStatistics = asyncHandler(async (req: Request, res: Response) => {
  // Get built-in role statistics
  const builtInRoleStats = await UserModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        _id: { $in: AvailableRoles }
      }
    }
  ]);

  // Get custom role statistics
  const customRoles = await RoleModel.find({ isActive: true });
  const customRoleStats = await UserModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        _id: { $nin: AvailableRoles }
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      builtInRoles: builtInRoleStats,
      customRoles: customRoleStats,
      totalCustomRoles: customRoles.length,
      totalBuiltInRoles: AvailableRoles.length,
    }, "Role statistics retrieved successfully")
  );
});

/**
 * Get admin dashboard overview
 */
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalGames,
    subscribedUsers,
    emailVerifiedUsers,
    kycVerifiedUsers,
    optedInUsers,
    totalRoles,
    recentUsers
  ] = await Promise.all([
    UserModel.countDocuments(),
    GameModel.countDocuments(),
    UserModel.countDocuments({ isOpted: true }),
    UserModel.countDocuments({ isEmailVerified: true }),
    UserModel.countDocuments({ isKYC: true }),
    UserModel.countDocuments({ isOpted: true }),
    RoleModel.countDocuments({ isActive: true }),
    UserModel.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  // Get registration trend for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const registrationTrend = await UserModel.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      overview: {
        totalUsers,
        totalGames,
        subscribedUsers,
        emailVerifiedUsers,
        kycVerifiedUsers,
        optedInUsers,
        totalRoles: totalRoles + AvailableRoles.length,
      },
      recentUsers,
      registrationTrend,
    }, "Admin dashboard data retrieved successfully")
  );
});

/**
 * Get system health status
 */
export const getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
  const healthChecks = {
    database: true,
    roles: true,
    users: true,
    games: true,
  };

  try {
    // Check database connection
    await UserModel.findOne().select("_id");
  } catch (error) {
    healthChecks.database = false;
  }

  try {
    // Check roles
    await RoleModel.findOne().select("_id");
  } catch (error) {
    healthChecks.roles = false;
  }

  try {
    // Check games
    await GameModel.findOne().select("_id");
  } catch (error) {
    healthChecks.games = false;
  }

  const isHealthy = Object.values(healthChecks).every(check => check);

  return res.status(200).json(
    new ApiResponse(200, {
      status: isHealthy ? "healthy" : "unhealthy",
      checks: healthChecks,
      timestamp: new Date().toISOString(),
    }, "System health check completed")
  );
});
  