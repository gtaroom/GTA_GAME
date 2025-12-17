import express from "express";
import {
  createGame,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
  getToken,
  getUserGameStatus,
  bulkAddGames,
  filterGames,
} from "../controllers/game.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { gameLimiter, sensitiveApiLimiter } from "../middlewares/rate-limiters";

const router = express.Router();

router.post("/create", sensitiveApiLimiter,verifyJWT,verifyPermission(["ADMIN"]), createGame);
router.post("/bulk-add", sensitiveApiLimiter, verifyJWT, verifyPermission(["ADMIN"]), bulkAddGames);

router.get("/", gameLimiter, getAllGames);
router.get("/filter", gameLimiter, filterGames);

router.get("/token", verifyJWT, gameLimiter, getToken);

router.get("/:id", gameLimiter, getGameById);

router.get("/:gameId/user-status", verifyJWT, gameLimiter, getUserGameStatus);

router.put("/:id", sensitiveApiLimiter,verifyJWT,verifyPermission(["ADMIN"]), updateGame);

router.delete("/:id", sensitiveApiLimiter,verifyJWT,verifyPermission(["ADMIN"]), deleteGame);

export default router;
