import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DialogTitle } from '../ui/dialog';
import GameModalTitle from './game-modal-title';
import type { GamePlayModalProps } from '../../types/game-account.types';
import { getBalance, rechargeGame, createWithdrawal } from '@/lib/api/wallet';
import type { BalanceResponse, GameRechargeRequest, WithdrawalRequest } from '@/types/wallet.types';
import Image from 'next/image';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useAuth } from '@/contexts/auth-context';
import { useKYCVerification } from '@/hooks/useKYCVerification';

// Validation constants
const MIN_ADD_LOOT = 5;
const MIN_REDEEM = 40;
const MAX_REDEEM = 500;

export default function GamePlayStep({ game, accountDetails }: GamePlayModalProps) {
    const router = useRouter();
    const { balance: userBalance, loading: userBalanceLoading,refresh } = useWalletBalance();
    const { user } = useAuth();
    const { redirectToKYC } = useKYCVerification();
    // State management
    const [balance, setBalance] = useState<number>(0);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [showAddLootForm, setShowAddLootForm] = useState(false);
    const [showRedeemForm, setShowRedeemForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [lootAmount, setLootAmount] = useState('');
    const [redeemAmount, setRedeemAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch wallet balance
    // useEffect(() => {
    //     fetchBalance();
    // }, []);

    const fetchBalance = async () => {
        setBalanceLoading(true);
        try {
           await refresh();
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        } finally {
            setBalanceLoading(false);
        }
    };

    const formatBalance = (amount: number) => {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleAddGameLoot = async () => {
        if (!accountDetails?.username) {
            setError('Game account username not found');
            return;
        }

        const amount = parseFloat(lootAmount);
        if (isNaN(amount) || amount < MIN_ADD_LOOT) {
            setError(`Minimum amount to add is $${MIN_ADD_LOOT}`);
            return;
        }

        // Check if user has enough balance
        if (userBalance < amount) {
            setError(`Insufficient balance. You need $${amount.toFixed(2)} (worth ${amount*100} GC) `);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: GameRechargeRequest = {
                gameName: game.name,
                amount: amount,
                username: accountDetails.username,
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
            setError(err instanceof Error ? err.message : 'Failed to add game GC');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemLoot = async () => {
        // Check KYC verification first
        if (!user?.isKYC) {
            // Redirect to KYC verification with current page as return URL
            const currentUrl = window.location.pathname + window.location.search;
            redirectToKYC({ 
                redirectUrl: currentUrl,
                showToast: true,
                toastMessage: 'KYC verification is required to redeem winnings. Redirecting to verification...'
            });
            return;
        }

        if (!accountDetails?.username) {
            setError('Game account username not found');
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
                username: accountDetails.username,
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
            setError(err instanceof Error ? err.message : 'Failed to redeem game GC');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayGame = () => {
        console.log(game);
        if (game.types.includes('web_only') || game.types.includes('download_only')) {
            return window.open(game.link, '_blank');
        }else{
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
                {/* Account Information */}
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
                    <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                            <span className='text-gray-400'>Username:</span>
                            <span className='font-semibold text-white'>
                                {accountDetails?.username || 'N/A'}
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-gray-400'>Password:</span>
                            <div className='flex items-center gap-2'>
                                <span className='font-semibold text-white'>
                                    {showPassword ? accountDetails?.password || '••••••' : '••••••'}
                                </span>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='text-blue-400 hover:text-blue-300'
                                >
                                    <NeonIcon
                                        icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
                                        size={14}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-gray-400'>Status:</span>
                            <span className='font-semibold text-green-400 flex items-center gap-1'>
                                <span className='w-2 h-2 bg-green-400 rounded-full'></span>
                                Active
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
                            <Image src='/coins/bronze-coin.svg' height={24} width={24} alt='User Balance' />
                            <span className='text-sm font-semibold text-blue-400'>Your Wallet Balance</span>
                        </div>
                        {userBalanceLoading ? (
                            <span className="text-lg text-blue-300 animate-pulse">---</span>
                        ) : (
                            <span className='text-lg font-bold text-blue-300'>
                                {userBalance.toLocaleString()} GC
                            </span>
                        )}
                    </div>
                    {!userBalanceLoading && userBalance < MIN_ADD_LOOT*100 && (
                        <div className='mt-2 p-2 bg-red-500/10 rounded border border-red-500/20'>
                            <div className='flex items-center gap-2 text-red-400 text-sm'>
                                <NeonIcon
                                    icon='lucide:alert-triangle'
                                    size={16}
                                    glowColor='--color-red-500'
                                />
                                <span>Low balance! You need at least {MIN_ADD_LOOT*100} GC (worth ${MIN_ADD_LOOT}) to add GC.</span>
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
                                    <NeonIcon icon='lucide:arrow-down-to-line' size={16} glowColor='--color-purple-500' />
                                    <NeonText className='text-sm font-semibold'>Add Game GC</NeonText>
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
                                Transfer Gold Coins from your wallet to this game for entertainment gameplay. Minimum: ${MIN_ADD_LOOT}
                            </p>
                            <Input
                                type='number'
                                placeholder={`Enter amount (min $${MIN_ADD_LOOT})`}
                                value={lootAmount}
                                onChange={(e) => setLootAmount(e.target.value)}
                                disabled={loading}
                                min={MIN_ADD_LOOT}
                                step='0.01'
                                className='w-full'
                            />
                            <Button
                                onClick={handleAddGameLoot}
                                disabled={loading || !lootAmount}
                                size='sm'
                                className='w-full'
                            >
                                {loading ? (
                                    <div className='flex items-center gap-2'>
                                        <NeonIcon icon='svg-spinners:bars-rotate-fade' size={16} />
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
                                    <NeonIcon icon='lucide:trophy' size={16} glowColor='--color-green-500' />
                                    <NeonText className='text-sm font-semibold'>Redeem Game GC</NeonText>
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
                                Request a review of your eligible Sweeps Coins for redemption. Min: ${MIN_REDEEM}, Max: ${MAX_REDEEM}
                            </p>
                            <Input
                                type='number'
                                placeholder={`Enter amount ($${MIN_REDEEM}-$${MAX_REDEEM})`}
                                value={redeemAmount}
                                onChange={(e) => setRedeemAmount(e.target.value)}
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
                                        <NeonIcon icon='svg-spinners:bars-rotate-fade' size={16} />
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
                            <NeonIcon icon='lucide:arrow-down-to-line' size={16} className='mr-1.5' />
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
                            <NeonIcon icon='lucide:trophy' size={16} className='mr-1.5' />
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
                            <NeonIcon icon='lucide:info' size={14} glowColor='--color-cyan-500' className='mt-0.5 flex-shrink-0' />
                            <div>
                                <span className='font-semibold text-cyan-400'>Add Game GC:</span> Transfer coins to play this game (min ${MIN_ADD_LOOT})
                            </div>
                        </div>
                        <div className='flex items-start gap-2'>
                            <NeonIcon icon='lucide:info' size={14} glowColor='--color-cyan-500' className='mt-0.5 flex-shrink-0' />
                            <div>
                                <span className='font-semibold text-cyan-400'>Redeem SC:</span> Request to redeem winnings (${MIN_REDEEM}-${MAX_REDEEM})
                            </div>
                        </div>
                    </div>
                </NeonBox>

                {/* Play Button */}
                <Button
                    onClick={handlePlayGame}
                    size='lg'
                    className='w-full'
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
