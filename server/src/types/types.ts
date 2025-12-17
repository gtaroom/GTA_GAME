import { NextFunction, Request, Response } from "express";
import Mailgen from "mailgen";
import { RoleType } from "../constants";
import http from "http"
export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export interface MailOptions {
  email: string;
  subject: string;
  mailgenContent: Mailgen.Content | string;
}

export interface MailOptions2 {
  email: string;
  subject: string;
  mailgenContent: string
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: RoleType;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
 
export interface CustomRequest extends http.IncomingMessage, Express.Request{
  user?:{
    _id:string;
    role:string
  }
}