'use client';
import AccountPageTitle from '@/app/(account)/profile/components/account-page-title';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useReferral } from '@/hooks/useReferral';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import NeonIcon from '@/components/neon/neon-icon';
import { Link } from 'next-transition-router';
import { toastError } from '@/lib/toast';

export default function ShareLink({ isLoggedIn }: { isLoggedIn?: boolean }) {
    const { md } = useBreakPoint();
    const { copyLink, generateQR, qrCodeDataURL, isLoading, referralLink } =
        useReferral();
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [displayLink, setDisplayLink] = useState('');

    // Update display link when referral link changes
    useEffect(() => {
        if (referralLink) {
            // Mask long links for display
            if (referralLink.length > 60) {
                const start = referralLink.substring(0, 30);
                const end = referralLink.substring(referralLink.length - 20);
                setDisplayLink(`${start}...${end}`);
            } else {
                setDisplayLink(referralLink);
            }
        }
    }, [referralLink]);


    const handleCopyLink = async () => {
        if (!isLoggedIn) {
            toastError('Please log in to copy referral link');
            return;
        }
        await copyLink();
    };

    return (
        <section className='mb-14 md:mb-16'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <div className='max-w-[830px] mx-auto flex flex-col items-center text-center'>
                    <AccountPageTitle className='mb-3'>
                        Copy or Share Link
                    </AccountPageTitle>
                    <NeonText
                        className='h4-title capitalize mb-4'
                        glowSpread={0.5}
                    >
                        Your friend must register using your referral link
                    </NeonText>
                    <div className='mb-8 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg max-w-2xl'>
                        <p className='text-sm md:text-base text-white/80 mb-2'>
                            <strong className='text-blue-400'>How it works:</strong>
                        </p>
                        <ul className='text-sm md:text-base text-white/70 space-y-2 text-left'>
                            <li className='flex items-start gap-2'>
                                <span className='text-blue-400 mt-1'>•</span>
                                <span>Friend signs up via your link → Referral record created (status: "pending")</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-blue-400 mt-1'>•</span>
                                <span>Friend makes purchases → System tracks total spending</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-blue-400 mt-1'>•</span>
                                <span>When friend reaches <strong className='text-yellow-400'>$20 total spending</strong> → Both get rewards automatically!</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-blue-400 mt-1'>•</span>
                                <span><strong className='text-green-400'>You get:</strong> 1,000 Gold Coins ($10) | <strong className='text-green-400'>Friend gets:</strong> 500 Gold Coins ($5)</span>
                            </li>
                        </ul>
                    </div>
                    {!isLoggedIn && (
                        <div className='mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg max-w-2xl'>
                            <p className='text-sm md:text-base text-white/90 mb-3 text-center'>
                                <strong className='text-yellow-400'>Login Required</strong>
                            </p>
                            <p className='text-sm md:text-base text-white/70 mb-4 text-center'>
                                Please log in to access your referral link and QR code.
                            </p>
                            <div className='flex justify-center'>
                                <Button
                                    asChild
                                    size={md ? 'lg' : 'md'}
                                    variant='primary'
                                >
                                    <Link href='/login'>Log In</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoggedIn && displayLink && (
                        <div className='mb-4 p-3 bg-neutral-800/30 rounded-lg border border-neutral-700 max-w-full'>
                            <p className='text-xs text-muted-foreground mb-1'>
                                Your Referral Link:
                            </p>
                            <p className='text-sm break-all font-mono'>
                                {displayLink}
                            </p>
                        </div>
                    )}
                    <ButtonGroup className='gap-5'>
                        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                            <Button
                                size={md ? 'lg' : 'md'}
                                disabled={isLoading || !isLoggedIn}
                                onClick={async () => {
                                    if (!isLoggedIn) {
                                        toastError('Please log in to generate QR code');
                                        return;
                                    }
                                    try {
                                        await generateQR();
                                        setQrDialogOpen(true);
                                    } catch (error) {
                                        console.error('Failed to generate QR code:', error);
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <span className='flex items-center'>
                                        <NeonIcon
                                            icon='svg-spinners:bars-rotate-fade'
                                            size={20}
                                            className='mr-2'
                                        />
                                        Loading...
                                    </span>
                                ) : (
                                    'Open QR Code'
                                )}
                            </Button>
                            <DialogContent className='max-w-md'>
                                <DialogHeader>
                                    <DialogTitle>Referral QR Code</DialogTitle>
                                </DialogHeader>
                                <div className='flex flex-col items-center gap-4 py-4'>
                                    {qrCodeDataURL ? (
                                        <>
                                            <div className='p-4 bg-white rounded-lg'>
                                                <Image
                                                    src={qrCodeDataURL}
                                                    alt='Referral QR Code'
                                                    width={300}
                                                    height={300}
                                                    className='w-full h-auto'
                                                />
                                            </div>
                                            <p className='text-sm text-muted-foreground text-center'>
                                                Share this QR code with your
                                                friends to invite them!
                                            </p>
                                        </>
                                    ) : (
                                        <div className='flex items-center justify-center py-8'>
                                            <NeonIcon
                                                icon='svg-spinners:bars-rotate-fade'
                                                size={32}
                                            />
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button
                            size={md ? 'lg' : 'md'}
                            variant='secondary'
                            onClick={handleCopyLink}
                            disabled={isLoading || !isLoggedIn}
                        >
                            {isLoading ? (
                                <>
                                    <NeonIcon
                                        icon='svg-spinners:bars-rotate-fade'
                                        size={20}
                                        className='mr-2'
                                    />
                                    Loading...
                                </>
                            ) : (
                                'Copy Invite Link'
                            )}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </section>
    );
}
