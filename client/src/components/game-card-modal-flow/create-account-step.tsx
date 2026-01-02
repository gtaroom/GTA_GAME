import PaymentModal from '@/app/(account)/buy-coins/components/payment-modal';
import type { CoinPackage } from '@/app/(account)/buy-coins/types';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
    CreateAccountStepProps,
    ProcessInfo,
} from '../../types/game-account.types';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GameModalTitle from './game-modal-title';

// Validation constants
const MIN_BALANCE_REQUIRED = 1000; // Minimum GC required for account creation
const MIN_ADD_LOOT = 10; // Minimum recharge amount in dollars
const CONVERSION_RATE = 100; // 1 USD = 100 GC

export default function CreateAccountStep({
    game,
    onBack,
    onSuccess,
    onRequestAccount,
    isLoading = false,
    error = null,
    hasPendingRequest = false,
    requestStatus,
    rejectionReason,
}: CreateAccountStepProps) {
    const { balance: userBalance, loading: balanceLoading } =
        useWalletBalance();
    const router = useRouter();
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [showAmountError, setShowAmountError] = useState<string | null>(null);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
        null
    );

    // Balance validation
    const hasEnoughBalance = userBalance >= MIN_BALANCE_REQUIRED;
    const isRejected = requestStatus === 'rejected';

    const processInfo: ProcessInfo[] = [
        {
            description: 'This process usually takes a few minutes.',
            color: '--color-blue-500',
        },
        {
            icon: 'lucide:square-check',
            description:
                "You'll receive an email or text (based on your selected preference) from our support team once your Gold Coins have been added and your account is ready to play",
            color: '--color-orange-500',
        },
    ];

    const handleBuyCoinsClick = () => {
        const amount = parseFloat(rechargeAmount);

        // Validate amount
        // if (!rechargeAmount || isNaN(amount) || amount < MIN_ADD_LOOT) {
        //     setShowAmountError(
        //         `Please enter a valid amount (minimum $${MIN_ADD_LOOT})`
        //     );
        //     return;
        // }
        if (!rechargeAmount || isNaN(amount) || amount < 1) {
            setShowAmountError(`Please enter a valid amount `);
            return;
        }

        // Clear any errors
        setShowAmountError(null);

        // Calculate coins
        const baseCoins = amount * CONVERSION_RATE;
        let bonusCoins = 0;

        // Bonus calculation: Every $10 gets bonus, capped at 500
        if (amount >= 10) {
            const bonusTier = Math.floor(amount / 10);
            bonusCoins = Math.min((bonusTier + 1) * 100, 500);
        }

        // Create package object for payment modal
        const packageData: CoinPackage = {
            totalGC: baseCoins,
            bonusGC: bonusCoins > 0 ? bonusCoins : undefined,
            tag: bonusCoins > 0 ? 'Custom Package' : undefined,
            price: `$${amount}`,
            amount: amount,
            productId: process.env.NEXT_PUBLIC_PRODUCT_ID || 'custom_package',
        };

        setSelectedPackage(packageData);
        setIsPaymentModalOpen(true);
    };

    const handleRequestAccount = async () => {
        // Clear previous errors
        setShowAmountError(null);

        if (!hasEnoughBalance) {
            // Show payment modal instead of redirecting
            handleBuyCoinsClick();
            return;
        }

        // Validate recharge amount if provided
        const amount = parseFloat(rechargeAmount);
        if (rechargeAmount && rechargeAmount.trim() !== '') {
            if (isNaN(amount) || amount < MIN_ADD_LOOT) {
                setShowAmountError(
                    `Minimum recharge amount is $${MIN_ADD_LOOT}`
                );
                return;
            }

            // Check if user has enough balance for the recharge amount
            const requiredGC = amount * CONVERSION_RATE;
            if (userBalance < requiredGC) {
                setShowAmountError(
                    `Insufficient balance. You need ${requiredGC.toLocaleString()} GC (worth $${amount.toFixed(2)}) but only have ${userBalance.toLocaleString()} GC`
                );
                return;
            }

            // Pass amount to request
            await onRequestAccount(amount);
        } else {
            // No recharge amount provided, just create account
            await onRequestAccount();
        }
    };

    return (
        <>
            <div className='max-w-[500px] px-2 pb-2 mx-auto'>
                <GameModalTitle
                    title={game.name}
                    description={
                        hasPendingRequest
                            ? 'Your request is being processed by our support team.'
                            : isRejected
                              ? 'Your previous request was not approved. Please review and try again.'
                              : "We're currently waiting for your game account confirmation."
                    }
                />

                <div className='flex flex-col items-center gap-4 mb-6'>
                    <NeonIcon
                        icon='svg-spinners:bars-rotate-fade'
                        glowColor='var(--color-blue-500)'
                        size={40}
                    />
                    <NeonText
                        as='span'
                        glowColor='var(--color-blue-500)'
                        className='h6-title uppercase'
                    >
                        {hasPendingRequest
                            ? 'Account request in progress...'
                            : isLoading
                              ? 'Creating game account...'
                              : 'Ready to create account'}
                    </NeonText>
                </div>

                {error && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-3 rounded-lg mb-6'
                    >
                        <div className='flex items-center gap-2 text-red-400'>
                            <NeonIcon
                                icon='lucide:alert-circle'
                                size={16}
                                glowColor='--color-red-500'
                            />
                            <span className='text-sm'>{error}</span>
                        </div>
                    </NeonBox>
                )}

                {isRejected && rejectionReason && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-5 rounded-lg mb-6'
                    >
                        <div className='flex items-start gap-4'>
                            <NeonIcon
                                icon='lucide:x-circle'
                                size={24}
                                glowColor='--color-red-500'
                            />
                            <div className='flex-1'>
                                <NeonText
                                    glowColor='--color-red-500'
                                    className='text-lg font-bold text-red-400 mb-3'
                                >
                                    ❌ Request Rejected
                                </NeonText>
                                <div className='bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4'>
                                    <div className='mb-2'>
                                        <span className='text-sm font-semibold text-red-300'>
                                            Reason:
                                        </span>
                                    </div>
                                    <p className='text-sm text-red-200 leading-relaxed'>
                                        {rejectionReason}
                                    </p>
                                </div>

                                <div className='p-3 bg-red-900/30 rounded-lg border border-red-500/20'>
                                    <div className='flex items-start gap-2 text-xs text-red-300'>
                                        <NeonIcon
                                            icon='lucide:info'
                                            size={14}
                                            glowColor='--color-red-500'
                                            className='mt-0.5 flex-shrink-0'
                                        />
                                        <div>
                                            <span className='font-semibold'>
                                                What's next?
                                            </span>{' '}
                                            Please review the reason above and
                                            make any necessary changes before
                                            submitting a new request. If you
                                            need assistance, contact our support
                                            team.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NeonBox>
                )}
                {/* Balance warning with Amount Input */}
                {!hasEnoughBalance && !hasPendingRequest && !balanceLoading && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-5 rounded-lg mb-6'
                    >
                        <div className='flex items-start gap-4'>
                            <NeonIcon
                                icon='lucide:alert-triangle'
                                size={24}
                                glowColor='--color-red-500'
                            />
                            <div className='flex-1'>
                                <NeonText
                                    glowColor='--color-red-500'
                                    className='text-lg font-bold text-red-400 mb-3'
                                >
                                    💰 Insufficient Balance
                                </NeonText>
                                <div className='bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm text-red-300'>
                                            Current Balance:
                                        </span>
                                        <span className='text-sm font-bold text-red-200'>
                                            {userBalance.toLocaleString()} GC
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm text-red-300'>
                                            Required:
                                        </span>
                                        <span className='text-sm font-bold text-red-200'>
                                            {MIN_BALANCE_REQUIRED.toLocaleString()}{' '}
                                            GC
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-red-300'>
                                            You need:
                                        </span>
                                        <span className='text-sm font-bold text-yellow-400'>
                                            {(
                                                MIN_BALANCE_REQUIRED -
                                                userBalance
                                            ).toLocaleString()}{' '}
                                            GC
                                        </span>
                                    </div>
                                </div>

                                {/* NEW: Amount Input Section for Insufficient Balance */}
                                <div className='space-y-4 mb-4'>
                                    <div className='space-y-2'>
                                        <label className='text-sm font-semibold text-red-300 flex items-center gap-2'>
                                            {/* <NeonIcon
                                                icon='lucide:dollar-sign'
                                                size={14}
                                                glowColor='--color-red-500'
                                            /> */}
                                            Purchase Amount
                                        </label>
                                        {/* <Input
                                            type='number'
                                            // placeholder={`Enter amount (min $${MIN_ADD_LOOT})`}
                                            placeholder={`Enter amount`}
                                            value={rechargeAmount}
                                            onChange={e => {
                                                setRechargeAmount(
                                                    e.target.value
                                                );
                                                setShowAmountError(null);
                                            }}
                                            disabled={isLoading}
                                            min={0}
                                            step='1'
                                            className='w-full bg-red-900/20 border-red-500/30 focus:border-red-500/50 text-white'
                                        /> */}

                                        <div className='relative w-full'>
                                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-white text-base font-medium pointer-events-none z-10'>
                                                $
                                            </span>
                                            <Input
                                                type='number'
                                                placeholder='Enter amount'
                                                value={rechargeAmount}
                                                onChange={e => {
                                                    setRechargeAmount(
                                                        e.target.value
                                                    );
                                                    setShowAmountError(null);
                                                }}
                                                disabled={isLoading}
                                                min={0}
                                                step='1'
                                                className='w-full bg-red-900/20 border-red-500/30 focus:border-red-500/50 text-white pl-8'
                                            />
                                        </div>

                                        {rechargeAmount &&
                                            !isNaN(
                                                parseFloat(rechargeAmount)
                                            ) &&
                                            parseFloat(rechargeAmount) >=
                                                MIN_ADD_LOOT && (
                                                <div className='text-xs text-red-300 flex items-center gap-1'>
                                                    <NeonIcon
                                                        icon='lucide:info'
                                                        size={12}
                                                        glowColor='--color-red-500'
                                                    />
                                                    <span>
                                                        This equals{' '}
                                                        {(
                                                            parseFloat(
                                                                rechargeAmount
                                                            ) * CONVERSION_RATE
                                                        ).toLocaleString()}{' '}
                                                        GC that will be loaded
                                                        into your game
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    {/* Amount Error */}
                                    {showAmountError && (
                                        <div className='flex items-center gap-2 text-red-400 text-sm'>
                                            <NeonIcon
                                                icon='lucide:alert-circle'
                                                size={14}
                                                glowColor='--color-red-500'
                                            />
                                            <span>{showAmountError}</span>
                                        </div>
                                    )}

                                    {/* <div className='p-3 bg-red-900/30 rounded-lg border border-red-500/20'>
                                        <div className='flex items-start gap-2 text-xs text-red-300'>
                                            <NeonIcon
                                                icon='lucide:lightbulb'
                                                size={14}
                                                glowColor='--color-red-500'
                                                className='mt-0.5 flex-shrink-0'
                                            />
                                            <div>
                                                <span className='font-semibold'>
                                                    Note:
                                                </span>{' '}
                                                Enter the amount you want loaded
                                                into your game. After purchasing
                                                coins, this amount will be
                                                automatically loaded when your
                                                account is created.
                                            </div>
                                        </div>
                                    </div> */}
                                </div>

                                <div className='flex flex-col gap-3'>
                                    <Button
                                        onClick={handleBuyCoinsClick}
                                        className='bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-base px-6 py-3 rounded-lg shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                        <NeonIcon
                                            icon='lucide:coins'
                                            size={20}
                                            glowColor='--color-yellow-500'
                                        />
                                        💰 Buy Gold Coins Now
                                    </Button>
                                    <p className='text-xs text-red-300 text-center'>
                                        Click to open payment options and
                                        purchase coins
                                    </p>
                                </div>
                            </div>
                        </div>
                    </NeonBox>
                )}

                {/* Recharge Amount Section - Only show if not pending and has enough balance */}
                {!hasPendingRequest && !isLoading && hasEnoughBalance && (
                    <NeonBox
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                        className='p-5 rounded-lg mb-6'
                    >
                        <div className='space-y-4'>
                            <div className='flex items-start gap-4'>
                                <div className='flex-1'>
                                    {/* User Balance Display */}
                                    <div className='bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <Image
                                                    src='/coins/bronze-coin.svg'
                                                    height={20}
                                                    width={20}
                                                    alt='User Balance'
                                                />
                                                <span className='text-sm font-semibold text-purple-400'>
                                                    Your Wallet Balance
                                                </span>
                                            </div>
                                            {balanceLoading ? (
                                                <span className='text-base text-purple-300 animate-pulse'>
                                                    ---
                                                </span>
                                            ) : (
                                                <span className='text-base font-bold text-purple-300'>
                                                    {userBalance.toLocaleString()}{' '}
                                                    GC
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount Input */}
                                    <div className='space-y-2'>
                                        <label className='text-sm font-semibold text-purple-300 flex items-center justify-between gap-2'>
                                            <span className='flex items-center gap-2'>
                                                {/* <NeonIcon
                                                    icon='lucide:dollar-sign'
                                                    size={14}
                                                    glowColor='--color-purple-500'
                                                /> */}
                                                Amount to load into Game
                                            </span>
                                            {/* Buy Coins Badge */}
                                            <button
                                                onClick={() =>
                                                    router.push('/buy-coins')
                                                }
                                                type='button'
                                                className='inline-flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-extrabold shadow hover:bg-yellow-300 transition-colors'
                                            >
                                                <NeonIcon
                                                    icon='lucide:coins'
                                                    size={14}
                                                    glowColor='--color-yellow-500'
                                                />
                                                Buy More Coins
                                            </button>
                                        </label>
                                        <div className='relative w-full'>
                                            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none z-10 text-lg'>
                                                $
                                            </div>
                                            <Input
                                                type='number'
                                                placeholder={`Enter up to available balance (min $${MIN_ADD_LOOT})`}
                                                value={rechargeAmount}
                                                onChange={e => {
                                                    setRechargeAmount(
                                                        e.target.value
                                                    );
                                                    setShowAmountError(null);
                                                }}
                                                disabled={isLoading}
                                                min={MIN_ADD_LOOT}
                                                step='1'
                                                className='w-full bg-purple-900/20 border-purple-500/30 focus:border-purple-500/50 pl-8'
                                            />
                                        </div>
                                        {rechargeAmount &&
                                            !isNaN(
                                                parseFloat(rechargeAmount)
                                            ) &&
                                            parseFloat(rechargeAmount) >=
                                                MIN_ADD_LOOT && (
                                                <div className='text-xs text-purple-300 flex items-center gap-1'>
                                                    <NeonIcon
                                                        icon='lucide:info'
                                                        size={12}
                                                        glowColor='--color-purple-500'
                                                    />
                                                    <span>
                                                        This will deduct{' '}
                                                        {(
                                                            parseFloat(
                                                                rechargeAmount
                                                            ) * CONVERSION_RATE
                                                        ).toLocaleString()}{' '}
                                                        GC from your wallet
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    {/* Amount Error */}
                                    {showAmountError && (
                                        <div className='flex items-center gap-2 text-red-400 text-sm mt-2'>
                                            <NeonIcon
                                                icon='lucide:alert-circle'
                                                size={14}
                                                glowColor='--color-red-500'
                                            />
                                            <span>{showAmountError}</span>
                                        </div>
                                    )}

                                    <div className='mt-3 p-3 bg-purple-900/30 rounded-lg'>
                                        <div className='flex items-start gap-2 text-xs text-purple-300'>
                                            <NeonIcon
                                                icon='lucide:lightbulb'
                                                size={14}
                                                glowColor='--color-purple-500'
                                                className='mt-0.5 flex-shrink-0'
                                            />
                                            <div>
                                                <span className='font-semibold'>
                                                    Pro Tip:
                                                </span>{' '}
                                                Adding your amount to load into
                                                the game now saves time! Our
                                                team will handle both your
                                                account creation and Gold Coin
                                                load together. You can also skip
                                                this step and add it later.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NeonBox>
                )}

                {/* Only show action buttons if not pending request */}
                {/* Only show action buttons if not pending request */}
                {!hasPendingRequest && !isLoading && (
                    <div className='mb-6'>
                        <Button
                            onClick={handleRequestAccount}
                            className='w-full mb-4'
                            disabled={isLoading || !hasEnoughBalance}
                        >
                            {hasEnoughBalance
                                ? rechargeAmount &&
                                  parseFloat(rechargeAmount) >= MIN_ADD_LOOT
                                    ? `Confirm & Load Game ($${parseFloat(rechargeAmount).toFixed(2)})`
                                    : isRejected
                                      ? 'Submit New Request'
                                      : 'Request New Account'
                                : 'Insufficient Balance'}
                        </Button>

                        <Button
                            variant='secondary'
                            onClick={onBack}
                            className='w-full'
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                    </div>
                )}

                {/* Show process info for both states */}
                <NeonBox
                    glowColor='var(--color-blue-500)'
                    backgroundColor='var(--color-blue-500)'
                    backgroundOpacity={0.2}
                    glowSpread={0.5}
                    className='w-full flex flex-col gap-4 p-5 rounded-lg'
                >
                    {processInfo.map((item, index) => (
                        <div key={index} className='flex items-center gap-4'>
                            {item.icon && (
                                <NeonIcon
                                    icon={item.icon}
                                    glowColor={item.color}
                                    size={24}
                                />
                            )}
                            <NeonText
                                as='p'
                                glowColor={item.color}
                                glowSpread={0.5}
                                className='text-base font-bold capitalize'
                            >
                                {item.description}
                            </NeonText>
                        </div>
                    ))}
                </NeonBox>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                selectedPackage={selectedPackage}
            />
        </>
    );
}
