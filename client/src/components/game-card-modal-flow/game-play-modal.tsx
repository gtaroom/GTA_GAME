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
const MIN_ADD_LOOT = 5;
const MIN_REDEEM = 40;
const MAX_REDEEM = 500;

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

    const fetchBalance = async () => {
        try {
            await refresh();
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        }
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
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='Enter username'
                                className='w-full bg-transparent border border-blue-500/30 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all'
                                style={{
                                    boxShadow: username ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none',
                                    textTransform: 'none'
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
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Enter password'
                                    className='w-full bg-transparent border border-blue-500/30 rounded-md px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all'
                                    style={{
                                        boxShadow: password ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none',
                                        textTransform: 'none'
                                    }}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors'
                                >
                                    <NeonIcon
                                        icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
                                        size={16}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Save Credentials Link */}
                        {username && password && onTriggerSaveCredentials && (
                            <div className='pt-2 border-t border-gray-700/50'>
                                <button
                                    onClick={() => {
                                        onTriggerSaveCredentials(username, password);
                                    }}
                                    className='text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1.5 transition-colors'
                                >
                                    <NeonIcon
                                        icon='lucide:save'
                                        size={14}
                                        glowColor='--color-cyan-500'
                                    />
                                    Save credentials{' '}
                                    <span className='text-xs opacity-70'>(optional)</span>
                                </button>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className='flex items-center justify-between text-xs pt-1'>
                            <span className='text-gray-400'>Status:</span>
                            <span className='font-semibold text-green-400 flex items-center gap-1'>
                                <span className='w-2 h-2 bg-green-400 rounded-full'></span>
                                {accountDetails?.isCredentialsStored ? 'Saved' : 'Active (This Session)'}
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
                                        onClick={() => router.push('/buy-coins')}
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
                            <Input
                                type='number'
                                placeholder={`Enter amount (min $${MIN_ADD_LOOT})`}
                                value={lootAmount}
                                onChange={e => setLootAmount(e.target.value)}
                                disabled={loading}
                                min={MIN_ADD_LOOT}
                                step='0.01'
                                className='w-full'
                            />
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
                                        Redeem Game GC
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
        </div>
    );
}