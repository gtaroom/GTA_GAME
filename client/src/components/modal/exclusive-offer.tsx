'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
export interface ExclusiveOfferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSeconds?: number;
}

export default function ExclusiveOfferModal({
    open,
    onOpenChange,
    initialSeconds = 300,
}: ExclusiveOfferModalProps) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        if (!open) return;
        if (secondsLeft <= 0) return;

        const id = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        return () => clearInterval(id);
    }, [open, secondsLeft]);

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');

    const handleClose = useCallback(() => {
        onOpenChange(false);
        setSecondsLeft(initialSeconds);
    }, [onOpenChange, initialSeconds]);

    const { xs } = useBreakPoint();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className='max-sm:max-w-[calc(100%-24px)]! sm:max-w-[600px]!'
                neonBoxClass='max-sm:px-0! max-sm:pt-7'
            >
                <div className='max-sm:px-4 sm:px-5 sm:py-3 flex flex-col items-center text-center'>
                    <Image
                        src='/modal/exclusive-offer.svg'
                        height={400}
                        width={400}
                        alt='Exclusive Offer Modal'
                        className='h-[100px] sm:h-[140px] w-auto mx-auto mb-6'
                    />

                    <NeonBox
                        className='mb-10 px-4! pb-5 pt-6 sm:px-8! rounded-xl w-full'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <DialogTitle className='mb-2' asChild>
                            <NeonText as='h4' className='h4-title'>
                                NEW PLAYER REWARD PACK
                            </NeonText>
                        </DialogTitle>

                        <p className='text-base font-bold mb-8'>
                            Spin, Save, and Win More!
                        </p>

                        <NeonBox
                            glowColor='--color-yellow-500'
                            backgroundColor='--color-yellow-500'
                            backgroundOpacity={0.1}
                            glowSpread={0.8}
                            className='py-3 px-8 rounded-lg inline-flex items-center justify-center gap-3 max-sm:mb-4 sm:mb-8'
                        >
                            <Image
                                src='/coins/gold-coin.svg'
                                height={32}
                                width={32}
                                alt='Gold Coin'
                            />
                            <span className='h5-title text-yellow-300 font-extrabold!'>
                                6,000 GC
                            </span>
                        </NeonBox>

                        <div
                            className={`flex ${!xs ? 'flex-col' : 'flex-row'} items-center w-full max-sm:gap-4 sm:gap-8`}
                        >
                            <NeonBox
                                glowColor='--color-blue-500'
                                backgroundColor='--color-blue-500'
                                backgroundOpacity={0.1}
                                glowSpread={0.8}
                                className={`p-4 rounded-lg grid place-items-center max-sm:gap-1 sm:gap-3 w-full ${xs && 'aspect-[1/0.7]'}`}
                            >
                                <NeonIcon
                                    icon='lucide:coins'
                                    size={40}
                                    glowColor='--color-blue-500'
                                />
                                <NeonText
                                    as='span'
                                    glowColor='--color-blue-500'
                                    className='font-bold text-lg'
                                >
                                    600 GC
                                </NeonText>
                            </NeonBox>

                            <NeonBox
                                glowColor='--color-fuchsia-500'
                                backgroundColor='--color-fuchsia-500'
                                backgroundOpacity={0.1}
                                glowSpread={0.8}
                                className={`p-4 rounded-lg grid place-items-center max-sm:gap-1 sm:gap-3 w-full ${xs && 'aspect-[1/0.7]'}`}
                            >
                                <NeonIcon
                                    icon='lucide:ferris-wheel'
                                    size={40}
                                    glowColor='--color-fuchsia-500'
                                />
                                <NeonText
                                    as='span'
                                    glowColor='--color-fuchsia-500'
                                    className='font-bold text-lg'
                                >
                                    1 Mystery Spin
                                </NeonText>
                            </NeonBox>
                        </div>
                    </NeonBox>

                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='px-4 py-4 sm:px-8 inline-flex items-center rounded-lg gap-3 mb-8'
                    >
                        <NeonIcon
                            icon='lucide:clock'
                            size={24}
                            glowColor='--color-red-500'
                            className='-mb-[2px]'
                        />
                        <NeonText
                            glowColor='--color-red-500'
                            className='text-base sm:text-xl uppercase font-bold -mb-[2px]'
                            glowSpread={0.5}
                        >
                            EXPIRES IN: {minutes}:{secs} MINUTES
                        </NeonText>
                    </NeonBox>

                    <Button size='lg' className='mb-6' onClick={handleClose}>
                        Claim Now For $60
                    </Button>

                    <span className='line-through text-lg font-bold'>
                        Original: ~$47.99
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
