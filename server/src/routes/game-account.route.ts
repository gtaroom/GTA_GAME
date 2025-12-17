import express from "express";
import {
  storeExistingGameAccount,
  requestNewGameAccount,
  getUserGameAccounts,
  getUserGameAccount,
  getUserAccountRequests,
  getAllAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
} from "../controllers/game-account.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { gameLimiter, sensitiveApiLimiter } from "../middlewares/rate-limiters";
import { canManageGames } from "../middlewares/permission-middleware";

const router = express.Router();

// User routes
router.post("/store-existing", verifyJWT, sensitiveApiLimiter, storeExistingGameAccount);
router.post("/request-new", verifyJWT, sensitiveApiLimiter, requestNewGameAccount);
router.get("/my-accounts", verifyJWT, gameLimiter, getUserGameAccounts);
router.get("/my-account/:gameId", verifyJWT, gameLimiter, getUserGameAccount);
router.get("/my-requests", verifyJWT, gameLimiter, getUserAccountRequests);

// Admin routes
router.get("/admin/requests", verifyJWT, canManageGames, getAllAccountRequests);
router.put("/admin/approve/:requestId", verifyJWT, canManageGames, sensitiveApiLimiter, approveAccountRequest);
router.put("/admin/reject/:requestId", verifyJWT, canManageGames, sensitiveApiLimiter, rejectAccountRequest);

export default router; 