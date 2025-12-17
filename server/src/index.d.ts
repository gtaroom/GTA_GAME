import mongoose from "mongoose";
import {RoleType} from "./constants"

declare global {
  namespace Express {
    interface Request {
      user?:{
        _id:mongoose.Types.ObjectId;
        role:RoleType;
        email: string;
        name: {
          first: string;
          middle: string;
          last: string;
        };
      },
      sessionId: mongoose.Types.ObjectId;
    }
  }
}
export {};
