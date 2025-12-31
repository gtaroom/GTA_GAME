/**
 * Referral API Module
 * Handles all referral-related API requests
 */

import { http } from './http';

export interface ReferralLinkResponse {
  success: boolean;
  data: {
    referralLink: string;
    referralCode: string;
  };
  message?: string;
}

export interface RecentReferral {
  _id: string;
  referredId: {
    _id: string;
    email: string;
    name: {
      first: string;
      middle?: string;
      last: string;
    };
  };
  status: string;
  createdAt: string;
}

export interface ReferralStatsResponse {
  success: boolean;
  data: {
    totalInvited: number;
    qualified: number;
    totalRewards: number;
    recentReferrals?: RecentReferral[];
  };
  message?: string;
}

export interface QRCodeResponse {
  success: boolean;
  data: {
    qrCodeData: string; // Base64 encoded QR code image
    qrCodeUrl?: string; // URL to QR code image
  };
  message?: string;
}

export interface ValidateReferralCodeResponse {
  success: boolean;
  data: {
    valid: boolean;
    code?: string;
  };
  message?: string;
}

/**
 * Get user's referral link
 */
export async function getReferralLink() {
  return http<ReferralLinkResponse>('/referral/link', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get referral statistics
 */
export async function getReferralStats() {
  return http<ReferralStatsResponse>('/referral/stats', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Generate QR code for referral link
 */
export async function generateReferralQR() {
  return http<QRCodeResponse>('/referral/generate-qr', {
    method: 'POST',
  });
}

/**
 * Validate referral code (public endpoint)
 */
export async function validateReferralCode(code: string) {
  return http<ValidateReferralCodeResponse>(`/referral/validate/${code}`, {
    method: 'GET',
  });
}

