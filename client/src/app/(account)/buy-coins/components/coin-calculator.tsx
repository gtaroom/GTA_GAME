'use client';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsLoggedIn } from '@/contexts/auth-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useState } from 'react';
import AccountPageTitle from '../../profile/components/account-page-title';
import type { CoinPackage } from '../types';
import PaymentModal from './payment-modal';

export default function CoinCalculator() {
    const { sm, xl } = useBreakPoint();
    const ELEMENT_SIZE = xl ? 'lg' : sm ? 'md' : 'sm';
    const { isLoggedIn } = useIsLoggedIn();
    
    const [amount, setAmount] = useState<string>('');
    const [calculatedCoins, setCalculatedCoins] = useState<{
        baseCoins: number;
        bonusCoins: number;
        totalCoins: number;
    } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
        null
    );

    const calculateCoins = () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 5) {
            setCalculatedCoins(null);
            return;
        }

        // Base calculation: $1 = 100 Gold Coins
        const baseCoins = numAmount * 100;
        let bonusCoins = 0;

        // Bonus calculation: Every $10 gets bonus, capped at 500
        if (numAmount >= 5) {
            const bonusTier = Math.floor(numAmount / 10);
            bonusCoins = Math.min((bonusTier + 1) * 100, 500); // Cap at 500
        }

        const calculation = {
            baseCoins,
            bonusCoins,
            totalCoins: baseCoins + bonusCoins,
        };

        setCalculatedCoins(calculation);

        // Create package object for payment modal
        const packageData: CoinPackage = {
            totalGC: baseCoins,
            bonusGC: bonusCoins > 0 ? bonusCoins : undefined,
            tag: bonusCoins > 0 ? 'Custom Package' : undefined,
            price: `$${numAmount}`,
            amount: numAmount,
            productId: process.env.NEXT_PUBLIC_PRODUCT_ID || 'custom_package',
        };

        setSelectedPackage(packageData);
        setIsPaymentModalOpen(true);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        setCalculatedCoins(null); // Clear calculation when amount changes
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            calculateCoins();
        }
    };

    return (
        <>
            <section className='mb-14 xl:mb-20 md:mb-16'>
                <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                    <AccountPageTitle
                        as='h1'
                        className={
                            isLoggedIn
                                ? 'mb-8 max-lg:text-center'
                                : 'mb-12 text-center'
                        }
                    >
                        Custom Packages
                    </AccountPageTitle>
                    <div className='flex sm:items-start items-center max-sm:text-center flex-col max-w-[600px] mx-auto'>
                        <NeonText
                            as='span'
                            className='mb-5 text-lg font-bold inline-flex items-center gap-2'
                        >
                            <NeonIcon
                                icon='clarity:coin-bag-solid'
                                glowColor='--color-purple-500'
                                size={24}
                            />{' '}
                            $1 = 100 Exclusive Gold Coins
                        </NeonText>
                        <div className='flex items-center max-xs:flex-col gap-4 w-full mb-5'>
                            <Input
                                glowSpread={0.8}
                                type='number'
                                size={ELEMENT_SIZE}
                                placeholder='Enter amount'
                                value={amount}
                                onChange={handleAmountChange}
                                onKeyPress={handleKeyPress}
                                min='5'
                                step='0.01'
                            />
                            <Button
                                variant='secondary'
                                size={ELEMENT_SIZE}
                                onClick={calculateCoins}
                                disabled={!amount || parseFloat(amount) < 5}
                            >
                                Calculate & Buy
                            </Button>
                        </div>
                        {/* Calculation Results */}
                        {calculatedCoins && (
                            <div className='w-full mb-5'>
                                <div className='bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm'>
                                    <div className='text-center mb-4'>
                                        <NeonText
                                            as='h3'
                                            className='text-xl font-bold mb-2'
                                            glowColor='--color-purple-500'
                                        >
                                            Package Breakdown
                                        </NeonText>
                                        <div className='text-2xl font-bold text-yellow-300 mb-2'>
                                            ${amount}
                                        </div>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-white/80'>
                                                Base Gold Coins:
                                            </span>
                                            <span className='text-yellow-300 font-bold'>
                                                {calculatedCoins.baseCoins.toLocaleString()}{' '}
                                                GC
                                            </span>
                                        </div>

                                        {calculatedCoins.bonusCoins > 0 && (
                                            <div className='flex justify-between items-center'>
                                                <span className='text-white/80'>
                                                    Bonus Gold Coins:
                                                </span>
                                                <span className='text-green-400 font-bold'>
                                                    +
                                                    {calculatedCoins.bonusCoins.toLocaleString()}{' '}
                                                    GC
                                                </span>
                                            </div>
                                        )}

                                        <div className='border-t border-white/20 pt-3'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-white font-bold'>
                                                    Total Gold Coins:
                                                </span>
                                                <span className='text-yellow-300 font-bold text-lg'>
                                                    {calculatedCoins.totalCoins.toLocaleString()}{' '}
                                                    GC
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <span className='capitalize font-bold'>
                            Enter an amount (minimum $5) to customize your
                            package.
                        </span>
                    </div>
                </div>
            </section>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                selectedPackage={selectedPackage}
            />
        </>
    );
}
