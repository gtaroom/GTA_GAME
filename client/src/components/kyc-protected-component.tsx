'use client';

import React from 'react';
import { useKYCVerification } from '@/hooks/useKYCVerification';

interface UseKYCVerificationOptions {
  redirectUrl?: string;
  showToast?: boolean;
  toastMessage?: string;
}

/**
 * Higher-order component for protecting components that require KYC
 */
export function withKYCVerification<P extends object>(
  Component: React.ComponentType<P>,
  options: UseKYCVerificationOptions = {}
) {
  return function KYCProtectedComponent(props: P) {
    const { requireKYC } = useKYCVerification();
    
    // Check KYC on component mount
    if (!requireKYC(options)) {
      return null; // Component won't render if KYC is not verified
    }

    return <Component {...props} />;
  };
}
