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
const MIN_BALANCE_REQUIRED = 500; // Minimum GC required for account creation
const MIN_ADD_LOOT = 5; // Minimum recharge amount in dollars
const CONVERSION_RATE = 100; // 1 USD = 100 GC

export default function CreateAccountStep({
    game,
    onBack,
    onSuccess,
    onRequestAccount,
    isLoading = false,
    error = null,
    hasPendingRequest = false,
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
        // For users with sufficient balance, just open the payment modal
        // Let them choose from standard packages
        setSelectedPackage(null);
        setIsPaymentModalOpen(true);
    };

    const handleRequestAccount = async () => {
        // Clear previous errors
        setShowAmountError(null);

        if (!hasEnoughBalance) {
            // Redirect to buy coins page
            router.push('/buy-coins');
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

                {/* Balance warning - WITHOUT Amount Input */}
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

                                <div className='flex flex-col gap-3'>
                                    <Button
                                        onClick={() =>
                                            router.push('/buy-coins')
                                        }
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
                                        Click to purchase coins and return to
                                        complete your account
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

                                    {/* Amount Input with Buy Coins Badge */}
                                    <div className='space-y-2'>
                                        <label className='text-sm font-semibold text-purple-300 flex items-center justify-between gap-2'>
                                            <span className='flex items-center gap-2'>
                                                <NeonIcon
                                                    icon='lucide:dollar-sign'
                                                    size={14}
                                                    glowColor='--color-purple-500'
                                                />
                                                Amount to load into Game
                                            </span>
                                            {/* Buy Coins Badge */}
                                            <button
                                                onClick={() =>
                                                    router.push('/buy-coins')
                                                }
                                                className='inline-flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-extrabold shadow hover:bg-yellow-300 transition-colors'
                                            >
                                                <NeonIcon
                                                    icon='lucide:coins'
                                                    size={14}
                                                    glowColor='--color-yellow-500'
                                                />
                                                Buy Coins
                                            </button>
                                        </label>
                                        <Input
                                            type='number'
                                            placeholder={`Enter amount (min $${MIN_ADD_LOOT}) - Optional`}
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
                                            className='w-full bg-purple-900/20 border-purple-500/30 focus:border-purple-500/50'
                                        />
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
