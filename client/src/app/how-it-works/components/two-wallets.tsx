'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';

export default function TwoWallets() {
    const { lg } = useBreakPoint();

    const coinIcons = {
        GC: {
            src: '/coins/gold-coin.svg',
            alt: 'gold-coin',
        },
        SC: {
            src: '/coins/sweep-coin.svg',
            alt: 'sweep-coin',
        },
    };

    const coinsInfo = [
        {
            coin: 'gold-coin',
            image: coinIcons.GC,
            title: 'GC',
            tooltip: {
                content:
                    'GC includes Bonus GC (free) in your Bonus Games Wallet and Purchased GC in your Exclusive & Signature Wallet. GC is for gameplay only and is never redeemable.',
            },
            color: '--color-yellow-500',
        },
        {
            coin: 'sweep-coin',
            image: coinIcons.SC,
            title: 'SC',
            tooltip: {
                content:
                    'SC in your Bonus Games Wallet may be used for sweepstakes entries if obtained through the free entry form (AMOE) or promos, and may be redeemable once all requirements under the Official Rules are met. SC in your Exclusive & Signature Wallet may be awarded through sweepstakes-style gameplay and may also be used for sweepstakes entries and redeemed if eligible under the Official Rules.',
            },
            color: '--color-green-500',
        },
    ];

    const walletsInfo = [
        {
            id: 'bonus-games-wallet',
            title: 'Bonus Gold Coin',
            coinSupport: ['GC', 'SC'],
            userFor: 'Bonus Games',
            balanceInfo: [
                {
                    title: 'Bonus GC',
                    description: [
                        'Gold Coins earned free from daily logins, sign-up bonuses, streaks, or select promotions. Used only for Bonus Games within the platform. For entertainment use only — not redeemable for rewards.',
                    ],
                    color: 'yellow',
                },
                {
                    title: 'PURCHASED GC',
                    description: [
                        'Gold Coins purchased to unlock and play Exclusive and Signature Games.',
                        'For entertainment purposes only. Not redeemable for rewards.',
                    ],
                    color: 'yellow',
                },
            ],
            keyNotes: {
                description: [
                    'GC are for gameplay only and have no monetary value.',
                    'GC may be purchased to play Exclusive or Signature Games, or earned free from daily logins, streaks, or select promotions.',
                    'GC are for entertainment purposes only and are never redeemable for rewards.',
                ],
            },
            bottomContent:
                'GC balances do not move between wallets and cannot be converted to SC.',
        },
        {
            id: 'exclusive-signature-wallet',
            title: 'Reward Wallet',
            coinSupport: ['GC'],
            userFor: 'Exclusive Games & Signature Games',
            balanceInfo: [
                {
                    title: 'BONUS SC',
                    description:
                        'Sweep Coins received from the Free Entry Form or select promotions. Used for Sweepstakes-style gameplay. May be redeemed for rewards if eligible under the Official Rules.',
                    color: 'green',
                },
                {
                    title: 'Earned SC',
                    description:[
                        'Sweep Coins earned through Sweepstakes-style gameplay using Bonus SC.',
                        'Can be used to continue Sweepstakes-style play or redeemed for rewards if eligible under the Official Rules.',
                    ],                        
                    color: 'green',
                },
            ],
            keyNotes: {
                // title: 'This wallet may contain Purchased GC and Earned SC.',
                description: [
                    'SC may be obtained free through select promotions, the Free Entry Form, or earned through Sweepstakes-style gameplay.',
                    'SC are used for Sweepstakes entries and may qualify for redemption if eligible under the Official Rules.',
                    'Redemption eligibility is based on verification and compliance with the Official Rules.',
                ],
            },
            bottomContent:
                'SC balances do not move between wallets, and GC can never be exchanged for SC.',
        },
    ];

    return (
        <section>
            <div className='container-xxl'>
                <div className='max-w-[1200px] mx-auto mb-14 xl:mb-20 md:mb-16'>
                    <div className='max-w-[1000px] mx-auto text-center'>
                        <NeonText as='h2' className='h2-title mb-3 text-center'>
                            Your Two Wallets
                        </NeonText>
                        <NeonText
                            as='p'
                            className='text-base md:text-lg font-bold capitalize mb-[30px] md:mb-[40px]'
                        >
                            On GTOA, your balances are organized into two
                            wallets. Each wallet powers specific game types and
                            follows its own rules for how coins are earned and
                            used.
                        </NeonText>
                        <ButtonGroup className='gap-8 lg:gap-10 mb-10 lg:mb-14 flex-col md:flex-row w-full'>
                            {coinsInfo.map((coin, index) => (
                                <NeonBox
                                    key={index}
                                    glowColor={coin.color}
                                    backgroundColor={coin.color}
                                    backgroundOpacity={0.2}
                                    glowSpread={0.8}
                                    className='inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-pill backdrop-blur-3xl'
                                >
                                    <Image
                                        src={coin.image.src}
                                        alt={coin.coin}
                                        width={lg ? '32' : '24'}
                                        height={lg ? '32' : '24'}
                                        className='motion-safe:motion-scale-loop-[1.06] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear'
                                    /> {' '}
                                    <NeonText
                                        as='span'
                                        glowColor={coin.color}
                                        className='font-bold text-xl lg:text-3xl'
                                        glowSpread={0.4}
                                    >
                                        {coin.title}
                                    </NeonText>
                                    <Tooltip>
                                        <TooltipTrigger className='leading-none -mb-1'>
                                            <NeonIcon
                                                icon='lucide:info'
                                                glowColor={coin.color}
                                                size={lg ? 32 : 24}
                                                className='ms-3'
                                                glowSpread={0.5}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent
                                            neon
                                            side='bottom'
                                            align='center'
                                            className='max-w-[240px] text-white backdrop-blur-3xl'
                                            glowColor={coin.color}
                                            backgroundColor={coin.color}
                                            backgroundOpacity={0.2}
                                            glowSpread={0.8}
                                        >
                                            {coin.tooltip.content}
                                        </TooltipContent>
                                    </Tooltip>
                                </NeonBox>
                            ))}
                        </ButtonGroup>
                    </div>

                    <div className='grid gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 mb-10 md:mb-12'>
                        {walletsInfo.map((wallet, index) => (
                            <NeonBox
                                key={index}
                                glowColor='--color-purple-500'
                                backgroundColor='--color-purple-500'
                                backgroundOpacity={0.1}
                                className='backdrop-blur-2xl rounded-2xl p-6 lg:p-8'
                            >
                                <div className='flex items-left md:items-center gap-4 mb-4 flex-col md:flex-row'>
                                    {/* <div className='inline-flex items-center gap-3'>
                                        {wallet.coinSupport.map(
                                            (coin, index) => {
                                                const { src, alt } =
                                                    coinIcons[
                                                        coin as keyof typeof coinIcons
                                                    ] || {};
                                                return src ? (
                                                    <Image
                                                        key={index}
                                                        src={src}
                                                        alt={alt}
                                                        width={32}
                                                        height={32}
                                                        className='motion-safe:motion-scale-loop-[1.06] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear'
                                                    />
                                                ) : null;
                                            }
                                        )}
                                    </div> */}

                                    <NeonText as='h6' className='h5-title'>
                                        {wallet.title}
                                    </NeonText>
                                </div>
                                <NeonText
                                    as='p'
                                    className='text-lg font-bold capitalize mb-3 sm:mb-5'
                                >
                                    User For: {wallet.userFor}
                                </NeonText>

                                <NeonText
                                    as='p'
                                    className='text-lg font-bold uppercase mb-4'
                                    glowColor='--color-blue-500'
                                    glowSpread={0.5}
                                >
                                    Balances you’ll see here
                                </NeonText>

                                <div className='space-y-6 mb-5'>
                                    {wallet.balanceInfo.map(
                                        (balance, index) => {
                                            const descriptions = Array.isArray(
                                                balance.description
                                            )
                                                ? balance.description
                                                : [balance.description]; // normalize

                                            return (
                                                <NeonBox
                                                    key={index}
                                                    glowColor='--color-purple-500'
                                                    backgroundColor='--color-purple-500'
                                                    backgroundOpacity={0.1}
                                                    glowSpread={0.5}
                                                    className='p-4 md:p-7 rounded-2xl'
                                                >
                                                    <NeonText
                                                        as='span'
                                                        className='text-xl font-bold uppercase mb-3 block'
                                                        glowColor={`--color-${balance.color}-500`}
                                                        glowSpread={0.5}
                                                    >
                                                        {balance.title}
                                                    </NeonText>

                                                    {descriptions.length > 1 ? (
                                                        <ul className='list-disc pl-5 space-y-2 pr-2'>
                                                            {descriptions.map(
                                                                (desc, idx) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        <NeonText
                                                                            as='span'
                                                                            className='text-base font-bold capitalize leading-6.5'
                                                                            glowColor='--color-purple-500'
                                                                            glowSpread={
                                                                                0.2
                                                                            }
                                                                        >
                                                                            {
                                                                                desc
                                                                            }
                                                                        </NeonText>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <NeonText
                                                            as='p'
                                                            className='text-base font-bold capitalize leading-6.5'
                                                            glowColor='--color-purple-500'
                                                            glowSpread={0.2}
                                                        >
                                                            {descriptions[0]}
                                                        </NeonText>
                                                    )}
                                                </NeonBox>
                                            );
                                        }
                                    )}
                                </div>

                                <NeonText
                                    as='p'
                                    className='text-lg font-bold uppercase mb-2'
                                    glowColor='--color-blue-500'
                                    glowSpread={0.5}
                                >
                                    Key notes
                                </NeonText>

                                {/* {wallet.keyNotes.title && (
                                    <NeonText
                                        as='p'
                                        className='text-base font-bold capitalize leading-6.5 mb-2'
                                        glowColor='--color-purple-500'
                                        glowSpread={0.2}
                                    >
                                        {wallet.keyNotes.title}
                                    </NeonText>
                                )} */}

                                <ul className='list-disc pl-5 space-y-2 pr-2 mb-5 md:mb-8'>
                                    {wallet.keyNotes.description.map(
                                        (note, index) => (
                                            <li key={index}>
                                                <NeonText
                                                    as='p'
                                                    className='text-base font-bold capitalize leading-6.5'
                                                    glowColor='--color-purple-500'
                                                    glowSpread={0.2}
                                                >
                                                    {note}
                                                </NeonText>
                                            </li>
                                        )
                                    )}
                                </ul>

                                <NeonBox
                                    className='w-full border-t-0 border-x-0 rounded-pill mb-5 md:mb-7'
                                    borderWidth={1}
                                ></NeonBox>

                                {wallet.bottomContent && (
                                    <NeonText
                                        as='p'
                                        className='text-base font-bold capitalize leading-6.5'
                                        glowColor='--color-purple-500'
                                        glowSpread={0.2}
                                    >
                                        {wallet.bottomContent}
                                    </NeonText>
                                )}
                            </NeonBox>
                        ))}
                    </div>

                    <NeonBox
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                        className='backdrop-blur-2xl rounded-2xl p-5 md:p-8'
                    >
                        <NeonText as='h4' className='h4-title mb-4'>
                            Why We Keep Wallets Separate
                        </NeonText>

                        <ul className='list-disc pl-5 space-y-2 pr-2'>
                            {[
                                'Know which coins are for free gameplay.',
                                'See which coins were purchased for premium games.',
                                'Identify which SC may be eligible for redemption under the official rules.',
                            ].map((text, index) => (
                                <li key={index}>
                                    <NeonText
                                        as='span'
                                        className='text-base font-bold capitalize leading-6.5'
                                        glowColor='--color-purple-500'
                                        glowSpread={0.2}
                                    >
                                        {text}
                                    </NeonText>
                                </li>
                            ))}
                        </ul>
                    </NeonBox>
                </div>
            </div>
        </section>
    );
}