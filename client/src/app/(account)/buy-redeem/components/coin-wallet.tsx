'use client';
import { useEffect, useState } from 'react';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { getBalance } from '@/lib/api/wallet';
import type { BalanceResponse } from '@/types/wallet.types';
import AccountPageTitle from '../../profile/components/account-page-title';

export default function CoinWallet() {
    const { sm, xl } = useBreakPoint();
    const BTN_SIZE = xl ? 'lg' : sm ? 'md' : 'sm';
    const router = useTransitionRouter();
    
    const [balance, setBalance] = useState<number>(0);
    const [currency, setCurrency] = useState<string>('GC');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch balance on mount
    useEffect(() => {
        const fetchBalance = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await getBalance() as BalanceResponse;
                
                if (response.success && response.data) {
                    setBalance(response.data.balance);
                    setCurrency(response.data.currency || 'GC');
                } else {
                    setError(response.message || 'Failed to fetch balance');
                }
            } catch (err) {
                console.error('Balance fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch balance');
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    // Format number with commas
    const formatBalance = (amount: number) => {
        return new Intl.NumberFormat('en-US').format(amount);
    };

    return (
        <section className='mb-12'>
            <AccountPageTitle as='h1' className='mb-8 max-lg:text-center'>
                Coin Wallet
            </AccountPageTitle>

            {/* Error message */}
            {error && (
                <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg'>
                    <NeonText className='text-red-400 text-sm'>
                        {error}
                    </NeonText>
                </div>
            )}

            <NeonBox
                glowColor='--color-yellow-500'
                glowSpread={0.5}
                backgroundColor='--color-yellow-500'
                backgroundOpacity={0.1}
                className='xxl:p-10 lg:p-8 md:p-6 px-4 py-6 rounded-lg flex items-center max-md:flex-col max-md:text-center justify-between xl:gap-8 md:gap-6 gap-5 backdrop-blur-2xl'
            >
                <div className='flex flex-col md:items-start items-center'>
                    <NeonText
                        as='h4'
                        className='h4-title mb-4'
                        glowColor='--color-yellow-500'
                        glowSpread={0.4}
                    >
                        Balance
                    </NeonText>
                    <div className='inline-flex items-center gap-3 leading-none'>
                        <Image
                            src='/coins/bronze-coin.svg'
                            height={64}
                            width={64}
                            alt={`${currency} Icon`}
                            className='xl:w-[64px] lg:w-[52px] sm:w-[42px] w-[34px] aspect-square'
                        />
                        {loading ? (
                            <span className='text-yellow-300 xs:text-h1-title text-h2-title font-extrabold! animate-pulse'>
                                ---
                            </span>
                        ) : (
                            <span className='text-yellow-300 xs:text-h1-title text-h2-title font-extrabold!'>
                                {formatBalance(balance)}
                            </span>
                        )}
                    </div>
                </div>

                <ButtonGroup className='xl:gap-6 gap-4'>
                    <Button size={BTN_SIZE} disabled={loading} onClick={() => router.push('/game-listing?tab=exclusive')}>
                        Use GC in Game
                    </Button>
                    <Button
                        size={BTN_SIZE}
                        variant='secondary'
                        onClick={() => router.push('/buy-coins')}
                        disabled={loading}
                    >
                        Buy More Coins
                    </Button>
                </ButtonGroup>
            </NeonBox>
        </section>
    );
}
