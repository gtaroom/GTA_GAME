'use client';

import {
  applyForAffiliate,
  getAffiliateDashboard,
  getAffiliateLink,
  getAffiliateStatus,
  type AffiliateApplyPayload,
} from '@/lib/api/affiliate';
import { useState, useCallback } from 'react';
import { toastSuccess, toastError } from '@/lib/toast';

export interface AffiliateStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_applied';
  applicationDate?: string;
  rejectionReason?: string;
}

export interface AffiliateDashboard {
  affiliateLink: string;
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number; // Qualified referrals
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
}

export function useAffiliate() {
  const [status, setStatus] = useState<AffiliateStatus | null>(null);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<string>('');
  const [affiliateCode, setAffiliateCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check application status
  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAffiliateStatus();
      if (response.success && response.data) {
        // Handle the case where hasApplication is false
        if (response.data.hasApplication === false) {
          setStatus({
            status: 'not_applied',
          });
        } else if (response.data.status) {
          // Map the status from backend
          setStatus({
            status: response.data.status,
            applicationDate: response.data.applicationDate,
            rejectionReason: response.data.rejectionReason,
          });
        } else {
          setStatus({
            status: 'not_applied',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch affiliate status:', error);
      // Don't show error if user hasn't applied yet
      if (error?.status !== 404) {
        toastError(error?.message || 'Failed to load application status');
      }
      // Set not_applied on error
      setStatus({
        status: 'not_applied',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get affiliate dashboard
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAffiliateDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch affiliate dashboard:', error);
      toastError(error?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get affiliate link
  const fetchAffiliateLink = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await getAffiliateLink();
      if (response.success && response.data) {
        setAffiliateLink(response.data.affiliateLink);
        setAffiliateCode(response.data.affiliateCode);
        return response.data.affiliateLink;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to fetch affiliate link:', error);
      toastError(error?.message || 'Failed to load affiliate link');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit partnership application
  const submitApplication = useCallback(
    async (payload: AffiliateApplyPayload): Promise<{ success: boolean; errors?: Record<string, string> }> => {
      setIsSubmitting(true);
      try {
        const response = await applyForAffiliate(payload);
        if (response.success) {
          toastSuccess(
            response.message || 'Application submitted successfully!'
          );
          // Refresh status after submission
          await checkStatus();
          return { success: true };
        } else {
          toastError(response.message || 'Failed to submit application');
          return { success: false };
        }
      } catch (error: any) {
        console.error('Failed to submit application:', error);
        
        // Extract field-specific errors from API response
        const fieldErrors: Record<string, string> = {};
        const errorData = error?.response?.data || error?.data || {};
        
        // Handle different error response formats
        if (errorData.errors) {
          // If errors is an object with field names as keys
          if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
            Object.keys(errorData.errors).forEach((field) => {
              const errorMessage = errorData.errors[field];
              if (Array.isArray(errorMessage)) {
                fieldErrors[field] = errorMessage[0]; // Take first error message
              } else if (typeof errorMessage === 'string') {
                fieldErrors[field] = errorMessage;
              }
            });
          } else if (Array.isArray(errorData.errors)) {
            // If errors is an array, show general message
            toastError(errorData.errors[0] || errorData.message || 'Validation failed');
          }
        }
        
        // Map backend field names to form field names
        const mappedErrors: Record<string, string> = {};
        Object.keys(fieldErrors).forEach((key) => {
          // Map nested fields like 'name.first' to 'firstName'
          if (key === 'name.first' || key === 'name') {
            mappedErrors.firstName = fieldErrors[key];
          } else if (key === 'name.last') {
            mappedErrors.lastName = fieldErrors[key];
          } else if (key === 'email') {
            mappedErrors.email = fieldErrors[key];
          } else if (key === 'phone') {
            mappedErrors.phone = fieldErrors[key];
          } else if (key === 'company') {
            mappedErrors.company = fieldErrors[key];
          } else if (key === 'website') {
            mappedErrors.website = fieldErrors[key];
          } else if (key === 'audienceSize') {
            mappedErrors.audienceSize = fieldErrors[key];
          } else if (key === 'promotionMethods') {
            mappedErrors.promotionMethods = fieldErrors[key];
          } else if (key.startsWith('socialMedia.')) {
            // Handle nested social media fields
            const socialKey = key.replace('socialMedia.', '');
            mappedErrors[socialKey] = fieldErrors[key];
            mappedErrors[key] = fieldErrors[key]; // Also keep the full path
          } else {
            // Keep original key if no mapping needed
            mappedErrors[key] = fieldErrors[key];
          }
        });
        
        // If there's a general message but no field errors, add it as general error
        if (Object.keys(mappedErrors).length === 0 && errorData.message) {
          mappedErrors.general = errorData.message;
        }
        
        // Show general error message if no field-specific errors
        if (Object.keys(mappedErrors).length === 0) {
          toastError(
            errorData.message ||
              error?.message ||
              'Failed to submit application'
          );
        }
        
        return { success: false, errors: mappedErrors };
      } finally {
        setIsSubmitting(false);
      }
    },
    [checkStatus]
  );

  return {
    status,
    dashboard,
    affiliateLink,
    affiliateCode,
    isLoading,
    isSubmitting,
    checkStatus,
    fetchDashboard,
    fetchAffiliateLink,
    submitApplication,
  };
}

