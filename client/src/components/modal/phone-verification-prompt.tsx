'use client';

import { useState } from 'react';
import { useTransitionRouter } from 'next-transition-router';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import NeonBox from '@/components/neon/neon-box';
import { resendPhoneOTP } from '@/lib/api/auth';

interface PhoneVerificationPromptProps {
    open: boolean;
    onClose: (action: 'verify' | 'dismiss' | 'skip_all') => void;
    phone: string;
}

export default function PhoneVerificationPrompt({
    open,
    onClose,
    phone,
}: PhoneVerificationPromptProps) {
    const router = useTransitionRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyNow = async () => {
        setLoading(true);
        setError('');

        try {
            // Send OTP to phone
            const response = await resendPhoneOTP({ phone }) as any;

            if (response.success) {
                // Close modal and redirect to verification page
                onClose('verify');
                router.push(`/phone-verification?phone=${encodeURIComponent(phone)}`);
            } else {
                setError(response.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleRemindLater = () => {
        onClose('dismiss');
    };

    const handleSkipAll = () => {
        onClose('skip_all');
    };

    return (
        <Dialog open={open} onOpenChange={() => handleRemindLater()}>
            <DialogContent
                className='max-sm:max-w-[calc(100%-24px)]! sm:max-w-[540px]!'
                neonBoxClass='max-sm:pt-7'
            >
                <div className='max-sm:pt-0 sm:px-6 py-5 text-center'>
                    <DialogTitle className='mb-4' asChild>
                        <NeonText as='h4' className='h4-title mb-3'>
                            <div className='flex items-center justify-center gap-3'>
                                <NeonIcon
                                    icon='lucide:smartphone'
                                    size={32}
                                    glowColor='--color-blue-500'
                                    className='animate-pulse'
                                />
                                <span>Verify Your Phone</span>
                            </div>
                        </NeonText>
                    </DialogTitle>

                    <NeonBox
                        className='p-4 rounded-lg mb-5'
                        glowColor='--color-blue-500'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.3}
                        borderWidth={1}
                    >
                        <div className='flex items-start gap-3 text-left'>
                            <NeonIcon
                                icon='lucide:shield-check'
                                size={24}
                                glowColor='--color-green-500'
                            />
                            <div className='flex-1'>
                                <NeonText className='text-sm text-white font-bold mb-2'>
                                    Why Verify Your Phone?
                                </NeonText>
                                <ul className='text-sm text-white/80 space-y-1.5 list-disc list-inside'>
                                    <li>Secure your account with 2-factor authentication</li>
                                    <li>Get instant notifications about game accounts</li>
                                    <li>Receive important security alerts</li>
                                    <li>Quick password recovery</li>
                                </ul>
                            </div>
                        </div>
                    </NeonBox>

                    <p className='font-bold text-base leading-7.5 mb-1'>
                        We'll send a verification code to:
                    </p>
                    <NeonText
                        glowColor='--color-yellow-500'
                        className='text-lg font-bold mb-5'
                    >
                        {phone}
                    </NeonText>

                    {error && (
                        <div className='p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-5'>
                            <p className='text-red-400 text-sm'>{error}</p>
                        </div>
                    )}

                    <div className='flex flex-col gap-3 sm:flex-row mt-4 sm:gap-4'>
                        <Button
                            size='lg'
                            onClick={handleVerifyNow}
                            disabled={loading}
                            className='w-full sm:w-auto sm:flex-1'
                        >
                            {loading ? (
                                <>
                                    <NeonIcon
                                        icon='lucide:loader-2'
                                        size={18}
                                        className='animate-spin mr-2'
                                    />
                                    Sending Code...
                                </>
                            ) : (
                                'Verify Now'
                            )}
                        </Button>
                        <Button
                            size='lg'
                            variant='secondary'
                            onClick={handleRemindLater}
                            disabled={loading}
                            className='w-full sm:w-auto sm:flex-1'
                        >
                            Remind Me Later
                        </Button>
                    </div>

                    <div className='mt-3'>
                        <button
                            onClick={handleSkipAll}
                            disabled={loading}
                            className='text-xs text-white/40 hover:text-white/60 underline transition-colors'
                        >
                            Skip all verification prompts for 24 hours
                        </button>
                    </div>

                    <p className='text-xs text-white/50 mt-4'>
                        You can verify your phone anytime from your profile settings
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

