'use client';

import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import PINInput from '@/components/ui/pin-input';
import { useAuth } from '@/contexts/auth-context';
import { resendPhoneOTP, verifyPhoneOTP } from '@/lib/api/auth';
import { useTransitionRouter } from 'next-transition-router';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthFooterText from '../components/auth-footer-text';
import AuthTitle from '../components/auth-title';

export default function PhoneOTPVerification() {
    const searchParams = useSearchParams();
    const router = useTransitionRouter();
    const { updateUserFlags } = useAuth();
    const phone = searchParams.get('phone')
        ? decodeURIComponent(searchParams.get('phone')!)
        : null;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOTPChange = (value: string) => {
        setOtp(value);
        setError('');
    };

    const handleOTPComplete = (value: string) => {
        if (value.length === 6) {
            handleVerify(value);
        }
    };

    const handleVerify = async (otp: string) => {
        if (!phone) {
            setError('Phone number not found');
            return;
        }
        console.log(otp.length);

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = (await verifyPhoneOTP({ phone, otp })) as any;

            if (response.success) {
                setSuccess('Phone verified successfully!');

                // Update user state locally - set isPhoneVerified to true
                updateUserFlags({ isPhoneVerified: true });

                setTimeout(() => {
                    router.push('/success?verified=phone');
                }, 1500);
            } else {
                setError(response.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Verification failed'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendLoading || countdown > 0) return;
        if (!phone) {
            setError('Phone number not found');
            return;
        }

        setResendLoading(true);
        setError('');

        try {
            const response = (await resendPhoneOTP({ phone })) as any;

            if (response.success) {
                setSuccess('OTP sent successfully!');
                setCountdown(60); // 60 second cooldown
            } else {
                setError(response.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to resend OTP'
            );
        } finally {
            setResendLoading(false);
        }
    };

    if (!phone) {
        return (
            <div className='text-center'>
                <AuthTitle
                    title='Error'
                    description='Phone number not found. Please try registering again.'
                />
                <Button onClick={() => router.push('/register')}>
                    Go to Register
                </Button>
            </div>
        );
    }

    return (
        <>
            <AuthTitle
                title='Verify Your Phone'
                description={`We've sent a 6-digit verification code to ${phone}`}
            />

            <div className='space-y-8 w-full'>
                {/* PIN Input */}
                <div className='flex flex-col items-center space-y-4'>
                    <PINInput
                        value={otp}
                        onChange={handleOTPChange}
                        onComplete={handleOTPComplete}
                        disabled={loading}
                        error={!!error}
                        className='mb-4'
                    />

                    {/* Auto-verify when 6 digits are entered */}
                    {otp.length === 6 && !loading && (
                        <NeonText className='text-sm text-white/70 animate-pulse'>
                            Verifying...
                        </NeonText>
                    )}
                </div>

                {/* Email Verification Reminder - Matches site theme */}
                {/* <div className='w-full space-y-4'>
                    <div className='rounded-2xl p-[2px] bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400'>
                        <div className='bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl px-5 py-4'>
                            <div className='flex items-center justify-center gap-3'>
                                <div className='bg-blue-500 rounded-lg p-2 shadow-lg flex-shrink-0'>
                                    <Mail
                                        className='w-5 h-5 text-white'
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <h3 className='text-white text-sm sm:text-base font-bold uppercase tracking-wide'>
                                    Don't Forget To Verify Your Email!
                                </h3>
                            </div>
                        </div>
                    </div>

                    <NeonText
                        className='text-center text-sm leading-relaxed'
                        glowSpread={0.5}
                    >
                        Check your inbox (and spam folder) for the{' '}
                        <span className='text-yellow-400 font-semibold'>
                            link we sent
                        </span>{' '}
                        — verifying both makes it easier to recover your account
                        later.
                    </NeonText>
                </div> */}

                {/* Error/Success Messages */}
                {error && (
                    <div className='text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg'>
                        <NeonText className='text-red-400 text-sm'>
                            {error}
                        </NeonText>
                    </div>
                )}

                {success && (
                    <div className='text-center p-4 bg-green-500/20 border border-green-500/50 rounded-lg'>
                        <NeonText className='text-green-400 text-sm'>
                            {success}
                        </NeonText>
                    </div>
                )}

                {/* Manual Verify Button (fallback) */}
                {otp.length < 6 && (
                    <div className='text-center'>
                        <Button
                            onClick={() => handleVerify(otp)}
                            disabled={loading || otp.length !== 6}
                            size='lg'
                            className='w-full'
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </div>
                )}

                {/* Resend Section */}
                <div className='text-center space-y-3'>
                    <NeonText className='text-sm text-white/70'>
                        Didn't receive the code?
                    </NeonText>

                    <button
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        className={`
              text-purple-400 hover:text-purple-300 transition-colors duration-200
              underline text-sm font-medium
              ${resendLoading || countdown > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {resendLoading
                            ? 'Sending...'
                            : countdown > 0
                              ? `Resend in ${countdown}s`
                              : 'Resend OTP'}
                    </button>
                </div>

                {/* Footer */}
                <AuthFooterText
                    text='Need help?'
                    link={{ href: '/support', text: 'Contact Support' }}
                />
            </div>
        </>
    );
}
