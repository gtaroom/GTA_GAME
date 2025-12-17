import { Types } from 'mongoose';
import CouponModel, { CouponSchemaIn } from '../models/coupon.model';
import WalletModel from '../models/wallet.model';
import { ApiError } from '../utils/api-error';
import { generateRandomCode } from '../utils/helpers';
import transactionModel from '../models/transaction.model';

export class CouponService {
  // Create a new coupon
  static async createCoupon(data: Partial<CouponSchemaIn>) {
    try {
      // Generate a unique coupon code if not provided
      if (!data.code) {
        data.code = await this.generateUniqueCode();
      }

      const coupon = await CouponModel.create(data);
      return coupon;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(400, 'Coupon code already exists');
      }
      throw error;
    }
  }

  // Get all coupons with pagination and filters
  static async getCoupons(query: {
    page?: number;
    limit?: number;
    isActive?: boolean | undefined;
    search?: string;
  }) {
    const { page = 1, limit = 10, isActive, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (typeof isActive === 'boolean') {
      filter.isActive = isActive;
    }
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const [coupons, total] = await Promise.all([
      CouponModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username email'),
      CouponModel.countDocuments(filter)
    ]);

    return {
      coupons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get a single coupon by ID
  static async getCouponById(id: string) {
    const coupon = await CouponModel.findById(id)
      .populate('createdBy', 'username email');
    
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    return coupon;
  }

  // Get a coupon by code
  static async getCouponByCode(code: string) {
    const coupon = await CouponModel.findOne({ code: code.toUpperCase() })
      .populate('createdBy', 'username email');
    
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    return coupon;
  }

  // Update a coupon
  static async updateCoupon(id: string, data: Partial<CouponSchemaIn>) {
    const coupon = await CouponModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }

    return coupon;
  }

  // Delete a coupon
  static async deleteCoupon(id: string) {
    const coupon = await CouponModel.findByIdAndDelete(id);
    
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    return coupon;
  }

  // Redeem a coupon and add balance to wallet
  static async redeemCoupon(code: string, userId: Types.ObjectId) {
    const coupon = await this.getCouponByCode(code);
    console.log(coupon);
    // Validate coupon
    const validation = coupon.validateCoupon(userId);
    if (!validation.valid) {
      throw new ApiError(400, validation.message);
    }

    try {
      // Mark coupon as used
      await coupon.markAsUsed(userId);

      // Add balance to user's wallet
      const wallet = await WalletModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: coupon.amount } },
        { new: true }
      );

      if (!wallet) {
        throw new ApiError(404, 'Wallet not found');
      }

      await transactionModel.create({
        userId,
        walletId: wallet._id,
        type: 'coupon',
        amount: coupon.amount,
        currency: 'USD',
        status: 'completed',
      });

      return {
        coupon,
        amount: coupon.amount,
        newBalance: wallet.balance
      };
    } catch (error) {
      // If there's an error, we should try to revert the coupon usage
      try {
        await CouponModel.findOneAndUpdate(
          { code },
          { $pull: { usedBy: userId } }
        );
      } catch (revertError) {
        console.error('Error reverting coupon usage:', revertError);
      }
      throw error;
    }
  }

  // Generate a unique coupon code
  private static async generateUniqueCode(length: number = 8): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = generateRandomCode(length);
      const existingCoupon = await CouponModel.findOne({ code });
      if (!existingCoupon) {
        isUnique = true;
        return code;
      }
    }

    throw new ApiError(500, 'Failed to generate unique coupon code');
  }
} 