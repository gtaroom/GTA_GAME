import express from 'express';
import { asyncHandler } from '../utils/async-handler';
import { verifyJWT } from '../middlewares/auth-middleware';
import { claimDailyBonus, claimDailySweepBonus, claimNewUserBonus } from '../controllers/bonus.controller';
import { bonusLimiter } from '../middlewares/rate-limiters';

const bonusRouter = express.Router();

// Bonus routes with daily bonus rate limiting
bonusRouter.post("/daily-bonus", verifyJWT, bonusLimiter, asyncHandler(claimDailyBonus));
bonusRouter.post("/sweep-daily-bonus", verifyJWT, bonusLimiter, asyncHandler(claimDailySweepBonus));
bonusRouter.post("/new-user-bonus", verifyJWT, bonusLimiter, asyncHandler(claimNewUserBonus));

export default bonusRouter;
