/**
 * Affiliate API Module
 * Handles all affiliate-related API requests
 */

import { http } from './http';

export interface AffiliateApplyPayload {
  email: string;
  name: {
    first: string;
    last: string;
  };
  company?: string;
  website?: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  audienceSize?: string;
  promotionMethods?: string[];
}

export interface AffiliateApplyResponse {
  success: boolean;
  data?: {
    applicationId?: string;
  };
  message?: string;
}

export interface AffiliateStatusResponse {
  success: boolean;
  data: {
    hasApplication?: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    applicationDate?: string;
    rejectionReason?: string;
  };
  message?: string;
}

export interface AffiliateDashboardResponse {
  success: boolean;
  data: {
    affiliateLink: string;
    affiliateCode: string;
    totalReferrals: number;
    totalConversions: number;
    totalEarnings: number;
    pendingEarnings?: number;
    paidEarnings?: number;
    commissionRate: number;
    recentReferrals?: Array<{
      email: string;
      date: string;
      status: string;
      earnings?: number;
    }>;
  };
  message?: string;
}

export interface AffiliateLinkResponse {
  success: boolean;
  data: {
    affiliateLink: string;
    affiliateCode: string;
  };
  message?: string;
}

export interface PublicAffiliateDashboardResponse {
  success: boolean;
  data: {
    affiliate: {
      name: {
        first: string;
        last: string;
      };
      email: string;
      company?: string;
      affiliateCode: string;
      commissionRate: number;
    };
    affiliateLink: string;
    totalReferrals: number;
    qualifiedReferrals: number;
    totalEarnings: number;
    recentReferrals?: Array<{
      referredUser: {
        name: {
          first: string;
          middle?: string;
          last: string;
        };
        email: string;
      };
      status: string;
      totalSpent: number;
      referrerReward: number;
      qualifiedAt?: string;
      createdAt: string;
    }>;
    hasAccount: boolean;
  };
  message?: string;
}

/**
 * Submit partnership application
 */
export async function applyForAffiliate(payload: AffiliateApplyPayload) {
  return http<AffiliateApplyResponse>('/affiliate/apply', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Check application status (auth required)
 */
export async function getAffiliateStatus() {
  return http<AffiliateStatusResponse>('/affiliate/status', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get affiliate dashboard data (auth required, approved only)
 */
export async function getAffiliateDashboard() {
  return http<AffiliateDashboardResponse>('/affiliate/dashboard', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get affiliate link (auth required, approved only)
 */
export async function getAffiliateLink() {
  return http<AffiliateLinkResponse>('/affiliate/link', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get public affiliate dashboard data (token-based, no auth required)
 */
export async function getPublicAffiliateDashboard(token: string) {
  return http<PublicAffiliateDashboardResponse>(`/affiliate/dashboard-public?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

// ============= WITHDRAWAL APIs =============

export interface AffiliateBalanceResponse {
  success: boolean;
  data: {
    totalEarnings: number;
    totalPaid: number;
    pendingWithdrawals: number;
    availableBalance: number;
    minimumWithdrawal: number;
  };
  message?: string;
}

export interface WithdrawalRequestPayload {
  amount: number;
  paymentMethod?: string;
  paymentDetails?: {
    paypalEmail?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    walletAddress?: string;
    notes?: string;
  };
  token?: string; // For public route
}

export interface WithdrawalRequestResponse {
  success: boolean;
  data: {
    withdrawalRequest: {
      _id: string;
      amount: number;
      status: string;
      requestedAt: string;
    };
    availableBalance: number;
  };
  message?: string;
}

export interface WithdrawalHistoryItem {
  _id: string;
  amount: number;
  paymentMethod?: string;
  paymentDetails?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalHistoryResponse {
  success: boolean;
  data: {
    withdrawals: WithdrawalHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

/**
 * Get affiliate balance (authenticated)
 */
export async function getAffiliateBalance() {
  return http<AffiliateBalanceResponse>('/affiliate/withdrawal/balance', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get affiliate balance (public, token-based)
 */
export async function getAffiliateBalancePublic(token: string) {
  return http<AffiliateBalanceResponse>(`/affiliate/withdrawal/balance-public?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Create withdrawal request (authenticated)
 */
export async function createWithdrawalRequest(payload: WithdrawalRequestPayload) {
  return http<WithdrawalRequestResponse>('/affiliate/withdrawal/request', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Create withdrawal request (public, token-based)
 */
export async function createWithdrawalRequestPublic(payload: WithdrawalRequestPayload) {
  return http<WithdrawalRequestResponse>('/affiliate/withdrawal/request-public', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Get withdrawal history (authenticated)
 */
export async function getWithdrawalHistory(page: number = 1, limit: number = 10) {
  return http<WithdrawalHistoryResponse>(`/affiliate/withdrawal/history?page=${page}&limit=${limit}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Get withdrawal history (public, token-based)
 */
export async function getWithdrawalHistoryPublic(token: string, page: number = 1, limit: number = 10) {
  return http<WithdrawalHistoryResponse>(`/affiliate/withdrawal/history-public?token=${encodeURIComponent(token)}&page=${page}&limit=${limit}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

