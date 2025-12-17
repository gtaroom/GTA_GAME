import express from "express";
import { deletePrevMonthEntries, getEntries, selectWinner } from "../controllers/amoe.entry.controller";
import { asyncHandler } from "../utils/async-handler";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { sensitiveApiLimiter } from "../middlewares/rate-limiters";

export const amoeRouter = express.Router();

amoeRouter.get(
  "/",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  sensitiveApiLimiter,
  asyncHandler(getEntries)
);

amoeRouter.patch(
  "/winner/:entryId",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  sensitiveApiLimiter,
  asyncHandler(selectWinner)
);

amoeRouter.delete(
  "/delete-prev",
  verifyJWT,
  verifyPermission(["ADMIN"]),
  sensitiveApiLimiter,
  asyncHandler(deletePrevMonthEntries)
);
