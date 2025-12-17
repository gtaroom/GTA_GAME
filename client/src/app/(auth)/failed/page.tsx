'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransitionRouter } from 'next-transition-router';
import { resendEmailVerification } from '@/lib/api/auth';
import AuthTitle from '../components/auth-title';
import { Button } from '@/components/ui/button';
import NeonText from '@/components/neon/neon-text';
import Image from 'next/image';

export default function FailedPage() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getErrorMessage = () => {
    if (token === 'invalid') {
      return 'The verification link is invalid or has expired.';
    }
    if (token === 'expired') {
      return 'The verification link has expired.';
    }
    return 'Email verification failed.';
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await resendEmailVerification({ email }) as any;
      
      if (response.success) {
        setSuccess(response.message || 'Verification email sent successfully!');
      } else {
        setError(response.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        {/* Error Icon */}
        <div className="relative z-[1] before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[120px] before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:bg-red-500 before:blur-2xl before:z-[-1]">
          <Image
            src="/modal/gift-icon.png"
            height={120}
            width={120}
            alt="Error"
            className="mx-auto opacity-50"
          />
        </div>

        {/* Title and Description */}
        <AuthTitle
          title="Verification Failed"
          description={getErrorMessage()}
        />

        {/* Error Details */}
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <NeonText className="text-red-400 text-sm">
            {email && `Email: ${email}`}
          </NeonText>
          <br />
          <NeonText className="text-red-400 text-sm mt-2">
            Please try resending the verification email or contact support if the problem persists.
          </NeonText>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <NeonText className="text-green-400 text-sm">
              {success}
            </NeonText>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <NeonText className="text-red-400 text-sm">
              {error}
            </NeonText>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {email && (
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          )}

           <Button
             onClick={() => router.push('/register')}
             size="lg"
             className="w-full"
           >
            Try Registering Again
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="neon"
            size="sm"
          >
            Go Home
          </Button>
          
           <Button
             onClick={() => router.push('/support')}
             size="sm"
           >
            Contact Support
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <NeonText className="text-sm text-white/60">
            Having trouble? Check your spam folder or contact our support team.
          </NeonText>
        </div>
      </div>
    </div>
  );
}
