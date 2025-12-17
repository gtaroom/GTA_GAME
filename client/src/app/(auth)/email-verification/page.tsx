'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import AuthTitle from '../components/auth-title';

const EmailVerification = () => {
    const searchParams = useSearchParams();
    const router = useTransitionRouter();
    const phone = searchParams.get('phone');

    const handlePhoneVerification = () => {
        if (phone) {
            // Pass the phone parameter to phone verification page
            router.push(
                `/phone-verification?phone=${encodeURIComponent(phone)}`
            );
        } else {
            // If no phone parameter, go to phone verification without it
            router.push('/phone-verification');
        }
    };

    return (
        <>
            {/* Page Title and Description */}
            <AuthTitle
                title='ACCOUNT VERIFICATION'
                description='Thanks for registering! You can verify your account using either your email or phone number to complete the process.'
            />

            {/* Verification Icon */}
            <div className='relative z-[1] before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[100px] before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:bg-blue-500 before:blur-2xl before:z-[-1] mb-12'>
                <Image
                    src='/modal/gift-icon.png'
                    height={100}
                    width={100}
                    alt='Email Verification'
                    className='mx-auto'
                />
            </div>

            {/* Verification Steps */}
            <div className='space-y-8 text-center'>
                {/* Email Verification Step */}
                <div className='space-y-3'>
                    <NeonText className='text-yellow-400 text-lg font-bold'>
                        Step 1: Email Verification
                    </NeonText>
                    <br />
                    <NeonText className='text-white text-base leading-relaxed'>
                        Check your inbox (and spam folder) and click the
                        verification link we sent you.
                    </NeonText>
                </div>

                {/* Phone Verification Step */}
                <div className='space-y-3'>
                    <NeonText className='text-yellow-400 text-lg font-bold'>
                        Step 2: Phone Verification
                    </NeonText>
                    <br />
                    <NeonText className='text-white text-base leading-relaxed'>
                        Enter your phone number to receive a code and complete
                        verification instantly.
                    </NeonText>
                </div>

                {/* Important Note */}
                <div className='mt-12'>
                    <NeonBox
                        className='p-6 rounded-lg'
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.3}
                        borderWidth={1}
                    >
                        <div className='flex items-start gap-4'>
                            <NeonIcon
                                icon='lucide:check-circle'
                                size={24}
                                glowColor='--color-green-500'
                            />
                            <div className='space-y-2 text-left'>
                                <NeonText className='text-white text-base font-semibold'>
                                    You can verify using either{' '}
                                    <span className='text-yellow-400'>
                                        Email OR Phone.
                                    </span>
                                </NeonText>
                                <br />
                                <NeonText className='text-white/90 text-sm leading-relaxed'>
                                    Completing both now is optional – but it'll
                                    save time if you ever need to reset or
                                    recover your account later.
                                </NeonText>
                            </div>
                        </div>
                    </NeonBox>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-12 space-y-4'>
                <Button
                    size='lg'
                    onClick={handlePhoneVerification}
                    className='w-full'
                >
                    Verify Phone Number
                </Button>

                <Button
                    onClick={() => router.push('/')}
                    variant='neon'
                    size='sm'
                    className='w-full border-btn-secondary-border border-[2px] rounded-[10px] shadow-btn-primary'
                >
                    Back to Home
                </Button>
            </div>

            {/* Help Text */}
            <div className='mt-8'>
                <NeonText className='text-sm text-white/70'>
                    Having trouble? Check your spam folder or contact support.
                </NeonText>
            </div>
        </>
    );
};

export default EmailVerification;
