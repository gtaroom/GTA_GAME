'use client';

import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useAuth, useIsLoggedIn } from '@/contexts/auth-context';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import AuthTitle from '../components/auth-title';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const {refetchUser} = useAuth();
  const router = useTransitionRouter();
  const {isLoggedIn} = useIsLoggedIn()
  const verified = searchParams.get('verified'); // 'phone' or 'email'
  const deposit = searchParams.get('deposit'); // 'true' for email verification

  // Determine the content based on query params
  const getContent = () => {
    if (verified === 'phone') {
      refetchUser();
      return {
        title: 'Phone Verified Successfully!',
        description: 'Your phone number has been verified. You can now access all features.',
        image: '/modal/gift-icon.png',
        actionText: 'Continue to Dashboard',
        actionPath: '/lobby'
      };
    }
    
    if (verified === 'true') {
      return {
        title: 'Email Verified Successfully!',
        description: 'Your email has been verified. Welcome to the platform!',
        image: '/modal/gift-icon.png',
        actionText: 'Start Playing',
        actionPath: isLoggedIn ? '/lobby' : '/login'
      };
    }
    
    // Default success
    return {
      title: 'Success!',
      description: 'Your action has been completed successfully.',
      image: '/modal/gift-icon.png',
      actionText: 'Continue',
      actionPath: '/lobby'
    };
  };

  const content = getContent();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(content.actionPath);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, content.actionPath]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="relative z-[1] before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[120px] before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:bg-green-500 before:blur-2xl before:z-[-1]">
          <Image
            src={content.image}
            height={120}
            width={120}
            alt="Success"
            className="mx-auto"
          />
        </div>

        {/* Title and Description */}
        <AuthTitle
          title={content.title}
          description={content.description}
        />

        {/* Success Message */}
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <NeonText className="text-green-400 text-sm">
            {verified === 'phone' 
              ? 'Your phone number is now verified and secure.'
              : verified === 'true'
                ? 'Your email is verified. You can now access all features.'
                : deposit === 'true'
                  ? 'Your email is verified. Check your inbox for any additional instructions.'
                  : 'Everything is set up correctly!'
            }
          </NeonText>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <Button
            onClick={() => router.push(content.actionPath)}
            size="lg"
            className="w-full"
          >
            {content.actionText}
          </Button>

          {/* Auto-redirect notice */}
          <NeonText className="text-sm text-white/60">
            {verified === 'true' 
              ? 'Redirecting to lobby in 5 seconds...'
              : 'Redirecting automatically in 5 seconds...'
            }
          </NeonText>
        </div>

        {/* Additional Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="secondary"
            size="sm"
          >
            Go Home
          </Button>
          
          {/* {verified === 'phone' && (
            <Button
              onClick={() => router.push('/profile')}
              variant="neon"
              size="sm"
            >
              View Profile
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
}
