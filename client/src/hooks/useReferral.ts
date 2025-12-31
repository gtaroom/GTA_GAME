'use client';

import {
  generateReferralQR,
  getReferralLink,
  getReferralStats,
  validateReferralCode,
} from '@/lib/api/referral';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { generateQRCodeDataURL, downloadQRCode } from '@/lib/utils/qrcode';
import { toastSuccess, toastError } from '@/lib/toast';
import { useEffect, useState, useCallback } from 'react';

export interface ReferralData {
  referralLink: string;
  referralCode: string;
}

export interface ReferralStats {
  totalInvited: number;
  qualified: number;
  totalRewards: number;
  recentReferrals?: Array<{
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
  }>;
}

export function useReferral() {
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    totalInvited: 0,
    qualified: 0,
    totalRewards: 0,
    recentReferrals: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  // Fetch referral link
  const fetchReferralLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getReferralLink();
      if (response.success && response.data) {
        setReferralLink(response.data.referralLink);
        setReferralCode(response.data.referralCode);
      }
    } catch (error: any) {
      console.error('Failed to fetch referral link:', error);
      toastError(error?.message || 'Failed to load referral link');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch referral statistics
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await getReferralStats();
      if (response.success && response.data) {
        setStats({
          totalInvited: response.data.totalInvited || 0,
          qualified: response.data.qualified || 0,
          totalRewards: response.data.totalRewards || 0,
          recentReferrals: response.data.recentReferrals || [],
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch referral stats:', error);
      // Don't show error toast for stats, just log it
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Copy referral link to clipboard
  const copyLink = useCallback(async () => {
    if (!referralLink) {
      await fetchReferralLink();
      return;
    }

    const success = await copyToClipboard(referralLink);
    if (success) {
      toastSuccess('Referral link copied to clipboard!');
    } else {
      toastError('Failed to copy link. Please try again.');
    }
  }, [referralLink, fetchReferralLink]);

  // Generate QR code
  const generateQR = useCallback(async () => {
    try {
      let linkToUse = referralLink;
      
      // If no link, fetch it first
      if (!linkToUse) {
        setIsLoading(true);
        try {
          const response = await getReferralLink();
          if (response.success && response.data) {
            linkToUse = response.data.referralLink;
            setReferralLink(linkToUse);
            setReferralCode(response.data.referralCode);
          } else {
            throw new Error('Failed to get referral link');
          }
        } finally {
          setIsLoading(false);
        }
      }

      // Try to get QR code from API first
      try {
        const response = await generateReferralQR();
        if (response.success && response.data?.qrCodeData) {
          setQrCodeDataURL(response.data.qrCodeData);
          return response.data.qrCodeData;
        }
      } catch (apiError) {
        console.log('API QR generation failed, using client-side generation');
      }

      // Fallback to client-side generation
      const dataURL = await generateQRCodeDataURL(linkToUse, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataURL(dataURL);
      return dataURL;
    } catch (error: any) {
      console.error('Failed to generate QR code:', error);
      toastError(error?.message || 'Failed to generate QR code');
      throw error;
    }
  }, [referralLink]);

  // Download QR code
  const downloadQR = useCallback(async () => {
    try {
      let dataURL = qrCodeDataURL;
      if (!dataURL) {
        dataURL = await generateQR();
      }
      downloadQRCode(dataURL, `referral-qrcode-${referralCode || 'link'}.png`);
      toastSuccess('QR code downloaded!');
    } catch (error: any) {
      console.error('Failed to download QR code:', error);
      toastError('Failed to download QR code');
    }
  }, [qrCodeDataURL, generateQR, referralCode]);

  // Validate referral code (public)
  const validateCode = useCallback(async (code: string) => {
    try {
      const response = await validateReferralCode(code);
      return response.success && response.data?.valid === true;
    } catch (error) {
      console.error('Failed to validate referral code:', error);
      return false;
    }
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    referralLink,
    referralCode,
    stats,
    isLoading,
    isLoadingStats,
    qrCodeDataURL,
    fetchReferralLink,
    fetchStats,
    copyLink,
    generateQR,
    downloadQR,
    validateCode,
  };
}

