import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { CouponService } from '../services/coupon.service';
import { validateCouponInput } from '../validators/coupon.validator';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { getUserFromRequest } from '../utils/get-user';

export class CouponController {
  // Admin Controllers
  static createCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = validateCouponInput(req.body);
    const { _id: userId } = getUserFromRequest(req);
    const coupon = await CouponService.createCoupon({
      ...validatedData,
      createdBy: new Types.ObjectId(userId)
    });

    return res.status(201).json(
      new ApiResponse(201, coupon, 'Coupon created successfully')
    );
  });

  static getCoupons = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, isActive, search } = req.query;
    const result = await CouponService.getCoupons({
      page: Number(page),
      limit: Number(limit),
      isActive: isActive ? isActive === 'true' : undefined,
      search: search as string
    });

    return res.status(200).json(
      new ApiResponse(200, result, 'Coupons retrieved successfully')
    );
  });

  static getCouponById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const coupon = await CouponService.getCouponById(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, coupon, 'Coupon retrieved successfully')
    );
  });

  static updateCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = validateCouponInput(req.body);
    const coupon = await CouponService.updateCoupon(req.params.id, validatedData);

    return res.status(200).json(
      new ApiResponse(200, coupon, 'Coupon updated successfully')
    );
  });

  static deleteCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await CouponService.deleteCoupon(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, null, 'Coupon deleted successfully')
    );
  });

  // User Controllers
  static redeemCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const { _id: userId } = getUserFromRequest(req);
    const result = await CouponService.redeemCoupon(code, new Types.ObjectId(userId));

    return res.status(200).json(
      new ApiResponse(200, result, 'Coupon redeemed successfully')
    );
  });
} 