'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function WaysToPay() {
    const { xl, lg, md } = useBreakPoint();
    const waysInfo = [
        {
            coin: 'gold-coin',
            image: '/coins/gold-coin.svg',
            title: 'Gold Coins Mode',
            description:
                'Choose this mode to enjoy Bonus Games, Exclusive Games, and Signature Games using Gold Coins.',
            features: [
                'Free 10,000 GC on signup',
                'Daily bonuses',
                'Login streak bonuses',
                'GC are for fun, not redeemable',
            ],
            extras: (color: string) => (
                <NeonBox
                    glowColor={`var(${color})`}
                    glowSpread={0.5}
                    className='rounded-lg backdrop-blur-2xl px-5 py-4 mb-8 md:mb-12'
                >
                    <NeonText
                        as='p'
                        className='text-base font-bold capitalize'
                        glowColor={color}
                        glowSpread={0.1}
                    >
                        Gold Coins can also be purchased to unlock access to
                        exclusive and signature games.
                    </NeonText>
                </NeonBox>
            ),
            button: {
                title: 'How I Earn Gold Coins',
                href: '#',
                type: 'primary',
                tooltip: 'Learn how to collect and use Gold Coins for fun and exclusive gameplay.',
            },
            color: '--color-yellow-500',
        },
        {
            coin: 'sweep-coin',
            image: '/coins/sweep-coin.svg',
            title: 'Sweeps Coins Mode',
            description:
                'Choose this mode to play sweepstakes-style games using SC (Sweeps Coins) for a chance to win redeemable rewards no purchase needed.',
            features: [
                'No purchase necessary',
                'Earn SC Through Gameplay, Promotions, or Mail-In Entry',
                'SC Won From Gameplay May Be Redeemed for Rewards',
                'SC Given as a Bonus with Gold Coin Purchases Are Not Redeemable',
            ],
            button: {
                title: 'How I Earn Sweeps Coins',
                href: '#',
                type: 'secondary',
                tooltip: 'Find out how to earn Sweeps Coins for a chance to redeem rewards.',
            },
            color: '--color-green-500',
        },
    ];

    return (
        <section className='mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Two Ways to Play, One Epic Experience
                </NeonText>

                <div className='max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[32px] lg:gap-[40px]'>
                    {waysInfo.map((ways, index) => (
                        <NeonBox
                            key={index}
                            glowColor={ways.color}
                            backgroundColor={ways.color}
                            backgroundOpacity={0.2}
                            className='rounded-2xl backdrop-blur-2xl p-[24px] xl:p-[50px] lg:p-[40px] md:p-[30px] flex flex-col items-center'
                        >
                            <div className='relative mb-6'>
                                <Image
                                    src={ways.image}
                                    alt={ways.coin}
                                    width={lg ? '80' : '60'}
                                    height={lg ? '80' : '60'}
                                />
                                <div
                                    className='absolute left-1/2 top-1/2 aspect-square w-[100px] rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-2xl'
                                    style={{
                                        backgroundColor: `var(${ways.color})`,
                                    }}
                                ></div>
                            </div>

                            <NeonText
                                as='h3'
                                className='h3-title mb-2 text-center'
                                glowColor={ways.color}
                                glowSpread={0.5}
                            >
                                {ways.title}
                            </NeonText>
                            <NeonText
                                className='text-center text-base md:text-lg font-bold capitalize mb-6'
                                glowColor={ways.color}
                                glowSpread={0.2}
                            >
                                {ways.description}
                            </NeonText>

                            <ul
                                className={cn(
                                    'space-y-4 w-full mb-4',
                                    ways.extras && 'mb-8 md:mb-10'
                                )}
                            >
                                {ways.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className='flex gap-3 items-center'
                                    >
                                        <NeonIcon
                                            icon='lucide:circle-check'
                                            glowColor={ways.color}
                                            glowSpread={1}
                                            size={md ? 24 : 20}
                                        />
                                        <NeonText
                                            className=' text-base md:text-lg font-bold capitalize'
                                            glowColor={ways.color}
                                            glowSpread={0.2}
                                        >
                                            {feature}
                                        </NeonText>
                                    </li>
                                ))}
                            </ul>
                            {ways.extras && ways.extras(ways.color)}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className='mt-auto w-full md:w-auto'
                                        size={md ? 'lg' : 'md'}
                                        variant={ways.button.type as 'primary' | 'secondary' | 'neon'}
                                    >
                                        {ways.button.title}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                    side='top'
                                    sideOffset={8}
                                    className='border-0 px-4 py-3 backdrop-blur-2xl max-w-[280px]'
                                    style={{
                                        backgroundColor: `var(${ways.color})`,
                                        opacity: 0.95,
                                        boxShadow: `
                                            0 0 ${2 * 4}px var(${ways.color}),
                                            0 0 ${2 * 2 * 4}px var(${ways.color}),
                                            0 0 ${2 * 3 * 4}px var(${ways.color})
                                        `,
                                        border: `1px solid var(${ways.color})`,
                                    }}
                                >
                                    <p className='font-bold text-sm text-white tracking-wide text-center'>
                                        {ways.button.tooltip}
                                    </p>
                                </PopoverContent>
                            </Popover>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}
