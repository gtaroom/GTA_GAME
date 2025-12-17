import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RechargeRequestModel from '../models/recharge-request.model';
import UserModel from '../models/user.model';
import WalletModel from '../models/wallet.model';
import notificationService from '../services/notification.service';
import { SocketEvents } from '../types/socket.types';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';
import { getUserFromRequest } from '../utils/get-user';
import { sendEmail, sendEmailNotify, generateAdminNotificationContent, generateUserNotificationContent } from '../utils/mail';


// Create a new recharge request
export const createRechargeRequest = asyncHandler(async (req: Request, res: Response) => {
  let { gameName, amount, username } = req.body;
  const { _id: userId } = getUserFromRequest(req);

  if (!gameName) {
    throw new ApiError(400, "Game name is required");
  }

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  // Check if user has enough balance in wallet
  const wallet = await WalletModel.findOne({ userId });
  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

   amount = Number(amount) * 100; // Convert to gold coins

  if (wallet.balance < amount) {
    throw new ApiError(400, "Insufficient balance in wallet");
  }

  // Deduct amount from user's wallet
  wallet.balance -= amount;
  await wallet.save();

  // Create recharge request
  const rechargeRequest = await RechargeRequestModel.create({
    userId,
    gameName,
    amount,
    status: 'pending',
    username
  });

  // Get user details to send notification
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Send email notification to admin
  const adminContent = generateAdminNotificationContent(
    `New Game Deposit Request - ${gameName}`,
    {
      userName: `${user.name?.first || ''} ${user.name?.last || ''}`,
      userEmail: user.email,
      gameName: gameName,
      username: username,
      amount: amount,
      currency: wallet.currency,
      usdAmount: amount/100,
      requestId: rechargeRequest._id.toString(),
      status: 'Pending'
    },
    'recharge_request'
  );

  await sendEmailNotify({
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    subject: `New Game Deposit Request - ${gameName}`,
    mailgenContent: adminContent
  });

   // Send socket notification to all admins
  //  socketService.sendToAdmins(SocketEvents.RECHARGE_REQUEST, {
  //   id: uuidv4(),
  //   timestamp: new Date(),
  //   read: false,
  //   type: 'recharge_request',
  //   requestId: rechargeRequest._id.toString(),
  //   userId: user._id.toString(),
  //   userName: `${user.name?.first || ''} ${user.name?.last || ''}`,
  //   userEmail: user.email,
  //   amount: rechargeRequest.amount,
  //   gameName: rechargeRequest.gameName,
  //   username: rechargeRequest.username
  // });

  // Create recharge request notification for admins
  const rechargeNotification = {
    id: uuidv4(),
    timestamp: new Date(),
    read: false,
    type: 'recharge_request' as const,
    requestId: rechargeRequest._id.toString(),
    userId: user._id.toString(),
    userName: `${user.name?.first || ''} ${user.name?.last || ''}`,
    userEmail: user.email,
    amount: rechargeRequest.amount,
    gameName: rechargeRequest.gameName,
    username: rechargeRequest.username
  };

  // Send to admins with persistent storage
  await notificationService.sendNotification(
    'admin', // Special case for admin notifications
    SocketEvents.RECHARGE_REQUEST,
    rechargeNotification
  );

  return res.status(201).json(
    new ApiResponse(201, rechargeRequest, "Deposit request submitted successfully")
  );
});

// Get all recharge requests for the current user
export const getUserRechargeRequests = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { page = 1, limit = 10, status } = req.query;

  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { userId };
  if (status) {
    query.status = status;
  }

  const [rechargeRequests, total] = await Promise.all([
    RechargeRequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    RechargeRequestModel.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      rechargeRequests,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }, "Deposit requests retrieved successfully")
  );
});

// Get a single recharge request by ID
export const getRechargeRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { _id: userId } = getUserFromRequest(req);
  
  // Determine if user is admin (this will be checked by middleware for admin routes)
  const isAdmin = (req.user as any)?.role === 'ADMIN';
  
  const query = isAdmin ? { _id: id } : { _id: id, userId };
  
  const rechargeRequest = await RechargeRequestModel.findOne(query)
    .populate('userId', 'name email');

  if (!rechargeRequest) {
    throw new ApiError(404, "Deposit request not found");
  }

  return res.status(200).json(
    new ApiResponse(200, rechargeRequest, "Deposit request retrieved successfully")
  );
});

// Admin: Get all recharge requests (for admin dashboard)
export const getAllRechargeRequests = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const skip = (pageNumber - 1) * limitNumber;

  let query: any = {};
  
  if (status) {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(search as string, 'i');
    query = {
      ...query,
      gameName: { $regex: regex }
    };
  }

  const [rechargeRequests, total] = await Promise.all([
    RechargeRequestModel.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    RechargeRequestModel.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      rechargeRequests,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }, "All deposits requests retrieved successfully")
  );
});

// Admin: Approve a recharge request
export const approveRechargeRequest = asyncHandler(async (req: Request, res: Response) => {
  // Admin check should be handled by middleware
  const { id } = req.params;

  // Get the recharge request with populated user data
  const rechargeRequest = await RechargeRequestModel.findById(id)
    .populate('userId', 'email name');
    
  if (!rechargeRequest) {
    throw new ApiError(404, "Deposit request not found");
  }

  if (rechargeRequest.status !== 'pending') {
    throw new ApiError(400, `Deposit cannot be approved. Current status: ${rechargeRequest.status}`);
  }

  // Use the populated userId (which is now a User document)
  const userEmail = (rechargeRequest.userId as any).email;
  const userName = (rechargeRequest.userId as any).name;
  
  if (!userEmail) {
    throw new ApiError(404, "User email not found");
  }

  // Update request status
  rechargeRequest.status = 'approved';
  rechargeRequest.approvedAt = new Date();
  await rechargeRequest.save();

  // Send email to user confirming the recharge
  const userContent = generateUserNotificationContent(
    `Your Game Deposit for ${rechargeRequest.gameName} is Approved`,
    {
      userName: `${userName?.first || ''} ${userName?.last || ''}`,
      gameName: rechargeRequest.gameName,
      amount: rechargeRequest.amount,
      usdAmount: rechargeRequest.amount/100,
      gameCoins: rechargeRequest.amount/100,
      requestId: rechargeRequest._id.toString()
    },
    'recharge_approved'
  );

  await sendEmailNotify({
    email: userEmail,
    subject: `Your Game Deposit for ${rechargeRequest.gameName} is Approved`,
    mailgenContent: userContent
  });

  // Create status update notification
  const statusNotification = {
    id: uuidv4(),
    timestamp: new Date(),
    read: false,
    type: 'recharge_status_updated' as const,
    requestId: rechargeRequest._id.toString(),
    status: rechargeRequest.status,
    amount: rechargeRequest.amount,
    message: 'Your deposit request has been approved'
  };
  
  // Send to user with persistent storage
  await notificationService.sendNotification(
    rechargeRequest.userId._id.toString(),
    SocketEvents.RECHARGE_STATUS_UPDATED,
    statusNotification
  );

  return res.status(200).json(
    new ApiResponse(200, rechargeRequest, "Deposit request approved successfully")
  );
});

// Admin: Reject a recharge request
export const rejectRechargeRequest = asyncHandler(async (req: Request, res: Response) => {
  // Admin check should be handled by middleware
  const { id } = req.params;
  const { adminComment } = req.body;

  // Get the recharge request with populated user data
  const rechargeRequest = await RechargeRequestModel.findById(id)
    .populate('userId', 'email name _id');
    
  if (!rechargeRequest) {
    throw new ApiError(404, "Deposit request not found");
  }

  if (rechargeRequest.status !== 'pending') {
    throw new ApiError(400, `Deposit cannot be rejected. Current status: ${rechargeRequest.status}`);
  }

  // Use the populated userId (which is now a User document)
  const userEmail = (rechargeRequest.userId as any).email;
  const userName = (rechargeRequest.userId as any).name;
  const userId = (rechargeRequest.userId as any)._id;
  
  if (!userEmail) {
    throw new ApiError(404, "User email not found");
  }

  // Refund the amount to user's wallet
  const wallet = await WalletModel.findOne({ userId });
  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

  wallet.balance += rechargeRequest.amount;
  await wallet.save();

  // Update request status
  rechargeRequest.status = 'rejected';
  rechargeRequest.rejectedAt = new Date();
  rechargeRequest.adminComment = adminComment;
  await rechargeRequest.save();

  // Send email to user about the rejection
  const userContent = generateUserNotificationContent(
    `Your Game Deposit for ${rechargeRequest.gameName} was Rejected`,
    {
      userName: `${userName?.first || ''} ${userName?.last || ''}`,
      gameName: rechargeRequest.gameName,
      amount: rechargeRequest.amount,
      usdAmount: rechargeRequest.amount/100,
      reason: adminComment || "Not specified"
    },
    'recharge_rejected'
  );

  await sendEmailNotify({
    email: userEmail,
    subject: `Your Game Deposit for ${rechargeRequest.gameName} was Rejected`,
    mailgenContent: userContent
  });

  // Create status update notification
  const statusNotification = {
    id: uuidv4(),
    timestamp: new Date(),
    read: false,
    type: 'recharge_status_updated' as const,
    requestId: rechargeRequest._id.toString(),
    status: rechargeRequest.status,
    amount: rechargeRequest.amount,
    message: 'Your deposit request has been rejected'
  };
  
  // Send to user with persistent storage
  await notificationService.sendNotification(
    rechargeRequest.userId._id.toString(),
    SocketEvents.RECHARGE_STATUS_UPDATED,
    statusNotification
  );

  return res.status(200).json(
    new ApiResponse(200, rechargeRequest, "Deposit request rejected and amount refunded successfully")
  );
}); 