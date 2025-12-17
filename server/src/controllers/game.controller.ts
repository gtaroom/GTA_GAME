import axios from "axios";
import { Request, Response } from 'express';
import fs from "fs";
import NodeCache from 'node-cache';
import path from 'path';
import GameModel from '../models/games.model';
import UserGameAccountModel from '../models/user-game-account.model';
import GameAccountRequestModel from '../models/game-account-request.model';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';
import { getUserFromRequest } from "../utils/get-user";

const cache = new NodeCache({ stdTTL: 86400 });


async function checkIframeSupport(url: string): Promise<string | null> {
  try {
    const response = await axios.head(url);
    const xFrameOptions = response.headers["x-frame-options"];
    const contentSecurityPolicy = response.headers["content-security-policy"];

    if (xFrameOptions && /deny|sameorigin/i.test(xFrameOptions)) {
      // console.log("X-Frame-Options prevents embedding");
      return "er";
    }

    if (contentSecurityPolicy && contentSecurityPolicy.includes("frame-ancestors 'none'")) {
      // console.log("Content Security Policy prevents embedding");
      return "re";
    }

    return "allow"; // Supports iframe
  } catch (error) {
    console.error("Error checking iframe support:", error);
    return null;
  }
}

const sanitizeName = (name: string) =>
  name.toLowerCase().replace(/[\s-_]/g, "");
// Create a game
export const createGame = asyncHandler(async (req: Request, res: Response) => {
  const { name, link, creds } = req.body;

  if (!name || !link) {
    throw new ApiError(400, "All fields are required");
  }

  // Check iframe support
  const type = req.body.type || await checkIframeSupport(link);
  // console.log(type, "TYPE");

  // Path to games folder
  const gamesFolder = path.join(__dirname, "../../public/games");

  // Read all files in the directory
  const files = fs.readdirSync(gamesFolder);

  // Sanitize game name
  const sanitizedName = sanitizeName(name);

  // Find a matching file
  const matchedFile = files.find((file) => sanitizeName(path.parse(file).name) === sanitizedName);

  // Construct image URL if a match is found
  const imageUrl = matchedFile
    ? `/public/games/${matchedFile}`
    : null;

  const newGame = new GameModel({
    name,
    link,
    creds,
    type,
    image: imageUrl, // Save image URL if matched
  });

  await newGame.save();
  cache.flushAll();
  return res.status(201).json(new ApiResponse(201, newGame, "Game created successfully"));
});
// Get all games with pagination and search
export const getAllGames = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 100, search = "" } = req.query;


  // Convert to number and ensure they are valid
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      throw new ApiError(400, "Invalid pagination parameters");
  }

  const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

  // Calculate skip value for pagination
  const skip = (pageNumber - 1) * limitNumber;

  // Fetch games with pagination and search query
  let games = await GameModel.find(searchQuery)
      .skip(skip)
      .limit(limitNumber)
      .select("-creds -createdAt -updatedAt");

  const totalGames = await GameModel.countDocuments(searchQuery);

  // Sort games: Push 'Web Only' games to the end
  games = games.sort((a, b) => (a.type === "Web Only" ? 1 : b.type === "Web Only" ? -1 : 0));

  // Calculate total pages
  const totalPages = Math.ceil(totalGames / limitNumber);

  const responseData = {
      games,
      pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalPages,
          totalGames
      }
  };


  return res.status(200).json(
      new ApiResponse(200, responseData)
  );
});

// Get a single game by ID
export const getGameById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const game = await GameModel.findById(id);

  if (!game) {
    throw new ApiError(404, `Game with id ${id} not found`);
  }

  return res.status(200).json(new ApiResponse(200, game));
});

// Update a game
export const updateGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, link, creds } = req.body;

  const game = await GameModel.findByIdAndUpdate(id, { name, link, creds }, { new: true });

  if (!game) {
    throw new ApiError(404, `Game with id ${id} not found`);
  }
  cache.flushAll();
  return res.status(200).json(new ApiResponse(200, game, 'Game updated successfully'));
});

// Delete a game
export const deleteGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const game = await GameModel.findByIdAndDelete(id);

  if (!game) {
    throw new ApiError(404, `Game with id ${id} not found`);
  }
  cache.flushAll();
  return res.status(200).json(new ApiResponse(200, null, 'Game deleted successfully'));
});


export const getToken=asyncHandler(async(req:Request,res:Response)=>{
  const token =
  req.cookies?.accessToken ||
  req.header("Authorization")?.replace("Bearer ", "");
return res.status(200).json(new ApiResponse(200,{token}));
});

// Bulk add games
export const bulkAddGames = asyncHandler(async (req: Request, res: Response) => {
  const { games } = req.body;
  if (!Array.isArray(games) || games.length === 0) {
    throw new ApiError(400, 'Games array is required');
  }

  // Allowed types (for validation, if needed)
  const allowedTypes = ['allow', 'bonus', 'exclusive', 'download', 'web only', 'owned'];

  const addedGames = [];
  for (const game of games) {
    let { name, link, type } = game;
    if (!name || !link) continue;

    // Remove query params from link
    link = link.split('?')[0];

    // If type is not provided, set to 'owned' (since these are your own games)
    if (!type || !allowedTypes.includes(type)) {
      type = 'owned';
    }

    const newGame = new GameModel({
      name,
      link,
      type,
      image: '', // No image for now
      creds: { username: '', password: '' }, // No creds for now
    });
    await newGame.save();
    addedGames.push(newGame);
  }

  res.status(201).json(new ApiResponse(201, addedGames, 'Games added successfully'));
});

// Get user's game account status for a specific game
export const getUserGameStatus = asyncHandler(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { _id:userId } = getUserFromRequest(req);

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }
console.log(gameId,"GAME ID");
  // Check if game exists
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new ApiError(404, "Game not found");
  }

  // Check if user has an account for this game
  const userAccount = await UserGameAccountModel.findOne({ userId, gameId });
  
  // Check if user has a pending request for this game
  const pendingRequest = await GameAccountRequestModel.findOne({ 
    userId, 
    gameId, 
    status: 'pending' 
  });

  const response = {
    gameId,
    gameName: game.name,
    hasAccount: !!userAccount,
    hasExistingAccount: userAccount?.hasExistingAccount || false,
    isCredentialsStored: userAccount?.isCredentialsStored || false,
    hasPendingRequest: !!pendingRequest,
    accountDetails: userAccount ? {
      username: userAccount.username,
      hasExistingAccount: userAccount.hasExistingAccount,
      isCredentialsStored: userAccount.isCredentialsStored
    } : null
  };

  return res.status(200).json(
    new ApiResponse(200, response, "Game account status retrieved successfully")
  );
});

// Filter games by tag/types/type with search and pagination (optimized)
export const filterGames = asyncHandler(async (req: Request, res: Response) => {
  const {
    tag,
    types,
    type,
    search = "",
    page = 1,
    limit = 100,
    sort = "name:asc",
  } = req.query as Record<string, string>;

  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid pagination parameters");
  }
  const cacheKey = JSON.stringify({
    k: "filterGames",
    tag,
    types,
    type,
    search,
    page: pageNumber,
    limit: limitNumber,
    sort,
  });

  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(new ApiResponse(200, cached));
  }

  const query: Record<string, any> = {};

  if (tag) {
    query.tag = tag;
  }

  if (type) {
    // legacy single type support
    query.type = type;
  }

  if (types) {
    const typesArray = types
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (typesArray.length > 0) {
      query.types = { $in: typesArray };
    }
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;

  // Sort parse: e.g., name:asc or createdAt:desc
  let sortObj: Record<string, 1 | -1> = {};
  if (typeof sort === "string" && sort.includes(":")) {
    const [field, dir] = sort.split(":");
    sortObj[field] = dir?.toLowerCase() === "desc" ? -1 : 1;
  } else if (typeof sort === "string" && sort.length > 0) {
    sortObj[sort] = 1;
  } else {
    sortObj = { name: 1 };
  }

  const [items, total] = await Promise.all([
    GameModel.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .select("-creds -createdAt -updatedAt")
      .lean(),
    GameModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNumber);
  const payload = {
    games: items,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      totalGames: total,
    },
  };

  cache.set(cacheKey, payload);
  return res.status(200).json(new ApiResponse(200, payload));
});