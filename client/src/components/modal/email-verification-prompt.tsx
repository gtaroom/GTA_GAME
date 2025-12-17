'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import NeonBox from '@/components/neon/neon-box';
import { resendEmailVerification } from '@/lib/api/auth';

interface EmailVerificationPromptProps {
    open: boolean;
    onClose: (action: 'verify' | 'dismiss') => void;
    email: string;
}

export default function EmailVerificationPrompt({
    open,
    onClose,
    email,
}: EmailVerificationPromptProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleResendEmail = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await resendEmailVerification({ email }) as any;

            if (response.success) {
                setSuccess(true);
                // Auto-close after showing success message
                setTimeout(() => {
                    onClose('verify');
                }, 3000);
            } else {
                setError(response.message || 'Failed to send verification email');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckLater = () => {
        onClose('dismiss');
    };

    return (
        <Dialog open={open} onOpenChange={() => handleCheckLater()}>
            <DialogContent
                className='max-sm:max-w-[calc(100%-24px)]! sm:max-w-[540px]!'
                neonBoxClass='max-sm:pt-7'
            >
                <div className='max-sm:pt-0 sm:px-6 py-5 text-center'>
                    <DialogTitle className='mb-4' asChild>
                        <NeonText as='h4' className='h4-title mb-3'>
                            <div className='flex items-center justify-center gap-3'>
                                <NeonIcon
                                    icon='lucide:mail'
                                    size={32}
                                    glowColor='--color-purple-500'
                                    className='animate-pulse'
                                />
                                <span>Verify Your Email</span>
                            </div>
                        </NeonText>
                    </DialogTitle>

                    {success ? (
                        <NeonBox
                            className='p-5 rounded-lg mb-5'
                            glowColor='--color-green-500'
                            backgroundColor='--color-green-500'
                            backgroundOpacity={0.2}
                            glowSpread={0.5}
                            borderWidth={1}
                        >
                            <div className='flex items-center gap-3 justify-center mb-3'>
                                <NeonIcon
                                    icon='lucide:check-circle'
                                    size={32}
                                    glowColor='--color-green-500'
                                />
                                <NeonText
                                    glowColor='--color-green-500'
                                    className='text-lg font-bold text-green-400'
                                >
                                    Email Sent Successfully!
                                </NeonText>
                            </div>
                            <p className='text-sm text-white/80'>
                                Check your inbox (and spam folder) for the verification link.
                            </p>
                        </NeonBox>
                    ) : (
                        <>
                            <NeonBox
                                className='p-4 rounded-lg mb-5'
                                glowColor='--color-purple-500'
                                backgroundColor='--color-purple-500'
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
                                            Why Verify Your Email?
                                        </NeonText>
                                        <ul className='text-sm text-white/80 space-y-1.5 list-disc list-inside'>
                                            <li>Protect your account from unauthorized access</li>
                                            <li>Receive important account notifications</li>
                                            <li>Get exclusive promotions and bonuses</li>
                                            <li>Enable password reset functionality</li>
                                        </ul>
                                    </div>
                                </div>
                            </NeonBox>

                            <p className='font-bold text-base leading-7.5 mb-1'>
                                We'll send a verification link to:
                            </p>
                            <NeonText
                                glowColor='--color-yellow-500'
                                className='text-lg font-bold mb-5'
                            >
                                {email}
                            </NeonText>

                            {error && (
                                <div className='p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-5'>
                                    <p className='text-red-400 text-sm'>{error}</p>
                                </div>
                            )}

                            <div className='flex flex-col sm:flex-row gap-4 mt-4 sm:gap-6'>
                                <Button
                                    size='lg'
                                    onClick={handleResendEmail}
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
                                            Sending...
                                        </>
                                    ) : (
                                        'Resend Verification Email'
                                    )}
                                </Button>
                                <Button
                                    size='lg'
                                    variant='secondary'
                                    onClick={handleCheckLater}
                                    disabled={loading}
                                    className='w-full sm:w-auto sm:flex-1'
                                >
                                    I'll Check Later
                                </Button>
                            </div>

                            <p className='text-xs text-white/50 mt-4'>
                                Check your spam folder if you don't see the email within a few minutes
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

