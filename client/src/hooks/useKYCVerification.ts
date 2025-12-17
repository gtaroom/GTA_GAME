'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast, toastWarning } from '@/lib/toast';

interface UseKYCVerificationOptions {
  redirectUrl?: string;
  showToast?: boolean;
  toastMessage?: string;
}

interface UseKYCVerificationReturn {
  isKYCVerified: boolean;
  requireKYC: (options?: UseKYCVerificationOptions) => boolean;
  redirectToKYC: (options?: UseKYCVerificationOptions) => void;
  checkKYCAndExecute: <T extends any[], R>(
    callback: (...args: T) => R | Promise<R>,
    options?: UseKYCVerificationOptions
  ) => (...args: T) => R | Promise<R> | void;
}

/**
 * Hook for handling KYC verification requirements
 * Provides utilities to check KYC status and redirect users when needed
 */
export function useKYCVerification(): UseKYCVerificationReturn {
  const { user } = useAuth();
  const router = useRouter();

  const isKYCVerified = user?.isKYC || false;

  /**
   * Check if KYC is required and optionally redirect
   * @param options Configuration options
   * @returns true if KYC is verified, false if not verified
   */
  const requireKYC = (options: UseKYCVerificationOptions = {}): boolean => {
    const {
      redirectUrl = '/account',
      showToast = true,
      toastMessage = 'KYC verification is required to access this feature.'
    } = options;

    if (!isKYCVerified) {
      if (showToast) {
        toastWarning(toastMessage);
      }
      
      // Redirect to KYC verification with return URL
      const kycUrl = `/kyc-verification?redirect=${encodeURIComponent(redirectUrl)}`;
      router.push(kycUrl);
      return false;
    }

    return true;
  };

  /**
   * Redirect user to KYC verification page
   * @param options Configuration options
   */
  const redirectToKYC = (options: UseKYCVerificationOptions = {}): void => {
    const { redirectUrl = '/account' } = options;
    const kycUrl = `/kyc-verification?redirect=${encodeURIComponent(redirectUrl)}`;
    router.push(kycUrl);
  };

  /**
   * Higher-order function that checks KYC before executing a callback
   * @param callback Function to execute if KYC is verified
   * @param options Configuration options
   * @returns Wrapped function that checks KYC before execution
   */
  const checkKYCAndExecute = <T extends any[], R>(
    callback: (...args: T) => R | Promise<R>,
    options: UseKYCVerificationOptions = {}
  ) => {
    return (...args: T): R | Promise<R> | void => {
      if (requireKYC(options)) {
        return callback(...args);
      }
      // Return undefined if KYC check fails (execution blocked)
    };
  };

  return {
    isKYCVerified,
    requireKYC,
    redirectToKYC,
    checkKYCAndExecute,
  };
}

/**
 * Utility function to create KYC-protected handlers
 * Useful for form submissions, button clicks, etc.
 */
export function createKYCProtectedHandler<T extends any[], R>(
  handler: (...args: T) => R | Promise<R>,
  options: UseKYCVerificationOptions = {}
) {
  const { checkKYCAndExecute } = useKYCVerification();
  return checkKYCAndExecute(handler, options);
}
