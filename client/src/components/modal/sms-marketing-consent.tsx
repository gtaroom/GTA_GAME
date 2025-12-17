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

interface SmsMarketingConsentProps {
    open: boolean;
    onClose: (consented: boolean) => void;
}

export default function SmsMarketingConsent({
    open,
    onClose,
}: SmsMarketingConsentProps) {
    const { refetchUser } = useAuth();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const response = (await updateProfile({
                isSmsOpted: agreed,
                acceptSMSMarketing: agreed,
                isOpted: agreed,
            })) as any;

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
                                    icon='lucide:message-circle'
                                    size={32}
                                    glowColor='--color-green-500'
                                />
                                <span>Stay Updated!</span>
                            </div>
                        </NeonText>
                    </DialogTitle>

                    <p className='font-bold text-base leading-7.5 mb-5'>
                        Get instant notifications about bonuses, events, and
                        exclusive offers via SMS and Email
                    </p>

                    <NeonBox
                        className='p-4 rounded-lg mb-5'
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.3}
                        borderWidth={1}
                    >
                        <div className='space-y-3 text-left'>
                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:zap'
                                    size={20}
                                    glowColor='--color-yellow-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Instant Bonus Codes
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Receive time-sensitive bonus codes
                                        directly to your phone
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:bell-ring'
                                    size={20}
                                    glowColor='--color-blue-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Event Notifications
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Be alerted when special events and
                                        tournaments begin
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:ticket'
                                    size={20}
                                    glowColor='--color-pink-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Flash Promotions
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Get notified about limited-time offers
                                        before anyone else
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <NeonIcon
                                    icon='lucide:shield-check'
                                    size={20}
                                    glowColor='--color-purple-500'
                                />
                                <div className='flex-1'>
                                    <NeonText className='text-sm font-bold text-white mb-1'>
                                        Account Updates
                                    </NeonText>
                                    <p className='text-xs text-white/70'>
                                        Important account notifications and game
                                        account status
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

                    <div className='site-checkbox flex items-center justify-center gap-3 mb-4'>
                        <Checkbox
                            id='sms-marketing-consent'
                            checked={agreed}
                            onCheckedChange={c => setAgreed(!!c)}
                        />
                        <NeonText
                            as='label'
                            htmlFor='sms-marketing-consent'
                            className='text-sm! lg:text-base! cursor-pointer'
                            glowSpread={0.5}
                        >
                            Yes, I want to receive promotional SMS and emails
                            from GTOA
                        </NeonText>
                    </div>

                    <NeonBox
                        className='p-3 rounded-lg mb-6'
                        glowColor='--color-blue-500'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.2}
                    >
                        <p className='text-xs text-white/70 leading-relaxed'>
                            By opting in, you agree to receive marketing SMS and
                            emails from GTOA. Frequency varies. Msg & data rates
                            may apply. Consent is not a condition of purchase.
                            Reply{' '}
                            <span className='text-yellow-400 font-semibold'>
                                STOP
                            </span>{' '}
                            to unsubscribe,{' '}
                            <span className='text-yellow-400 font-semibold'>
                                HELP
                            </span>{' '}
                            for help.
                        </p>
                    </NeonBox>

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
                            No Thanks
                        </Button>
                    </div>

                    <p className='text-xs text-white/50 mt-4'>
                        You can opt-out anytime from your account settings or by
                        replying STOP
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
