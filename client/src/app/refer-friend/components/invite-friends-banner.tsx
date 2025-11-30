'use client';
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
import Image from 'next/image';
import { useState } from 'react';
import NeonIcon from '@/components/neon/neon-icon';
import { Link } from 'next-transition-router';
import { toastError } from '@/lib/toast';

export default function InviteFriendsBanner({
    isLoggedIn,
}: {
    isLoggedIn?: boolean;
}) {
    const { lg, md } = useBreakPoint();
    const { copyLink, generateQR, qrCodeDataURL, isLoading } = useReferral();
    const [qrDialogOpen, setQrDialogOpen] = useState(false);


    const CoinBox = ({ type, amount }: { type?: string; amount: string }) => (
        <div className='inline-flex gap-2'>
            {' '}
            <Image
                src={`/coins/${type == 'sweep-coin' ? 'sweep' : type == 'bronze-coin' ? 'bronze' : 'gold'}-coin.svg`}
                height={md ? '32' : '26'}
                // height={32}
                width={md ? '32' : '26'}
                alt=''
            />{' '}
            <span
                className={`${type == 'sweep-coin' ? 'text-green-400' : 'text-yellow-300'}`}
            >
                {amount}
            </span>
        </div>
    );

    return (
        <section className='mb-30 max-lg:mb-20'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <div className='grid grid-cols-1 md:grid-cols-2 max-md:gap-5 items-center'>
                    <div className="w-full aspect-[1.4/1] relative before:absolute before:content-[''] before:inset-0 before:shadow-[inset_0px_0px_50px_35px_rgba(49,10,71,1)] md:before:shadow-[inset_0px_0px_80px_70px_rgba(49,10,71,1)] lg:before:shadow-[inset_0px_0px_140px_110px_rgba(49,10,71,1)]">
                        <Image
                            src='/refer-friend/banner-img.jpg'
                            height={800}
                            width={800}
                            className='w-full h-full object-cover'
                            alt='Refer A friend'
                        />
                    </div>
                    <div className=" bg-cover bg-center bg-no-repeat h-full place-items-center grid shadow-[inset_0px_0px_100px_60px_rgba(49,10,71,1)] bg-[url('/refer-friend/banner-bg.jpg')]">
                        <div className='text-center flex flex-col items-center max-w-[600px] max-lg:py-10 max-md:py-0'>
                            <NeonText as='h1' className='h1-title mb-4'>
                                Invite friends
                            </NeonText>
                            <NeonText
                                as='p'
                                className='h4-title capitalize mb-6 md:mb-8'
                                glowSpread={0.5}
                            >
                                Earn rewards for every friend you bring onboard
                            </NeonText>
                            <div className='inline-flex max-md:flex-col items-center gap-2 md:gap-5 [&_span]:text-h2-title [&_span]:font-extrabold [&_span]:leading-none mb-7 md:mb-9'>
                                <CoinBox type='bronze-coin' amount='1,000' />
                                <span className='text-white/70 text-lg md:text-xl'>+</span>
                                <CoinBox type='bronze-coin' amount='500' />
                            </div>
                            <p className='text-sm md:text-base text-white/70 mb-4'>
                                You get <strong className='text-yellow-400'>1,000 Gold Coins</strong> when your friend qualifies
                            </p>
                            <p className='text-sm md:text-base text-white/70 mb-7 md:mb-9'>
                                Your friend gets <strong className='text-yellow-400'>500 Gold Coins</strong> when they reach $20 in purchases
                            </p>
                            {!isLoggedIn && (
                                <div className='mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg max-w-md mx-auto'>
                                    <p className='text-sm md:text-base text-white/90 mb-3 text-center'>
                                        <strong className='text-yellow-400'>Login Required</strong>
                                    </p>
                                    <p className='text-sm md:text-base text-white/70 mb-4 text-center'>
                                        Please log in to access your referral link and QR code.
                                    </p>
                                    <div className='flex justify-center'>
                                        <Button
                                            asChild
                                            size={lg ? 'lg' : 'md'}
                                            variant='primary'
                                        >
                                            <Link href='/login'>Log In</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {isLoggedIn && (
                                <ButtonGroup className='gap-5'>
                                    <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                                        <Button
                                            size={lg ? 'lg' : 'md'}
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
                                                    console.error(
                                                        'Failed to generate QR code:',
                                                        error
                                                    );
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
                                                <DialogTitle>
                                                    Referral QR Code
                                                </DialogTitle>
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
                                                            Share this QR code with
                                                            your friends to invite
                                                            them!
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
                                        size={lg ? 'lg' : 'md'}
                                        variant='secondary'
                                        onClick={async () => {
                                            if (!isLoggedIn) {
                                                toastError('Please log in to copy referral link');
                                                return;
                                            }
                                            await copyLink();
                                        }}
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
