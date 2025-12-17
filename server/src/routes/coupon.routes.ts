import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { verifyJWT } from '../middlewares/auth-middleware';
import { canManageCoupons } from '../middlewares/permission-middleware';

const router = Router();

// Admin routes
router.post(
  '/admin/create',
  verifyJWT,
  canManageCoupons,
  CouponController.createCoupon
);

router.get(
  '/admin/list',
  verifyJWT,
  canManageCoupons,
  CouponController.getCoupons
);

router.get(
  '/admin/:id',
  verifyJWT,
  canManageCoupons,
  CouponController.getCouponById
);

router.patch(
  '/admin/:id',
  verifyJWT,
  canManageCoupons,
  CouponController.updateCoupon
);

router.delete(
  '/admin/:id',
  verifyJWT,
  canManageCoupons,
  CouponController.deleteCoupon
);

// User routes
router.post(
  '/redeem',
  verifyJWT,
  CouponController.redeemCoupon
);

export default router; 