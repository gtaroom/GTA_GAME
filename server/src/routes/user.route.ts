import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUsersBalances,
  usersBalance,
  uploadAvatar,
  verifyEmail,
  verifyKYC,
  resetForgottenPassword,
  forgotPasswordRequest,
  updateProfile,
  getUser,
  updateUser,
  deleteUser,
  subscribeNotifications,
  unsubscribeNotifications,
  allUsers,
  notificationMails,
  handleSocialLogin,
  updateUserBalance,
  csvUserData,
  getUserBalance,
  updateUserExclusiveBalance,
  resendVerificationEmail,
} from "../controllers/user.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import {
  checkPermission,
  canViewUsers,
  canEditUsers,
  canDeleteUsers,
  canViewAnalytics,
} from "../middlewares/permission-middleware";
import passport from "passport";
import {
  authLimiter,
  sensitiveApiLimiter,
  apiLimiter,
} from "../middlewares/rate-limiters";
import { uploadAvatar as uploadAvatarMiddleware } from "../services/multer.service";
import { userLogger } from "../middlewares/user-logger";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteReadNotifications,
} from "../controllers/notification.controller";
import { getNotificationById } from "../controllers/notification.controller";
import { handleTwilioWebhook } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", userLogger, authLimiter, loginUser);
userRouter.post("/resend-verification-email", authLimiter, resendVerificationEmail);
userRouter.get("/verify-email/:verificationToken", authLimiter, verifyEmail);
userRouter.get("/verify-kyc-webhook", authLimiter, verifyKYC);
userRouter.post(
  "/reset-password/:resetToken",
  authLimiter,
  resetForgottenPassword
);
userRouter.post("/forgot-password", authLimiter, forgotPasswordRequest);
userRouter.route("/refresh-token").post(authLimiter, refreshAccessToken);

userRouter
  .route("/update-profile")
  .put(verifyJWT, sensitiveApiLimiter, updateProfile);

userRouter.post(
  "/change-password",
  verifyJWT,
  sensitiveApiLimiter,
  changeCurrentPassword
);
userRouter.post("/logout", verifyJWT, apiLimiter, logoutUser);
userRouter.get("/", verifyJWT, apiLimiter, getUser);
userRouter.get("/balance", verifyJWT, apiLimiter, getUserBalance);

// User management routes with role-based permissions
userRouter.put(
  "/update/:id",
  verifyJWT,
  canEditUsers, // Allow users with edit permissions
  apiLimiter,
  updateUser
);

userRouter.delete(
  "/delete/:id",
  verifyJWT,
  canDeleteUsers, // Allow users with delete permissions
  apiLimiter,
  deleteUser
);

userRouter.get("/csv-data", verifyJWT, canViewUsers, csvUserData); // Allow users with view permissions

userRouter.patch("/subscribe", verifyJWT, apiLimiter, subscribeNotifications);
userRouter.get("/unsubscribe", verifyJWT, apiLimiter, unsubscribeNotifications);

userRouter.get("/all", verifyJWT, canViewUsers, allUsers); // Allow users with view permissions
userRouter.post(
  "/notifications",
  verifyJWT,
  checkPermission("canViewAnalytics"),
  sensitiveApiLimiter,
  notificationMails
); // Allow users with analytics permissions

userRouter.route("/google").get(
  authLimiter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

userRouter
  .route("/google/callback")
  .get(authLimiter, passport.authenticate("google"), handleSocialLogin);

userRouter.post("/update-balance", verifyJWT, updateUserBalance);
userRouter.post(
  "/update-wallet-balance",
  verifyJWT,
  updateUserExclusiveBalance
);   // In progress yet and in test for exclusive games yet will be adding security tokens for it.
userRouter.put(
  "/update-balance/:userId",
  verifyJWT,
  canEditUsers,
  updateUsersBalances
); // Allow users with edit permissions
userRouter.get("/balances", verifyJWT, canViewUsers, usersBalance); // Allow users with view permissions

userRouter.post(
  "/upload-avatar",
  verifyJWT,
  uploadAvatarMiddleware,
  uploadAvatar
);

// Notification routes
userRouter.get("/notifications", verifyJWT, getNotifications);
userRouter.get("/notifications/:id", verifyJWT, getNotificationById);
userRouter.put("/notifications/:id/read", verifyJWT, markNotificationAsRead);
userRouter.put(
  "/notifications/read-all",
  verifyJWT,
  markAllNotificationsAsRead
);
userRouter.delete("/notifications/read", verifyJWT, deleteReadNotifications);

// Twilio Opt-Out Webhook
userRouter.post("/twilio-optout-webhook", handleTwilioWebhook);
export default userRouter;
