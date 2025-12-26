/**
 * Main Router Configuration File
 * This file serves as the central routing configuration for the application.
 * It imports and configures all route modules and applies necessary middleware.
 */

// Import Express framework
import express from "express";

// Import middleware for geographical access control
import { geoblock } from "../middlewares/geo-block";

// Import various route modules
import adminRouter from "./admin.route"; // Admin panel routes
import { amoeRouter } from "./amoe.entry.route"; // AMOE (Alternative Method of Entry) routes
import bonusRouter from "./bonus.route"; // Bonus and rewards routes
import couponRouter from "./coupon.routes"; // Coupon management routes
import cryptoRouter from "./crypto.route"; // Cryptocurrency related routes
import gameAccountRouter from "./game-account.route"; // Game account routes
import gameRouter from "./game.route"; // Game-related routes
import rechargeRequestRouter from "./recharge-request.route"; // Recharge request handling
import userRouter from "./user.route"; // User management routes
import walletRouter from "./wallet.route"; // Wallet operations routes
import withdrawalRequestRouter from "./withdrawal-request.route"; // Withdrawal request handling
import webhookRouter from "./webhook.route"; // Webhook routes
import otpRouter from "./otp.route"; // OTP verification routes
import roleRouter from "./role.route"; // Role management routes
import userManagementRouter from "./user-management.route"; // User management routes
import vipRouter from "./vip.route"; // VIP tier system routes
import spinWheelRouter from "./spin-wheel.route"; // Spin wheel routes
import migrationRouter from "./migration.routes";
import mailchimpRouter from "./mailchimp.routes"; // Email marketing routes
import twilioRouter from "./twilio.routes"; // SMS marketing routes
import legalRouter from "./legal.routes"; // Legal document management routes
import bannerRouter from "./banner.routes"; // Legal document management routes

// Create Express Router instance
const router = express.Router();

// Configure routes with their respective paths and middleware
router.use("/user", geoblock, userRouter); // User routes with geographical blocking
router.use("/games", gameRouter); // Game routes
router.use("/claim", bonusRouter); // Bonus claim routes
router.use("/admin", adminRouter); // Admin panel routes
router.use("/entries", amoeRouter); // AMOE entry routes
router.use("/wallet", walletRouter); // Wallet management routes
router.use("/withdrawal-requests", withdrawalRequestRouter); // Withdrawal request routes
router.use("/recharge-requests", rechargeRequestRouter); // Recharge request routes
router.use("/crypto", cryptoRouter); // Cryptocurrency routes
router.use("/coupons", couponRouter); // Coupon management routes
router.use("/game-accounts", gameAccountRouter); // Game account routes
router.use("/webhooks", webhookRouter); // Webhook endpoints
router.use("/otp", otpRouter); // OTP verification endpoints
router.use("/roles", roleRouter); // Role management endpoints
router.use("/user-management", userManagementRouter); // User management endpoints
router.use("/vip", vipRouter); // VIP tier system endpoints
router.use("/spin-wheel", spinWheelRouter); // Spin wheel endpoints
router.use("/email-marketing", mailchimpRouter); // Email marketing endpoints
router.use("/sms-marketing", twilioRouter); // SMS marketing endpoints
router.use("/legal", legalRouter); // Legal document management endpoints
router.use("/banners", bannerRouter);
// Add this line (temporarily)
// router.use("/api/v1/migration", migrationRouter);
// Export the configured router
export default router;
