'use client';
import NeonBox from '@/components/neon/neon-box';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsLoggedIn } from '@/contexts/auth-context';
import { coinPackages } from '@/data/coins-package';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import type { CoinPackage } from '../types';
import PaymentModal from './payment-modal';

export default function CoinPackages() {
    const { sm, md } = useBreakPoint();
    const { isLoggedIn } = useIsLoggedIn();
    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
        null
    );
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const GRID_COMMON_CLASS =
        'grid lg:grid-cols-[1fr_1fr_1fr_0.5fr] grid-cols-[1.2fr_1.2fr_1fr_0.66fr] [&>div]:capitalize [&>div]:px-6 [&>div]:text-lg [&>div]:font-extrabold';
    const ROW_BLOCK_PADDING = md ? 12 : 8;
    const ROW_GAP = 24;

    const handleNeonBoxClick = (coinPackage: CoinPackage) => {
        setSelectedPackage(coinPackage);
        setIsDialogOpen(true);
    };

    return (
        <>
            <section className='mb-14 xl:mb-20 md:mb-16'>
                <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                    <div className='max-w-[850px] mx-auto'>
                        <ScrollArea type='always'>
                            <div className='min-w-[700px] sm:px-4.5 px-2'>
                                <div
                                    className={cn(
                                        GRID_COMMON_CLASS,
                                        ' [&>div]:pt-4 [&>div]:pb-5'
                                    )}
                                >
                                    {['GC Total', 'Bonus', 'Tag', 'Price'].map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                {...(index === 1 && {
                                                    className:
                                                        'bg-[#A761FF]/20 rounded-tl-xl rounded-tr-xl',
                                                })}
                                            >
                                                <span className='whitespace-nowrap'>
                                                    {item}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div
                                    className={`space-y-[${ROW_GAP}px] mb-6 [&>div]:last:overflow-hidden`}
                                >
                                    {coinPackages.map((pkg, idx) => {
                                        // Extract amount from price string (remove $ and convert to number)
                                        const amount = parseFloat(
                                            pkg.price.replace('$', '')
                                        );

                                        return (
                                            <NeonBox
                                                key={idx}
                                                enableHover
                                                className={cn(
                                                    GRID_COMMON_CLASS,
                                                    `items-center [&>div]:py-[${ROW_BLOCK_PADDING}px] md:rounded-[20px] rounded-xl backdrop-blur-sm relative cursor-pointer`
                                                )}
                                                glowSpread={sm ? 1 : 0.6}
                                                backgroundColor='--color-purple-500'
                                                backgroundOpacity={0.1}
                                                onClick={() =>
                                                    handleNeonBoxClick({
                                                        totalGC: Number(
                                                            pkg.totalGC.replace(
                                                                /[^\d]/g,
                                                                ''
                                                            )
                                                        ),
                                                        bonusGC: pkg.bonusGC
                                                            ? Number(
                                                                  pkg.bonusGC.replace(
                                                                      /[^\d]/g,
                                                                      ''
                                                                  )
                                                              )
                                                            : undefined,
                                                        tag: pkg.tag,
                                                        price: pkg.price,
                                                        amount: amount,
                                                        productId:
                                                            process.env
                                                                .NEXT_PUBLIC_PRODUCT_ID,
                                                    })
                                                }
                                            >
                                                <div className='text-yellow-300 flex items-center gap-2'>
                                                    <Image
                                                        src='/coins/bronze-coin.svg'
                                                        height={24}
                                                        width={24}
                                                        alt='GC Icon'
                                                    />
                                                    <span className='whitespace-nowrap'>
                                                        {pkg.totalGC}
                                                    </span>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'text-yellow-300 relative',
                                                        `before:absolute before:content-[''] before:left-0 before:-top-3 before:z-[-6] before:w-full before:h-[calc(100%+${ROW_BLOCK_PADDING * 2 + ROW_GAP}px)] before:bg-[#A761FF]/20`
                                                    )}
                                                >
                                                    <span className='whitespace-nowrap'>
                                                        {pkg.bonusGC ?? '-'}
                                                    </span>
                                                </div>
                                                <div className='text-yellow-300'>
                                                    <span className='whitespace-nowrap'>
                                                        {pkg.tag ?? '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <Button
                                                        size='sm'
                                                        className='w-[64px] text-base!'
                                                    >
                                                        {pkg.price}
                                                    </Button>
                                                </div>
                                            </NeonBox>
                                        );
                                    })}
                                </div>
                            </div>
                            <ScrollBar orientation='horizontal' />
                        </ScrollArea>
                    </div>
                    <div className='sm:px-4.5 px-2'>
                        <p className='text-base font-bold text-center capitalize mt-4'>
                            Gold Coins are for play only, while Sweeps Coins
                            (SC) can be earned for free and redeemed for rewards
                            — no purchase necessary
                        </p>
                    </div>
                </div>
            </section>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                selectedPackage={selectedPackage}
            />
        </>
    );
}
