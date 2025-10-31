'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { toastSuccess, toastWarning, toastError } from '@/lib/toast';
import { http } from '@/lib/api/http';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Declare Veriff SDK types
declare global {
  interface Window {
    veriffSDK: any;
  }
}

// Prevent prerendering by making this page dynamic
export const dynamic = 'force-dynamic';

export default function KYCVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refetchUser, isInitializing } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'completed' | 'failed'>('idle');
  const [veriffInstance, setVeriffInstance] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client state on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get redirect URL from params or default to account page
  const redirectUrl = searchParams.get('redirect') || '/account';
  const userId = user?._id;

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof window === 'undefined') {
      return;
    }

    // Wait for auth initialization to complete
    if (isInitializing) {
      console.log('⏳ Auth is initializing, waiting...');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ User found:', user);

    // Check if user is already KYC verified
    if (user.isKYC) {
      console.log('✅ User already KYC verified, redirecting');
      toastSuccess('You are already KYC verified!');
      router.push(redirectUrl);
      return;
    }

    console.log('🔄 User needs KYC verification, initializing Veriff');

    // Initialize Veriff SDK after component mounts
    const timer = setTimeout(() => {
      initializeVeriff();
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [user, router, redirectUrl, isInitializing, isClient]);

  const initializeVeriff = async () => {
    try {
      console.log('🔄 Starting Veriff initialization...');
      setIsLoading(true);
      setError(null);

      // Check if we're on the client side
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Veriff initialization requires client-side environment');
      }

      // Check if API key exists
      const apiKey = process.env.NEXT_PUBLIC_VERIFF_API_KEY;
      if (!apiKey) {
        throw new Error('Veriff API key is not configured');
      }
      console.log('✅ API key found');

      // Dynamically import Veriff SDK only on client side
      const Veriff = (await import('@veriff/js-sdk')).default;

      // Load Veriff SDK script from CDN
      const script = document.createElement("script");
      script.src = "https://cdn.veriff.me/incontext/js/v1/veriff.js";
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        setTimeout(reject, 10000); // 10 second timeout
      });

      console.log('✅ Veriff CDN script loaded');

      // Initialize Veriff using the same pattern as your working code
      const verif = Veriff as any;
      console.log('🔧 Veriff object:', verif);
      
      if (!verif || !verif.Veriff) {
        throw new Error('Veriff SDK is not properly loaded');
      }

      const veriff = (verif.Veriff as any)({
        apiKey: apiKey,
        parentId: 'veriff-root',
        onSession: (err: any, response: any) => {
          console.log('📡 Veriff onSession called');
          if (err) {
            console.error('Veriff session error:', err);
            setError('Failed to initialize verification session. Please try again.');
            toastError('Veriff session error. Please try again later');
            setIsLoading(false);
            return;
          }

          console.log('Veriff session response:', response);
          console.log('window.veriffSDK:', window.veriffSDK);

          if (window.veriffSDK) {
            console.log('✅ Creating Veriff frame');
            window.veriffSDK.createVeriffFrame({
              url: response.verification.url,
              onEvent: async (msg: any) => {
                console.log('Veriff event:', msg);
                
                if (msg === 'FINISHED') {
                  setVerificationStatus('verifying');
                  await handleVerificationComplete();
                } else if (msg === 'CANCELED') {
                  setVerificationStatus('failed');
                  setError('Verification was cancelled. Please complete KYC verification to access all features.');
                  toastWarning('Verification cancelled. Please verify your account else you\'ll not be able to deposit.');
                } else if (msg === 'ERROR') {
                  setVerificationStatus('failed');
                  setError('An error occurred during verification. Please try again.');
                  toastError('An unexpected error occurred during verification!');
                }
              }
            });
          } else {
            console.error('❌ window.veriffSDK not available');
            setError('Veriff SDK not properly loaded. Please refresh the page.');
            toastError('Veriff SDK not properly loaded. Please refresh the page.');
            setIsLoading(false);
          }
        }
      });

      console.log('✅ Veriff instance created');

      // Set user parameters
      veriff.setParams({
        person: {
          givenName: user?.name?.first || '',
          lastName: user?.name?.last || user?.name?.middle || '',
        },
        vendorData: userId
      });

      console.log('✅ User parameters set');

      // Mount the Veriff widget
      veriff.mount();
      setVeriffInstance(veriff);
      setIsLoading(false);
      
      console.log('✅ Veriff widget mounted');
    } catch (err) {
      console.error('❌ Failed to initialize Veriff:', err);
      setError('Failed to load verification system. Please refresh the page and try again.');
      toastError('Failed to load verification system. Please refresh the page and try again.');
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async () => {
    try {
      // Call your API to verify KYC status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/verify-kyc-webhook?userID=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to verify KYC status');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update user data
        await refetchUser();
        
        setVerificationStatus('completed');
        
        // Show success notification
        toastSuccess(data.message || 'KYC verification completed successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to verify KYC status');
      }
      
    } catch (err: any) {
      console.error('KYC verification error:', err);
      setVerificationStatus('failed');
      
      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toastWarning(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
        toastError(err.message);
      } else {
        setError('Failed to complete verification. Please contact support.');
        toastError('An unexpected error occurred!');
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setVerificationStatus('idle');
    initializeVeriff();
  };

  const handleSkip = () => {
    toastWarning('KYC verification is required for certain features. You can complete it later from your account settings.');
    router.push(redirectUrl);
  };

  // Don't render on server to prevent SSR issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <NeonBox className="w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
            <NeonText className="text-center">Loading...</NeonText>
          </div>
        </NeonBox>
      </div>
    );
  }

  if (error && verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <NeonBox className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <NeonIcon icon="lucide:x-circle" size={24} className="text-red-400" />
            </div>
            <NeonText as="h2" className="text-xl mb-2">Verification Failed</NeonText>
            <NeonText className="text-sm opacity-80">There was an issue with your KYC verification</NeonText>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <NeonIcon icon="lucide:alert-triangle" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <NeonText className="text-sm">{error}</NeonText>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleRetry} className="flex-1">
              Try Again
            </Button>
            <Button variant="secondary" onClick={handleSkip} className="flex-1">
              Skip for Now
            </Button>
          </div>
        </NeonBox>
      </div>
    );
  }

  if (verificationStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <NeonBox className="w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <NeonIcon icon="lucide:check-circle" size={24} className="text-green-400" />
            </div>
            <NeonText as="h2" className="text-xl font-semibold mb-2">Verification Complete!</NeonText>
            <NeonText className="text-sm opacity-80 mb-4">
              Your KYC verification has been completed successfully. Redirecting you back...
            </NeonText>
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          </div>
        </NeonBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <NeonBox className="w-full max-w-2xl p-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
            <NeonIcon icon="lucide:shield" size={24} className="text-purple-400" />
          </div>
          <NeonText as="h1" className="text-2xl font-bold mb-2">KYC Verification Required</NeonText>
          <NeonText className="text-base opacity-80">
            Complete your identity verification to access all features and redeem your winnings
          </NeonText>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <NeonIcon icon="lucide:alert-triangle" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <NeonText className="text-sm">{error}</NeonText>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <NeonText as="h3" className="font-semibold text-blue-400 mb-2">Why is KYC required?</NeonText>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Secure your account and prevent fraud</li>
              <li>• Enable withdrawals and redemptions</li>
              <li>• Comply with regulatory requirements</li>
              <li>• Protect your winnings and personal information</li>
            </ul>
          </div>

          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
            <NeonText as="h3" className="font-semibold mb-2">What you'll need:</NeonText>
            <ul className="text-sm opacity-80 space-y-1">
              <li>• Government-issued photo ID (driver's license, passport, etc.)</li>
              <li>• Good lighting and a stable internet connection</li>
            </ul>
          </div>

          <div id="veriff-root" className="min-h-[400px] rounded-lg mx-auto">
            {verificationStatus === 'verifying' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
                  <NeonText className="text-sm opacity-80">Processing your verification...</NeonText>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={handleSkip} 
              className="flex-1"
              disabled={verificationStatus === 'verifying'}
            >
              Skip for Now
            </Button>
            {error && (
              <Button onClick={handleRetry} className="flex-1">
                Retry
              </Button>
            )}
          </div>

          <NeonText className="text-xs opacity-60 text-center">
            Your information is processed securely and in compliance with privacy regulations.
            You can complete this verification later from your account settings.
          </NeonText>
        </div>
      </NeonBox>
    </div>
  );
}