'use client';

import millify from 'millify';
import Image from 'next/image';
import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/contexts/auth-context';
import { useGames } from '@/contexts/game-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

type CoinKey = 'bonus_gc' | 'game_gc' | 'sc';

interface CoinConfig {
    label: string;
    amount: number;
    img: string;
    colorClass: string;
    tooltip: React.ReactNode;
    badge?: React.ReactNode;
    description:string;
    fullLabel:string
}

// Utility function to format coin amounts (abbreviated)
const formatCoinAmount = (amount: number): string => {
    if (amount < 1000) {
        return amount.toString();
    }

    return millify(amount, {
        precision: amount >= 1000000 ? 1 : 0,
        lowercase: false,
        space: false,
    });
};

// Utility function to format full amount with commas
const formatFullAmount = (amount: number): string => {
    return amount.toLocaleString('en-US');
};

export default function CurrencySwitch({ className }: { className?: string }) {
    const { md } = useBreakPoint();
    const { user } = useAuth();
    const { activeGameType } = useGames();
    const { balance: walletBalance, loading: walletLoading } = useWalletBalance();

    // Determine which GC to show based on active game type
    const isOnBonusGames = activeGameType === 'bonus';
    const defaultCoin: CoinKey = isOnBonusGames ? 'bonus_gc' : 'game_gc';
    
    const [value, setValue] = React.useState<CoinKey>(defaultCoin);

    // Update selected coin when game type changes
    React.useEffect(() => {
        if (value === 'bonus_gc' || value === 'game_gc') {
            setValue(isOnBonusGames ? 'bonus_gc' : 'game_gc');
        }
    }, [isOnBonusGames, value]);

    // Build dynamic coin configs
    const COINS: Record<CoinKey, CoinConfig> = {
        bonus_gc: {
            label: 'GC',
            fullLabel:'Gold Coins',
            description:'Play-for-fun mode. Used for bonus games, daily rewards, and casual gameplay.',
           amount: user?.balance || 0,
            img: '/coins/gold-coin.svg',
            colorClass: 'text-yellow-300',
            badge: (
                <span className='ml-1.5 px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-[10px] font-bold text-yellow-300 uppercase'>
                    Free
                </span>
            ),
            tooltip: (
                <>
                    <div className='mb-1 font-bold text-white'>Gold Coins (Free)</div>
                    <div className='text-sm text-white opacity-90'>
                        Free play currency for <strong>Bonus Games</strong> only. Earned through bonuses and rewards.
                    </div>
                </>
            ),
        },
        game_gc: {
            label: 'GC',
            fullLabel: 'Exlusive Gold Coins',
        description: 'Play-for-fun mode. Used to access exclusive and signature games for entertainment only.',
            amount: walletBalance || 0,
            img: '/coins/bronze-coin.svg',
            colorClass: 'text-yellow-300',
            badge: (
                <span className='ml-1.5 px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-[10px] font-bold text-purple-300 uppercase'>
                    Premium
                </span>
            ),
            tooltip: (
                <>
                    <div className='mb-1 font-bold text-white'>Exclusive Gold Coins</div>
                    <div className='text-sm text-white opacity-90'>
                        Purchased currency for <strong>Signature, Exclusive, Slots & Fish Games</strong>. Buy via wallet.
                    </div>
                </>
            ),
        },
        sc: {
            label: 'SC',
            fullLabel: 'Sweep Coins',
            description:
            'Promotional play mode. Used for sweepstakes-style games available in supported regions per terms.',
            amount: user?.sweepCoins || 0,
            img: '/coins/sweep-coin.svg',
            colorClass: 'text-green-400',
            tooltip: (
                <>
                    <div className='mb-1 font-bold text-white'>Sweep Coins (SC)</div>
                    <div className='text-sm text-white opacity-90'>
                        Promotional currency. Eligible for redemptions per terms in supported regions. Works on all games.
                    </div>
                </>
            ),
        },
    };

    const coin = COINS[value];

    // Show only the relevant GC based on game type, plus SC
    const availableCoins: CoinKey[] =  ['bonus_gc', 'game_gc','sc'];

    return (
        <div className={cn('*:not-first:mt-2', className)}>
            <Select
                value={value}
                onValueChange={v => setValue(v as CoinKey)}
            >
                <SelectTrigger className='[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'>
                    <div className='flex items-center gap-1.5 -mr-1'>
                        <div className='flex items-center gap-1 shrink-0'>
                            <Image
                                src={coin.img}
                                width={24}
                                height={24}
                                alt={coin.label}
                                className='shrink-0'
                            />
                        </div>

                        <span
                            className={`truncate xl:text-lg text-base font-extrabold ${coin.colorClass} flex items-center gap-1`}
                        >
                            {walletLoading && (value === 'game_gc') ? (
                                <Icon icon='lucide:loader-2' className='animate-spin text-sm' />
                            ) : (
                                md ? formatFullAmount(coin.amount) : formatCoinAmount(coin.amount)
                            )}
                        </span>
                    </div>
                </SelectTrigger>

                    <SelectContent
                      align='center'
                      sideOffset={20}
                      
                      className='[&_*[role=option]]:ps-3 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0'
                     >
                        {availableCoins.map(coinKey => {
                            const coinData = COINS[coinKey];
                            return (
                                <SelectItem key={coinKey} value={coinKey}>
                                 <div className='flex flex-col gap-1 max-w-[240px]'>
                                <div className='flex items-center gap-2'>
                                    <Image
                                        src={coinData.img}
                                        height={24}
                                        width={24}
                                        alt={coinData.fullLabel}
                                        className='shrink-0'
                                    />
                                    <span
                                        className={`truncate ${coinData.colorClass} font-extrabold`}
                                    >
                                        {formatFullAmount(coinData.amount)}{' '}
                                        {coinData.fullLabel} ({coinData.label})
                                    </span>
                                </div>
                                <div className='text-sm text-white opacity-90'>
                                    {coinData.description}
                                </div>
                            </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
            </Select>
        </div>
    );
}
