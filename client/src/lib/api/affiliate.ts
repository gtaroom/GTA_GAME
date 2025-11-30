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

