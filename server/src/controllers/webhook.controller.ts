import UserModel from '../models/user.model';
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';

const EZTEXTING_WEBHOOK_SECRET = process.env.EZTEXTING_WEBHOOK_SECRET;

export const handleEztextingWebhook = async (req: Request, res: Response) => {
  const receivedSecret = req.headers['x-eztexting-signature'] || req.body.secret;
  if (EZTEXTING_WEBHOOK_SECRET && receivedSecret !== EZTEXTING_WEBHOOK_SECRET) {
    return res.status(401).json(new ApiError(401, 'Invalid webhook secret'));
  }

  const { phoneNumber, message } = req.body;
  if (!phoneNumber || !message) {
    return res.status(400).json(new ApiError(400, 'Missing data'));
  }

  const msg = message.trim().toUpperCase();

  if (msg === 'STOP' || msg === 'UNSUBSCRIBE') {
    await UserModel.findOneAndUpdate(
      { phone: phoneNumber },
      { isSmsOpted: false }
    );
  } else if (msg === 'START') {
    await UserModel.findOneAndUpdate(
      { phone: phoneNumber },
      { isSmsOpted: true }
    );
  }

  return res.status(200).json(new ApiResponse(200, null, 'Webhook processed'));
};
