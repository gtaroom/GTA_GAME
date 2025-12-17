import jwt, { Secret } from "jsonwebtoken";
import { RoleType } from "../constants";
import User from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { getUserFromRequest } from "../utils/get-user";

interface DecodedToken {
  _id: string;
  email: string;
  name:string;
  role:RoleType;
  iat?:number;
  exp?: number;
}

export interface RefreshDecodedToken{
  _id:string;
  iat?:number;
  exp?: number;
}

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as DecodedToken;
    const user = await User.findById(decodedToken._id)
      .select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      )
      .lean();
// console.log(user)
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user; // Explicitly cast to the correct type
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedToken;

    const user = await User.findById(decodedToken._id)
      .select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      )
      .lean();

    req.user = user;
    next();
  } catch (error) {
    next(); // Fail silently with req.user being falsy
  }
});

export const verifyPermission = (roles: RoleType[] = []) =>
  asyncHandler(async (req, res, next) => {
    const {_id,role} = getUserFromRequest(req);
    if (!_id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });
