'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/notification-context';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import type { Notification } from '@/types/notification.types';
import { useWalletBalance } from '@/contexts/wallet-balance-context';

function PopupContent({ notification }: { notification: Notification }) {
    const router = useRouter();
    const { closePopup } = useNotifications();
    const { refresh: refetchBalance } = useWalletBalance();

    const handleAction = () => {
        if (notification.type === 'deposit_success') {
            refetchBalance();
            router.push('/account/wallet');
        } else if (notification.type === 'game_account_approved') {
            console.log('game_account_approved');
        }
        closePopup();
    };

    switch (notification.type) {
        case 'deposit_success': {
            const n = notification as typeof notification & { amount: number; coins: number };
            return (
                <div className='space-y-6'>
                    <div className='text-center'>
                        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4'>
                            <NeonIcon icon='lucide:check-circle' size={40} glowColor='--color-green-500' />
                        </div>
                        <NeonText
                            as='h2'
                            glowColor='--color-green-500'
                            className='font-bold mb-2'
                        >
                            Payment Successful! 🎉
                        </NeonText>
                        <p className='text-foreground/80 text-sm'>
                            Great news! Your payment of <span className='font-semibold text-green-400'>${n.amount}</span> has been processed successfully.
                        </p>
                        <div className='mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20'>
                            <p className='font-semibold text-green-400 text-lg'>
                                {n.coins} Gold Coins
                            </p>
                            <p className='text-xs text-foreground/60 mt-1'>Added to your wallet</p>
                        </div>
                    </div>

                    <NeonBox
                        className='p-4 rounded-lg'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                    >
                        <p className='text-sm font-semibold text-blue-400 mb-2'>
                            To start playing:
                        </p>
                        <ol className='text-xs text-foreground/80 space-y-1 list-decimal list-inside'>
                            <li>Go to your Wallet (Load GC)</li>
                            <li>Choose your favorite game</li>
                            <li>Click Add Game GC, provide your username, and play!</li>
                        </ol>
                    </NeonBox>

                    <NeonBox
                        className='p-3 rounded-lg'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.1}
                    >
                        <p className='text-xs text-yellow-500'>
                            <span className='font-semibold'>Note:</span> New users will be sent a username and temporary password.
                        </p>
                    </NeonBox>

                    <div className='flex gap-3'>
                        <Button
                            variant='secondary'
                            onClick={closePopup}
                            className='flex-1'
                        >
                            Dismiss
                        </Button>
                        <Button
                            variant='primary'
                            onClick={handleAction}
                            className='flex-1'
                        >
                            Go to Wallet
                        </Button>
                    </div>
                </div>
            );
        }

        case 'game_account_approved': {
            const n = notification as typeof notification & { gameName: string; generatedUsername: string; generatedPassword: string };
            return (
                <div className='space-y-6'>
                    <div className='text-center'>
                        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4'>
                            <NeonIcon icon='lucide:check-circle' size={40} glowColor='--color-green-500' />
                        </div>
                        <NeonText
                            as='h2'
                            glowColor='--color-green-500'
                            className='font-bold mb-2'
                        >
                            Game Account Approved! 🎉
                        </NeonText>
                        <p className='text-foreground/80 text-sm'>
                            Your <span className='font-semibold text-green-400'>{n.gameName}</span> account has been approved!
                        </p>
                    </div>

                    <NeonBox
                        className='p-4 rounded-lg space-y-3'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <div>
                            <p className='text-xs text-foreground/60 mb-1'>Username</p>
                            <div className='flex items-center justify-between p-2 bg-background/50 rounded'>
                                <p className='font-semibold text-sm'>{n.generatedUsername}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(n.generatedUsername)}
                                    className='p-1 hover:bg-neutral-600 rounded transition-colors'
                                    aria-label='Copy username'
                                >
                                    <NeonIcon icon='lucide:copy' size={16} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className='text-xs text-foreground/60 mb-1'>Password</p>
                            <div className='flex items-center justify-between p-2 bg-background/50 rounded'>
                                <p className='font-semibold text-sm font-mono'>{n.generatedPassword}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(n.generatedPassword)}
                                    className='p-1 hover:bg-neutral-600 rounded transition-colors'
                                    aria-label='Copy password'
                                >
                                    <NeonIcon icon='lucide:copy' size={16} />
                                </button>
                            </div>
                        </div>
                    </NeonBox>

                    <NeonBox
                        className='p-3 rounded-lg'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.1}
                    >
                        <p className='text-xs text-yellow-500'>
                            <span className='font-semibold'>Important:</span> Please save these credentials securely!
                        </p>
                    </NeonBox>

                    <div className='flex gap-3'>
                        <Button
                            variant='secondary'
                            onClick={closePopup}
                            className='flex-1'
                        >
                            Dismiss
                        </Button>
                       
                    </div>
                </div>
            );
        }

        default:
            return null;
    }
}

export function NotificationPopup() {
    const { activePopup } = useNotifications();

    return (
        <Dialog open={!!activePopup} onOpenChange={(open) => {
            if (!open) {
                // Close popup when dialog is closed
                const { closePopup } = useNotifications();
                closePopup();
            }
        }}>
            <DialogContent 
                className='sm:max-w-md'
                showCloseButton={true}
                showScrollBar={false}
            >
                <DialogTitle className='sr-only'>
                    Notification
                </DialogTitle>
                {activePopup && <PopupContent notification={activePopup} />}
            </DialogContent>
        </Dialog>
    );
}

