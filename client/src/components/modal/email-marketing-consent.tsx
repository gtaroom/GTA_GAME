'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile } from '@/lib/api/auth';
import { useState } from 'react';

interface EmailMarketingConsentProps {
    open: boolean;
    onClose: (consented: boolean) => void;
}

export default function EmailMarketingConsent({
    open,
    onClose,
}: EmailMarketingConsentProps) {
    const { refetchUser } = useAuth();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const response = (await updateProfile({ isOpted: agreed })) as any;

            if (response.success) {
                // Refresh user data
                await refetchUser();
                onClose(agreed);
            } else {
                setError(response.message || 'Failed to update preferences');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        onClose(false);
    };

    return (
        <Dialog open={open} onOpenChange={() => handleSkip()}>
            <DialogContent
                className='max-sm:max-w-[calc(100%-24px)]! sm:max-w-[540px]!'
                neonBoxClass='max-sm:pt-7'
            >
                <div className='max-sm:pt-0 sm:px-6 py-5 text-center'>
                    <DialogTitle className='mb-4' asChild>
                        <NeonText as='h4' className='h4-title mb-3'>
                            <div className='flex items-center justify-center gap-3'>
                                <NeonIcon
                                    icon='lucide:mail-open'
                                    size={32}
                                    glowColor='--color-purple-500'
                                />
                                <span>Stay Updated!</span>
                            </div>
                        </NeonText>
                    </DialogTitle>

                    <p className='font-bold text-base leading-7.5 mb-5'>
                        Get exclusive promotions, bonuses, and updates delivered
                        to your inbox
                    </p>

                    <NeonBox
                        className='p-4 rounded-lg mb-5'
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.3}
                        borderWidth={1}
                    >
                        <div className='space-y-3 text-left'>
                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:gift'
                                    size={20}
                                    glowColor='--color-yellow-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Exclusive Bonuses
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Get special bonus codes and promotional
                                        offers sent directly to you
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:sparkles'
                                    size={20}
                                    glowColor='--color-pink-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        New Game Alerts
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Be the first to know when new games and
                                        features launch
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:trophy'
                                    size={20}
                                    glowColor='--color-green-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        VIP Promotions
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Receive special offers based on your VIP
                                        tier
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:calendar-clock'
                                    size={20}
                                    glowColor='--color-blue-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Weekly Newsletter
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Max 1-2 emails per week - never spam,
                                        always value
                                    </p>
                                </div>
                            </div>
                        </div>
                    </NeonBox>

                    {error && (
                        <div className='p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-4'>
                            <p className='text-red-400 text-sm'>{error}</p>
                        </div>
                    )}

                    <div className='site-checkbox flex items-center justify-center gap-3 mb-6'>
                        <Checkbox
                            id='email-marketing-consent'
                            checked={agreed}
                            onCheckedChange={c => setAgreed(!!c)}
                        />
                        <NeonText
                            as='label'
                            htmlFor='email-marketing-consent'
                            className='text-sm! lg:text-base! cursor-pointer'
                            glowSpread={0.5}
                        >
                            Yes, I want to receive promotional emails
                        </NeonText>
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
                        <Button
                            size='lg'
                            onClick={handleSave}
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
                                    Saving...
                                </>
                            ) : (
                                'Save Preferences'
                            )}
                        </Button>
                        <Button
                            size='lg'
                            variant='secondary'
                            onClick={handleSkip}
                            disabled={loading}
                            className='w-full sm:w-auto sm:flex-1'
                        >
                            Skip for Now
                        </Button>
                    </div>

                    <p className='text-xs text-white/50 mt-4'>
                        You can change this preference anytime in your account
                        settings
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
