import PaymentModal from '@/app/(account)/buy-coins/components/payment-modal';
import type { CoinPackage } from '@/app/(account)/buy-coins/types';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useKYCVerification } from '@/hooks/useKYCVerification';
import { createWithdrawal, rechargeGame } from '@/lib/api/wallet';
import type {
    GameRechargeRequest,
    WithdrawalRequest,
} from '@/types/wallet.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { GamePlayModalProps } from '../../types/game-account.types';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GameModalTitle from './game-modal-title';

// Validation constants
const MIN_ADD_LOOT = 10;
const MIN_REDEEM = 50;
const MAX_REDEEM = 500;
const CONVERSION_RATE = 100; // 1 USD = 100 GC
const MIN_BALANCE_REQUIRED = 1000; // Minimum GC required to add game loot

interface GamePlayStepProps extends GamePlayModalProps {
    onTriggerSaveCredentials?: (username: string, password: string) => void;
}

export default function GamePlayStep({
    game,
    accountDetails,
    onTriggerSaveCredentials,
}: GamePlayStepProps) {
    const router = useRouter();
    const {
        balance: userBalance,
        loading: userBalanceLoading,
        refresh,
    } = useWalletBalance();
    const { user } = useAuth();
    const { redirectToKYC } = useKYCVerification();

    // Credential state - ALWAYS editable, pre-fill if saved credentials exist
    const [username, setUsername] = useState(accountDetails?.username || '');
    const [password, setPassword] = useState(accountDetails?.password || '');
    const [showPassword, setShowPassword] = useState(false);

    // Other state management
    const [showAddLootForm, setShowAddLootForm] = useState(false);
    const [showRedeemForm, setShowRedeemForm] = useState(false);
    const [lootAmount, setLootAmount] = useState('');
    const [redeemAmount, setRedeemAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
        null
    );
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [showAmountError, setShowAmountError] = useState<string | null>(null);

    // Check if user has enough balance
    const hasEnoughBalance = userBalance >= MIN_BALANCE_REQUIRED;

    const fetchBalance = async () => {
        try {
            await refresh();
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        }
    };

    const handleBuyCoinsClick = () => {
        const amount = parseFloat(purchaseAmount);

        // Validate amount
        if (!purchaseAmount || isNaN(amount) || amount < 1) {
            setShowAmountError(`Please enter a valid amount`);
            return;
        }

        // Clear any errors
        setShowAmountError(null);

        // Calculate coins
        const baseCoins = amount * CONVERSION_RATE;
        let bonusCoins = 0;

        // Bonus calculation: Every $10 gets bonus, capped at 500
        if (amount >= 5) {
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

    const handleAddGameLoot = async () => {
        if (!username) {
            setError('Please enter your game username first');
            return;
        }

        const amount = parseFloat(lootAmount);
        if (isNaN(amount) || amount < MIN_ADD_LOOT) {
            setError(`Minimum amount to add is $${MIN_ADD_LOOT}`);
            return;
        }

        if (userBalance < amount * 100) {
            setError(
                `Insufficient balance. You need $${amount.toFixed(2)} (worth ${amount * 100} GC) `
            );
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: GameRechargeRequest = {
                gameName: game.name,
                amount: amount,
                username: username, // Use the state username
            };

            const response = await rechargeGame(payload);

            if (response.success) {
                setSuccess('Game GC request submitted successfully!');
                setLootAmount('');
                setShowAddLootForm(false);
                await fetchBalance();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.message || 'Failed to add game GC');
            }
        } catch (err) {
            console.error('Add GC error:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to add game GC'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemLoot = async () => {
        if (!user?.isKYC) {
            const currentUrl =
                window.location.pathname + window.location.search;
            redirectToKYC({
                redirectUrl: currentUrl,
                showToast: true,
                toastMessage:
                    'KYC verification is required to redeem winnings. Redirecting to verification...',
            });
            return;
        }

        if (!username) {
            setError('Please enter your game username first');
            return;
        }

        const amount = parseFloat(redeemAmount);
        if (isNaN(amount) || amount < MIN_REDEEM) {
            setError(`Minimum redemption amount is $${MIN_REDEEM}`);
            return;
        }
        if (amount > MAX_REDEEM) {
            setError(`Maximum redemption amount is $${MAX_REDEEM}`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: WithdrawalRequest = {
                amount: amount,
                paymentGateway: 'soap',
                username: username, // Use the state username
                gameName: game.name,
            };

            const response = await createWithdrawal(payload);

            if (response.success) {
                setSuccess('Redeem request submitted successfully!');
                setRedeemAmount('');
                setShowRedeemForm(false);
                await fetchBalance();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.message || 'Failed to redeem game GC');
            }
        } catch (err) {
            console.error('Redeem error:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to redeem game GC'
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePlayGame = () => {
        if (!username || !password) {
            setError('Please enter your game username and password first');
            return;
        }

        if (
            game.types.includes('web_only') ||
            game.types.includes('download_only')
        ) {
            return window.open(game.link, '_blank');
        } else {
            router.push(`/play/${game._id}`);
        }
    };

    return (
        <div className='max-w-[600px] px-2 pb-2 mx-auto'>
            <GameModalTitle
                title={game.name}
                description='Manage your game account and add gold coins to play'
            />

            <div className='space-y-4'>
                {/* Account Credentials - ALWAYS EDITABLE */}
                <NeonBox
                    glowColor='--color-blue-500'
                    backgroundColor='--color-blue-500'
                    backgroundOpacity={0.1}
                    className='p-4 rounded-lg'
                >
                    <div className='flex items-center gap-2 mb-3'>
                        <NeonIcon
                            icon='lucide:user-circle'
                            size={20}
                            glowColor='--color-blue-500'
                        />
                        <NeonText className='text-sm font-semibold'>
                            Game Account
                        </NeonText>
                    </div>

                    <div className='space-y-3'>
                        {/* Username Input - Styled */}
                        <div>
                            <div className='flex items-center justify-between mb-1.5'>
                                <label className='text-xs font-medium text-gray-400'>
                                    Username:
                                </label>
                            </div>
                            <input
                                type='text'
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder='Enter username'
                                className='w-full bg-transparent border border-blue-500/30 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all'
                                style={{
                                    boxShadow: username
                                        ? '0 0 10px rgba(59, 130, 246, 0.2)'
                                        : 'none',
                                    textTransform: 'none',
                                }}
                            />
                        </div>

                        {/* Password Input - Styled */}
                        <div>
                            <div className='flex items-center justify-between mb-1.5'>
                                <label className='text-xs font-medium text-gray-400'>
                                    Password:
                                </label>
                            </div>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder='Enter password'
                                    className='w-full bg-transparent border border-blue-500/30 rounded-md px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all'
                                    style={{
                                        boxShadow: password
                                            ? '0 0 10px rgba(59, 130, 246, 0.2)'
                                            : 'none',
                                        textTransform: 'none',
                                    }}
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors'
                                >
                                    <NeonIcon
                                        icon={
                                            showPassword
                                                ? 'lucide:eye-off'
                                                : 'lucide:eye'
                                        }
                                        size={16}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Save Credentials Link - ALWAYS VISIBLE */}
                        {onTriggerSaveCredentials && (
                            <div className='pt-2 border-t border-gray-700/50'>
                                <button
                                    onClick={() => {
                                        if (username && password) {
                                            onTriggerSaveCredentials(
                                                username,
                                                password
                                            );
                                        } else {
                                            setError(
                                                'Please enter both username and password to save'
                                            );
                                        }
                                    }}
                                    disabled={!username || !password}
                                    className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                                        username && password
                                            ? 'text-cyan-400 hover:text-cyan-300'
                                            : 'text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <NeonIcon
                                        icon='lucide:save'
                                        size={14}
                                        glowColor={
                                            username && password
                                                ? '--color-cyan-500'
                                                : undefined
                                        }
                                    />
                                    Save credentials{' '}
                                    <span className='text-xs opacity-70'>
                                        (optional)
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className='flex items-center justify-between text-xs pt-1'>
                            <span className='text-gray-400'>Status:</span>
                            <span className='font-semibold text-green-400 flex items-center gap-1'>
                                <span className='w-2 h-2 bg-green-400 rounded-full'></span>
                                {accountDetails?.isCredentialsStored
                                    ? 'Saved'
                                    : 'Active (This Session)'}
                            </span>
                        </div>
                    </div>
                </NeonBox>

                {/* User Wallet Balance */}
                <NeonBox
                    glowColor='--color-blue-500'
                    backgroundColor='--color-blue-500'
                    backgroundOpacity={0.1}
                    className='p-4 rounded-lg'
                >
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Image
                                src='/coins/bronze-coin.svg'
                                height={24}
                                width={24}
                                alt='User Balance'
                            />
                            <span className='text-sm font-semibold text-blue-400'>
                                Your Wallet Balance
                            </span>
                        </div>
                        {userBalanceLoading ? (
                            <span className='text-lg text-blue-300 animate-pulse'>
                                ---
                            </span>
                        ) : (
                            <span className='text-lg font-bold text-blue-300'>
                                {userBalance.toLocaleString()} GC
                            </span>
                        )}
                    </div>
                </NeonBox>

                {/* Insufficient Balance Warning - Show if balance is below MIN_BALANCE_REQUIRED */}
                {!hasEnoughBalance && !userBalanceLoading && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-5 rounded-lg'
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
                                        <div className='relative w-full'>
                                            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none z-10 text-lg'>
                                                $
                                            </div>
                                            <Input
                                                type='number'
                                                placeholder={`Enter amount`}
                                                value={purchaseAmount}
                                                onChange={e => {
                                                    setPurchaseAmount(
                                                        e.target.value
                                                    );
                                                    setShowAmountError(null);
                                                }}
                                                disabled={loading}
                                                min={1}
                                                step='1'
                                                className='w-full bg-red-900/20 border-red-500/30 focus:border-red-500/50 text-white pl-8'
                                            />
                                        </div>
                                        {purchaseAmount &&
                                            !isNaN(
                                                parseFloat(purchaseAmount)
                                            ) &&
                                            parseFloat(purchaseAmount) >=
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
                                                                purchaseAmount
                                                            ) * CONVERSION_RATE
                                                        ).toLocaleString()}{' '}
                                                        GC that will be added to
                                                        your wallet
                                                    </span>
                                                </div>
                                            )}
                                    </div>

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
                                        Purchase coins to continue playing and
                                        adding game loot
                                    </p>
                                </div>
                            </div>
                        </div>
                    </NeonBox>
                )}
                {/* Success Message */}
                {success && (
                    <NeonBox
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                        className='p-3 rounded-lg'
                    >
                        <div className='flex items-center gap-2 text-green-400'>
                            <NeonIcon
                                icon='lucide:check-circle'
                                size={16}
                                glowColor='--color-green-500'
                            />
                            <span className='text-sm'>{success}</span>
                        </div>
                    </NeonBox>
                )}

                {/* Error Message */}
                {error && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-3 rounded-lg'
                    >
                        <div className='flex items-center gap-2 text-red-400'>
                            <NeonIcon
                                icon='lucide:alert-circle'
                                size={16}
                                glowColor='--color-red-500'
                            />
                            <span className='text-sm'>{error}</span>
                        </div>

                        {!userBalanceLoading &&
                            userBalance < MIN_ADD_LOOT * 100 && (
                                <div className='mt-2 p-2 bg-red-500/10 rounded border border-red-500/20'>
                                    <div className='flex items-center gap-2 text-red-400 text-sm'>
                                        <NeonIcon
                                            icon='lucide:alert-triangle'
                                            size={16}
                                            glowColor='--color-red-500'
                                        />
                                        <span>
                                            Low balance! You need at least{' '}
                                            {MIN_ADD_LOOT * 100} GC (worth $
                                            {MIN_ADD_LOOT}) to add GC.
                                        </span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            router.push('/buy-coins')
                                        }
                                        className='mt-2 text-blue-400 hover:text-blue-300 underline text-sm font-semibold'
                                    >
                                        Buy Gold Coins →
                                    </button>
                                </div>
                            )}
                    </NeonBox>
                )}

                {/* Add Game Loot Form */}
                {showAddLootForm && (
                    <NeonBox
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                        className='p-4 rounded-lg'
                    >
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <NeonIcon
                                        icon='lucide:arrow-down-to-line'
                                        size={16}
                                        glowColor='--color-purple-500'
                                    />
                                    <NeonText className='text-sm font-semibold'>
                                        Add Game GC
                                    </NeonText>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddLootForm(false);
                                        setLootAmount('');
                                        setError(null);
                                    }}
                                    className='text-gray-400 hover:text-white'
                                >
                                    <NeonIcon icon='lucide:x' size={16} />
                                </button>
                            </div>
                            <p className='text-xs text-gray-400'>
                                Transfer Gold Coins from your wallet to this
                                game for entertainment gameplay. Minimum: $
                                {MIN_ADD_LOOT}
                            </p>
                            <div className='relative w-full'>
                                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg font-bold z-50'>
                                    $
                                </div>
                                <Input
                                    type='number'
                                    placeholder='0.00'
                                    value={lootAmount}
                                    onChange={e =>
                                        setLootAmount(e.target.value)
                                    }
                                    disabled={loading}
                                    min={MIN_ADD_LOOT}
                                    step='0.01'
                                    className='w-full pl-8'
                                    style={{ paddingLeft: '2rem' }}
                                />
                            </div>
                            {lootAmount &&
                                !isNaN(parseFloat(lootAmount)) &&
                                parseFloat(lootAmount) > 0 && (
                                    <div className='flex items-center justify-between p-2 bg-purple-500/10 rounded border border-purple-500/20'>
                                        <span className='text-xs text-gray-400'>
                                            Amount to deduct from wallet:
                                        </span>
                                        <span className='text-sm font-semibold text-purple-300'>
                                            {Math.round(
                                                parseFloat(lootAmount) * 100
                                            ).toLocaleString()}{' '}
                                            GC
                                        </span>
                                    </div>
                                )}
                            <Button
                                onClick={handleAddGameLoot}
                                disabled={loading || !lootAmount}
                                size='sm'
                                className='w-full'
                            >
                                {loading ? (
                                    <div className='flex items-center gap-2'>
                                        <NeonIcon
                                            icon='svg-spinners:bars-rotate-fade'
                                            size={16}
                                        />
                                        Processing...
                                    </div>
                                ) : (
                                    'Submit Request'
                                )}
                            </Button>
                        </div>
                    </NeonBox>
                )}

                {/* Redeem Loot Form */}
                {showRedeemForm && (
                    <NeonBox
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                        className='p-4 rounded-lg'
                    >
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <NeonIcon
                                        icon='lucide:trophy'
                                        size={16}
                                        glowColor='--color-green-500'
                                    />
                                    <NeonText className='text-sm font-semibold'>
                                        Redeem Game SC
                                    </NeonText>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowRedeemForm(false);
                                        setRedeemAmount('');
                                        setError(null);
                                    }}
                                    className='text-gray-400 hover:text-white'
                                >
                                    <NeonIcon icon='lucide:x' size={16} />
                                </button>
                            </div>
                            <p className='text-xs text-gray-400'>
                                Request a review of your eligible Sweeps Coins
                                for redemption. Min: ${MIN_REDEEM}, Max: $
                                {MAX_REDEEM}
                            </p>

                            {/* REDEMPTION FEE NOTICE - NEW */}
                            <NeonBox
                                glowColor='--color-yellow-500'
                                backgroundColor='--color-yellow-500'
                                backgroundOpacity={0.15}
                                className='p-3 rounded-lg border border-yellow-500/30'
                            >
                                <div className='flex items-start gap-2'>
                                    <NeonIcon
                                        icon='lucide:info'
                                        size={16}
                                        glowColor='--color-yellow-500'
                                        className='mt-0.5 flex-shrink-0'
                                    />
                                    <div className='space-y-1'>
                                        <p className='text-xs font-semibold text-yellow-400'>
                                            Redemption Fee Notice
                                        </p>
                                        <p className='text-xs text-yellow-200/90'>
                                            A $3.00 processing fee applies at
                                            the time of redemption.
                                        </p>
                                    </div>
                                </div>
                            </NeonBox>

                            <Input
                                type='number'
                                placeholder={`Enter amount ($${MIN_REDEEM}-$${MAX_REDEEM})`}
                                value={redeemAmount}
                                onChange={e => setRedeemAmount(e.target.value)}
                                disabled={loading}
                                min={MIN_REDEEM}
                                max={MAX_REDEEM}
                                step='0.01'
                                className='w-full'
                            />

                            {/* Show calculation when amount is entered */}
                            {redeemAmount &&
                                !isNaN(parseFloat(redeemAmount)) &&
                                parseFloat(redeemAmount) >= MIN_REDEEM &&
                                parseFloat(redeemAmount) <= MAX_REDEEM && (
                                    <div className='p-3 bg-green-500/10 rounded-lg border border-green-500/20'>
                                        <div className='space-y-1.5 text-xs'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-gray-400'>
                                                    Redemption Amount:
                                                </span>
                                                <span className='font-semibold text-green-300'>
                                                    $
                                                    {parseFloat(
                                                        redeemAmount
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-gray-400'>
                                                    Processing Fee:
                                                </span>
                                                <span className='font-semibold text-yellow-400'>
                                                    -$3.00
                                                </span>
                                            </div>
                                            <div className='h-px bg-green-500/30 my-1'></div>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-gray-300 font-semibold'>
                                                    You'll Receive:
                                                </span>
                                                <span className='font-bold text-green-400 text-sm'>
                                                    $
                                                    {(
                                                        parseFloat(
                                                            redeemAmount
                                                        ) - 3
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <Button
                                onClick={handleRedeemLoot}
                                disabled={loading || !redeemAmount}
                                size='sm'
                                variant='secondary'
                                className='w-full'
                            >
                                {loading ? (
                                    <div className='flex items-center gap-2'>
                                        <NeonIcon
                                            icon='svg-spinners:bars-rotate-fade'
                                            size={16}
                                        />
                                        Processing...
                                    </div>
                                ) : (
                                    'Submit Request'
                                )}
                            </Button>
                        </div>
                    </NeonBox>
                )}

                {/* Action Buttons */}
                {!showAddLootForm && !showRedeemForm && (
                    <div className='grid grid-cols-2 gap-3'>
                        <Button
                            onClick={() => {
                                setShowAddLootForm(true);
                                setError(null);
                                setSuccess(null);
                            }}
                            size='sm'
                            className='w-full'
                        >
                            <NeonIcon
                                icon='lucide:arrow-down-to-line'
                                size={16}
                                className='mr-1.5'
                            />
                            Add Game GC
                        </Button>
                        <Button
                            onClick={() => {
                                setShowRedeemForm(true);
                                setError(null);
                                setSuccess(null);
                            }}
                            size='sm'
                            variant='secondary'
                            className='w-full'
                        >
                            <NeonIcon
                                icon='lucide:trophy'
                                size={16}
                                className='mr-1.5'
                            />
                            Redeem SC
                        </Button>
                    </div>
                )}

                {/* Game Information */}
                <NeonBox
                    glowColor='--color-cyan-500'
                    backgroundColor='--color-cyan-500'
                    backgroundOpacity={0.05}
                    className='p-3 rounded-lg'
                >
                    <div className='space-y-2 text-xs text-gray-400'>
                        <div className='flex items-start gap-2'>
                            <NeonIcon
                                icon='lucide:info'
                                size={14}
                                glowColor='--color-cyan-500'
                                className='mt-0.5 flex-shrink-0'
                            />
                            <div>
                                <span className='font-semibold text-cyan-400'>
                                    Add Game GC:
                                </span>{' '}
                                Transfer coins to play this game (min $
                                {MIN_ADD_LOOT})
                            </div>
                        </div>
                        <div className='flex items-start gap-2'>
                            <NeonIcon
                                icon='lucide:info'
                                size={14}
                                glowColor='--color-cyan-500'
                                className='mt-0.5 flex-shrink-0'
                            />
                            <div>
                                <span className='font-semibold text-cyan-400'>
                                    Redeem SC:
                                </span>{' '}
                                Request to redeem winnings (${MIN_REDEEM}-$
                                {MAX_REDEEM})
                            </div>
                        </div>
                    </div>
                </NeonBox>

                {/* Play Button */}
                <Button
                    onClick={handlePlayGame}
                    size='lg'
                    className='w-full'
                    disabled={!username || !password}
                >
                    <NeonIcon icon='lucide:play' size={20} className='mr-2' />
                    Tap to Play
                </Button>

                {/* Purchase Link */}
                <div className='text-center'>
                    <button
                        onClick={() => router.push('/buy-coins')}
                        className='text-xs text-yellow-400 hover:text-yellow-300 underline'
                    >
                        Need more coins? Click here to purchase
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                selectedPackage={selectedPackage}
            />
        </div>
    );
}
