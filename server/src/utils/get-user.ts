import { Request } from "express";
import mongoose from "mongoose";
import { RoleType } from "../constants";

interface ReqUser{
    _id:mongoose.Types.ObjectId;
    role:RoleType;
    email:string;
    [key: string]: any;
}

export const getUserFromRequest = (req: Request) => {
    const user = req.user as ReqUser;
  return user || null;
};