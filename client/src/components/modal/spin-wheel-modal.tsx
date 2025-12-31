'use client';

import { useBreakPoint } from '@/hooks/useBreakpoint';
import { SpinWheelOption, GradientColor } from '@/types/spin-wheel';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import SpinWheel from '../spin-wheel';
import { Button } from '../ui/button';
import { DialogContent, DialogTitle, DialogClose } from '../ui/dialog';
import {
    claimSpinReward,
    getSpinWheelConfig,
    performSpinWheelSpin,
    checkSpinWheelEligibility,
    type SpinWheelSpinResponse,
} from '@/lib/api/vip';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import SpinWheelRewardContent from './spin-wheel-reward-content';
import { toastSuccess, toastError } from '@/lib/toast';

interface SpinWheelModalProps {
    initialSpinsAvailable?: number;
    onSpinsUpdate?: (spinsRemaining: number) => void;
    onClose?: () => void;
}

type ModalView = 'loading' | 'error' | 'wheel' | 'reward';

function SpinWheelModal({ initialSpinsAvailable = 0, onSpinsUpdate, onClose }: SpinWheelModalProps) {
    const { xxs, xs } = useBreakPoint();
    const [currentView, setCurrentView] = useState<ModalView>('loading');
    const [wonReward, setWonReward] = useState<SpinWheelSpinResponse['data'] | null>(null);
    const [pendingReward, setPendingReward] = useState<SpinWheelSpinResponse['data'] | null>(null);
    const [configRewards, setConfigRewards] = useState<
        Array<{ id: number; amount: number; type: 'GC' | 'SC'; rarity?: string; description?: string }>
    >([]);
    const [spinsAvailable, setSpinsAvailable] = useState<number>(initialSpinsAvailable);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAutoClaimed, setHasAutoClaimed] = useState(false);
    const hasAutoClaimedRef = useRef<boolean>(false); // Ref to avoid closure issues
    const { updateUserSCBalance } = useAuth();
    const { refresh: refreshWalletBalance } = useWalletBalance();
    const spinCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Use ref to store pending reward to avoid closure issues
    const pendingRewardRef = useRef<SpinWheelSpinResponse['data'] | null>(null);
    // CRITICAL: Store the reward to claim in a ref to avoid ALL closure issues
    const rewardToClaimRef = useRef<SpinWheelSpinResponse['data'] | null>(null);
    // Store target index to verify wheel lands correctly
    const targetIndexRef = useRef<number | null>(null);
    // Track if we're in the middle of a spin (to prevent modal from closing)
    const isSpinningRef = useRef<boolean>(false);

    // Initialize spinsAvailable from prop when it changes
    useEffect(() => {
        if (initialSpinsAvailable > 0) {
            // console.log(`🎰 Setting initial spins available from prop: ${initialSpinsAvailable}`);
            setSpinsAvailable(initialSpinsAvailable);
        }
    }, [initialSpinsAvailable]);

    // Check eligibility and load config on mount - FAST!
    const hasInitializedRef = useRef(false);
    useEffect(() => {
        // Only initialize once
        if (hasInitializedRef.current) {
            return;
        }
        
        const initializeSpinWheel = async () => {
            hasInitializedRef.current = true;
            setCurrentView('loading');
            setError(null);

            // console.log('🎰 Initializing spin wheel modal...');
            // console.log(`🎰 Initial spins available: ${initialSpinsAvailable}`);
            const startTime = Date.now();

            try {
                const configResponse = await getSpinWheelConfig().catch((err) => {
                    // console.error('🎰 Config fetch error:', err);
                    return null;
                });
                
                
                const duration = Date.now() - startTime;
                // console.log(`🎰 Initialization completed in ${duration}ms`);

                if (configResponse?.success && configResponse.data?.rewards) {
                    setConfigRewards(configResponse.data.rewards);
                    if (initialSpinsAvailable > 0) {
                        setSpinsAvailable(initialSpinsAvailable);
                    }
                    setCurrentView('wheel');
                    // console.log(`🎰 ✅ Config loaded, showing wheel with ${initialSpinsAvailable} spins available`);
                    // console.log(`🎰 ✅ Config rewards count:`, configResponse.data.rewards.length);
                } else if (configResponse?.success && !configResponse.data?.isActive) {
                    setError('Spin wheel is currently disabled');
                    setCurrentView('error');
                    return;
                } else {
                    if (initialSpinsAvailable > 0) {
                        setSpinsAvailable(initialSpinsAvailable);
                    }
                    setCurrentView('wheel');
                    // console.log('🎰 ⚠️ Config fetch failed, showing wheel anyway');
                }
            } catch (err) {
                // console.error('Failed to initialize spin wheel:', err);
                setError('Failed to load spin wheel. Please try again.');
                setCurrentView('error');
            }
        };

        initializeSpinWheel();

        return () => {
            if (spinCompleteTimeoutRef.current) {
                clearTimeout(spinCompleteTimeoutRef.current);
            }
        };
    }, []);

    // Purple theme colors for spin wheel - alternating shades
    const purpleColors = [
        '#9333EA', // Purple 600
        '#4F46E5', // Indigo 600
        '#7E22CE', // Purple 700
        '#5B21B6', // Violet 800
      
    ];

    const options: SpinWheelOption[] = useMemo(() => {
        // console.log('🎰 Creating options from configRewards:', configRewards);
        if (!configRewards.length) {
            // console.warn('🎰 ⚠️ No config rewards available!');
            return [];
        }
        const opts = configRewards.map((r, idx) => ({
            id: String(r.id ?? idx + 1),
            label: (
                <>
                    <img
                        src={r.type === 'GC' ? '/coins/bronze-coin.svg' : '/coins/sweep-coin.svg'}
                        className='xs:w-6 xs:h-6 h-5 w-5 mb-1'
                        alt={r.type === 'GC' ? 'Gold Coin' : 'Sweep Coin'}
                    />
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(r.amount)}
                </>
            ),
            value: { id: r.id, amount: r.amount, type: r.type, rarity: r.rarity },
            // Use alternating purple colors for elegant look
            color: purpleColors[idx % purpleColors.length],
        }));
        // console.log('🎰 ✅ Created options:', opts.length, 'options');
        // console.log('🎰 Options array (index -> rewardId):', opts.map((o, i) => ({
        //     index: i,
        //     id: (o.value as any)?.id,
        //     amount: (o.value as any)?.amount,
        //     type: (o.value as any)?.type
        // })));
        return opts;
    }, [configRewards, purpleColors]);

    // Request winner index for spin wheel animation
    const requestWinnerIndex = useCallback(async (): Promise<number> => {
        // Don't check isSpinning here - animation already started
        if (spinsAvailable === 0 || options.length === 0) {
            // console.warn('🚫 Cannot spin:', { spinsAvailable, optionsLength: options.length });
            return 0;
        }

        setError(null);
        setPendingReward(null); // Clear any previous pending reward
        pendingRewardRef.current = null; // Clear ref too
        rewardToClaimRef.current = null; // Clear reward to claim ref
        targetIndexRef.current = null; // Clear target index
        isSpinningRef.current = true; // Mark that we're spinning
        // CRITICAL: Clear wonReward at the start of each spin to prevent stale data
        setWonReward(null);
        setHasAutoClaimed(false);
        hasAutoClaimedRef.current = false;
        // console.log('🎰 ✅ Cleared all reward state at start of spin');

        try {
            // console.log('🎰 ===== API CALL STARTED (animation already running) =====');
            const startTime = Date.now();
            const spinResponse = await performSpinWheelSpin();
            const apiDuration = Date.now() - startTime;
            // console.log(`🎰 Spin API response received in ${apiDuration}ms:`, spinResponse);

            if (spinResponse.success && spinResponse.data) {
                const reward = spinResponse.data;
                // console.log('🎰 ✅ Reward received from backend:', reward);
                
                // Find the index of the winning reward - MUST match backend result
                const winningIndex = options.findIndex(
                    (opt) => (opt.value as any)?.id === reward.rewardId
                );

                // console.log('🎰 ===== SPIN RESULT ANALYSIS =====');
                // console.log('🎰 Backend Reward ID:', reward.rewardId);
                // console.log('🎰 Backend Amount:', reward.amount);
                // console.log('🎰 Backend Type:', reward.type);
                // console.log('🎰 Backend SpinId:', reward.spinId);
                // console.log('🎰 Available options:', options.map((o, i) => ({ 
                //     index: i, 
                //     id: (o.value as any)?.id,
                //     amount: (o.value as any)?.amount,
                //     type: (o.value as any)?.type,
                //     label: (o.value as any)?.id === reward.rewardId ? '⭐ MATCH' : ''
                // })));
                // console.log('🎰 Winning index found:', winningIndex);
                
                if (winningIndex >= 0) {
                    const winningOption = options[winningIndex];
                    // console.log('🎰 ✅ VERIFICATION:');
                    // console.log('🎰   Expected reward:', { id: reward.rewardId, amount: reward.amount, type: reward.type });
                    // console.log('🎰   Option at index', winningIndex, ':', { 
                    //     id: (winningOption.value as any)?.id, 
                    //     amount: (winningOption.value as any)?.amount, 
                    //     type: (winningOption.value as any)?.type 
                    // });
                    // console.log('🎰   Match:', (winningOption.value as any)?.id === reward.rewardId ? '✅ YES' : '❌ NO');
                } else {
                    // console.error('🎰 ❌ CRITICAL: Winning index not found!');
                }

                if (winningIndex >= 0) {
                    // console.log('🎰 ✅ Storing reward with REAL spinId:', reward.spinId);
                    setPendingReward(reward);
                    pendingRewardRef.current = reward;
                    // Store target index to verify wheel lands correctly
                    targetIndexRef.current = winningIndex;
                    // console.log('🎰 ✅ Wheel will land on index:', winningIndex, 'which matches reward ID:', reward.rewardId);
                    // console.log('🎰 ⏸️ Spins available will be updated after spin completes');
                    return winningIndex;
                } else {
                    // console.error('🎰 ❌ CRITICAL: Reward ID', reward.rewardId, 'NOT FOUND in options!');
                    // console.error('🎰 Available reward IDs:', options.map(o => (o.value as any)?.id));
                    // Still store the reward with REAL spinId (even if index not found)
                    // The wheel will animate, but we'll use the real backend reward
                    // console.log('🎰 ⚠️ Storing reward with REAL spinId (index not found):', reward.spinId);
                    // Store in both state and ref to avoid closure issues
                    setPendingReward(reward);
                    pendingRewardRef.current = reward;
                    targetIndexRef.current = 0; // Fallback index
                    // console.log('🎰 ⚠️ Using fallback index 0, but will use REAL reward data');
                    return 0;
                }
            } else {
                const errorMessage =
                    spinResponse.error === 'NO_SPINS_AVAILABLE'
                        ? 'No spins available. Check back later!'
                        : spinResponse.error === 'SPIN_WHEEL_DISABLED'
                          ? 'Spin wheel is currently disabled'
                          : spinResponse.message || 'Failed to spin. Please try again.';
                setError(errorMessage);
                toastError(errorMessage);
                setIsSpinning(false);
                isSpinningRef.current = false;
                return 0;
            }
        } catch (err: any) {
            // console.error('🎰 ❌ Spin error:', err);
            const errorMessage =
                err?.data?.error === 'NO_SPINS_AVAILABLE'
                    ? 'No spins available. Check back later!'
                    : err?.data?.error === 'SPIN_WHEEL_DISABLED'
                      ? 'Spin wheel is currently disabled'
                      : err?.message || 'Failed to spin. Please try again.';
            setError(errorMessage);
            toastError(errorMessage);
            setIsSpinning(false);
            isSpinningRef.current = false;
            return 0;
        }
    }, [spinsAvailable, options]);

    const handleSpinComplete = useCallback((winner: SpinWheelOption) => {
        // console.log('🎯 ===== SPIN ANIMATION COMPLETE =====');
        // console.log('🎯 Winner from wheel:', winner);
        // console.log('🎯 Expected target index:', targetIndexRef.current);
        // console.log('🎯 Winner index from wheel:', options.findIndex(opt => opt.id === winner.id));
        
        const expectedIndex = targetIndexRef.current;
        const actualIndex = options.findIndex(opt => opt.id === winner.id);
        if (expectedIndex !== null && expectedIndex !== actualIndex) {
            // console.warn('🎯 ⚠️ Wheel landed on different segment than expected!');
            // console.warn(`🎯 Expected index: ${expectedIndex}, Actual index: ${actualIndex}`);
            // console.warn('🎯 This might be due to jitter in animation, but we\'ll use the backend reward anyway');
        }
        
        const currentPendingReward = pendingRewardRef.current;
        // console.log('🎯 Pending reward from ref:', currentPendingReward);
        // console.log('🎯 Pending reward from state:', pendingReward);

        // Clear any existing timeout
        if (spinCompleteTimeoutRef.current) {
            clearTimeout(spinCompleteTimeoutRef.current);
        }

        spinCompleteTimeoutRef.current = setTimeout(() => {
            const rewardToShow = pendingRewardRef.current || pendingReward;
            
            if (rewardToShow) {
                // console.log('🎯 ✅ Showing reward modal for:', rewardToShow);
                // console.log('🎯 ✅ Using REAL spinId from backend:', rewardToShow.spinId);
                // console.log('🎯 ✅ Reward matches backend: rewardId', rewardToShow.rewardId, 'amount', rewardToShow.amount);
                
                const rewardForClaim = { ...rewardToShow }; // Create a copy to avoid reference issues
                
                const newSpinsCount = Math.max(0, spinsAvailable - 1);
                setSpinsAvailable(newSpinsCount);
                onSpinsUpdate?.(newSpinsCount);
                // console.log('🎯 ✅ Updated spins available:', newSpinsCount);
                
                const rewardCopy = {
                    rewardId: rewardToShow.rewardId,
                    amount: rewardToShow.amount,
                    type: rewardToShow.type,
                    rarity: rewardToShow.rarity,
                    description: rewardToShow.description,
                    timestamp: rewardToShow.timestamp,
                    spinId: rewardToShow.spinId,
                };
                rewardToClaimRef.current = rewardCopy;
                // console.log('🎯 ✅ Stored reward in ref - rewardId:', rewardToClaimRef.current.rewardId);
                // console.log('🎯 ✅ Stored reward in ref - spinId:', rewardToClaimRef.current.spinId);
                // console.log('🎯 ✅ rewardToShow.rewardId:', rewardToShow.rewardId);
                // console.log('🎯 ✅ rewardCopy.rewardId:', rewardCopy.rewardId);
                
                setWonReward(rewardToShow);
                setPendingReward(null);
                pendingRewardRef.current = null; // Clear ref too
                targetIndexRef.current = null; // Clear target index
                isSpinningRef.current = false; // Reset spinning flag
                setHasAutoClaimed(false); // Reset auto-claim flag
                hasAutoClaimedRef.current = false; // Reset ref too
                setCurrentView('reward');
                
                const rewardToClaim = rewardCopy; // Use the copy directly
                setTimeout(async () => {
                    // console.log('🎯 🔄 ===== AUTO-CLAIM TIMEOUT FIRED =====');
                    // console.log('🎯 🔄 hasAutoClaimedRef.current:', hasAutoClaimedRef.current);
                    // console.log('🎯 🔄 rewardToClaim:', rewardToClaim);
                    // console.log('🎯 🔄 rewardToClaim.rewardId:', rewardToClaim.rewardId);
                    // console.log('🎯 🔄 rewardToClaim.spinId:', rewardToClaim.spinId);
                    // console.log('🎯 🔄 rewardToClaimRef.current:', rewardToClaimRef.current);
                    
                    if (!hasAutoClaimedRef.current && rewardToClaim) {
                        // console.log('🎯 🔄 ✅ Starting auto-claim for reward:', rewardToClaim);
                        // console.log('🎯 🔄 ✅ Reward details:', { 
                        //     rewardId: rewardToClaim.rewardId, 
                        //     amount: rewardToClaim.amount, 
                        //     type: rewardToClaim.type, 
                        //     spinId: rewardToClaim.spinId 
                        // });
                        setHasAutoClaimed(true);
                        hasAutoClaimedRef.current = true;
                        
                        // Call claim directly using rewardToClaim (the copy)
                        try {
                            // console.log('🎯 🔄 🔥 CALLING claimSpinReward with spinId:', rewardToClaim.spinId);
                            setIsClaiming(true);
                            const claimResponse = await claimSpinReward(rewardToClaim.spinId);
                            
                            // console.log('🎯 🔄 ✅ Claim response received:', claimResponse);
                            
                            if (claimResponse.success) {
                                // Update balances based on reward type
                                if (rewardToClaim.type === 'GC') {
                                    refreshWalletBalance();
                                } else if (rewardToClaim.type === 'SC') {
                                    updateUserSCBalance(claimResponse.data.newBalance);
                                }

                                toastSuccess(
                                    `Successfully claimed ${rewardToClaim.amount} ${rewardToClaim.type === 'GC' ? 'Gold Coins' : 'Sweep Coins'}!`
                                );

                                // Refresh eligibility to get updated spin count
                                try {
                                    const eligibilityResponse = await checkSpinWheelEligibility();
                                    if (eligibilityResponse?.success) {
                                        const newSpins = eligibilityResponse.data.spinsAvailable;
                                        setSpinsAvailable(newSpins);
                                        onSpinsUpdate?.(newSpins);
                                    }
                                } catch (err) {
                                    // console.error('Failed to refresh eligibility:', err);
                                }
                            } else {
                                throw new Error(claimResponse.message || 'Failed to claim reward');
                            }
                        } catch (err: any) {
                            // console.error('💰 ❌ Auto-claim error:', err);
                            const errorMessage =
                                err?.data?.error === 'ALREADY_CLAIMED'
                                    ? 'This reward has already been claimed'
                                    : err?.data?.error === 'SPIN_NOT_FOUND'
                                      ? 'Invalid spin ID or spin not found'
                                      : err?.message || 'Failed to claim reward. Please try again.';
                            toastError(errorMessage);
                        } finally {
                            setIsClaiming(false);
                        }
                    } else {
                        // console.log('🎯 ⚠️ Already auto-claimed or no reward, skipping');
                    }
                }, 1000); // 1 second delay to show the reward first, then auto-claim
            } else {
                // console.error('🎯 ❌ CRITICAL ERROR: No pending reward found after spin!');
                // console.error('🎯 This should never happen - the reward should be set from API response');
                // console.error('🎯 Winner from wheel:', winner);
                // console.error('🎯 Pending reward ref:', pendingRewardRef.current);
                // console.error('🎯 Pending reward state:', pendingReward);
                
                // Update spins anyway (spin was consumed)
                const newSpinsCount = Math.max(0, spinsAvailable - 1);
                setSpinsAvailable(newSpinsCount);
                onSpinsUpdate?.(newSpinsCount);
                isSpinningRef.current = false;
                
                // Show error instead of creating fake reward
                setError('Failed to retrieve reward. Please contact support.');
                toastError('Failed to retrieve reward. Please try again or contact support.');
                setCurrentView('wheel');
            }
            setIsSpinning(false);
        }, 800); // Wait 800ms after animation completes
    }, [pendingReward, spinsAvailable, options, onSpinsUpdate, hasAutoClaimed]);

    const handleClaimRewardWithReward = useCallback(async (reward: SpinWheelSpinResponse['data']) => {
        // console.log('💰💰💰 ===== NEW CODE VERSION 2.0 - handleClaimRewardWithReward CALLED =====');
        // console.log('💰 Parameter reward:', reward);
        // console.log('💰 Parameter rewardId:', reward?.rewardId);
        // console.log('💰 rewardToClaimRef.current:', rewardToClaimRef.current);
        // console.log('💰 rewardToClaimRef.current?.rewardId:', rewardToClaimRef.current?.rewardId);
        
        // This prevents any closure issues or stale state problems
        if (rewardToClaimRef.current) {
            // console.log('💰 ✅✅✅ USING REF (SOURCE OF TRUTH)');
            // console.log('💰 Ref rewardId:', rewardToClaimRef.current.rewardId);
            // console.log('💰 Ref amount:', rewardToClaimRef.current.amount);
            // console.log('💰 Ref spinId:', rewardToClaimRef.current.spinId);
            // console.log('💰 Parameter rewardId (ignored):', reward?.rewardId);
            reward = rewardToClaimRef.current; // Always use ref - ignore parameter
        } else if (reward) {
            // console.log('💰 ⚠️ No ref available, using parameter (fallback)');
        } else {
            // console.error('💰 ❌ No reward available in ref or parameter!');
            return;
        }
        
        if (!reward || isClaiming) {
            // console.warn('💰 ❌ Cannot claim reward:', { reward, isClaiming });
            return;
        }

        setIsClaiming(true);

        try {
            if (rewardToClaimRef.current && rewardToClaimRef.current.rewardId !== reward.rewardId) {
                // console.error('💰 ❌❌❌ CRITICAL: Reward mismatch detected!');
                // console.error('💰 Parameter rewardId:', reward.rewardId);
                // console.error('💰 Ref rewardId:', rewardToClaimRef.current.rewardId);
                // console.error('💰 Using ref instead of parameter!');
                reward = rewardToClaimRef.current;
            }
            
            // FINAL CHECK: One more time, use ref if it exists
            if (rewardToClaimRef.current) {
                // console.log('💰 ✅✅✅ FINAL CHECK: Using ref one more time');
                reward = rewardToClaimRef.current;
            }
            
            // console.log('💰 ===== NEW CODE VERSION 2.0 - Claiming reward =====');
            // console.log('💰 ✅✅✅ FINAL Reward being claimed:', reward);
            // console.log('💰 ✅✅✅ FINAL rewardId:', reward.rewardId);
            // console.log('💰 ✅✅✅ FINAL amount:', reward.amount);
            // console.log('💰 ✅✅✅ FINAL type:', reward.type);
            // console.log('💰 ✅✅✅ FINAL spinId:', reward.spinId);
            // console.log('💰 ✅✅✅ VERIFY: reward.rewardId should match backend response');
            
            const claimResponse = await claimSpinReward(reward.spinId);

            if (claimResponse.success) {
                // Update balances based on reward type
                if (reward.type === 'GC') {
                    refreshWalletBalance();
                } else if (reward.type === 'SC') {
                    updateUserSCBalance(claimResponse.data.newBalance);
                }

                toastSuccess(
                    `Successfully claimed ${reward.amount} ${reward.type === 'GC' ? 'Gold Coins' : 'Sweep Coins'}!`
                );

                // Reset and refresh
                setWonReward(null);
                setPendingReward(null);
                setIsSpinning(false);
                setHasAutoClaimed(false);

                // Refresh eligibility to get updated spin count
                try {
                    const eligibilityResponse = await checkSpinWheelEligibility();
                    if (eligibilityResponse?.success) {
                        const newSpins = eligibilityResponse.data.spinsAvailable;
                        setSpinsAvailable(newSpins);
                        onSpinsUpdate?.(newSpins);
                        
                        // If more spins available, go back to wheel, otherwise show error
                        // But only if not currently showing reward
                        if (currentView !== 'reward') {
                            if (newSpins > 0) {
                                setCurrentView('wheel');
                            } else {
                                setCurrentView('error');
                                setError('No more spins available');
                            }
                        }
                    }
                } catch (err) {
                    // console.error('Failed to refresh eligibility:', err);
                    setCurrentView('wheel');
                }
            } else {
                throw new Error(claimResponse.message || 'Failed to claim reward');
            }
        } catch (err: any) {
            // console.error('💰 Claim error:', err);
            const errorMessage =
                err?.data?.error === 'ALREADY_CLAIMED'
                    ? 'This reward has already been claimed'
                    : err?.data?.error === 'SPIN_NOT_FOUND'
                      ? 'Invalid spin ID or spin not found'
                      : err?.message || 'Failed to claim reward. Please try again.';
            toastError(errorMessage);
        } finally {
            setIsClaiming(false);
        }
    }, [isClaiming, refreshWalletBalance, updateUserSCBalance, onSpinsUpdate, currentView]);

    const handleClaimReward = useCallback(async () => {
        // console.log('💰 ===== handleClaimReward CALLED (OK button or manual) =====');
        // console.log('💰 wonReward state:', wonReward);
        // console.log('💰 wonReward?.rewardId:', wonReward?.rewardId);
        // console.log('💰 isClaiming:', isClaiming);
        // console.log('💰 hasAutoClaimed:', hasAutoClaimed);
        
        if (!wonReward || isClaiming || hasAutoClaimed) {
            // console.log('💰 ❌ Cannot claim - conditions:', { hasWonReward: !!wonReward, isClaiming, hasAutoClaimed });
            return;
        }
        // console.log('💰 ✅ Calling handleClaimRewardWithReward with wonReward:', wonReward);
        return handleClaimRewardWithReward(wonReward);
    }, [wonReward, isClaiming, hasAutoClaimed, handleClaimRewardWithReward]);

    // Handle close reward modal
    const handleCloseReward = useCallback(() => {
        setWonReward(null);
        setPendingReward(null);
        pendingRewardRef.current = null;
        setIsSpinning(false);
        isSpinningRef.current = false;
        
        // Check if more spins available
        if (spinsAvailable > 0) {
            setCurrentView('wheel');
        } else {
            // No more spins - just close the modal entirely
            // Don't show error view, just close it gracefully
            onClose?.();
        }
    }, [spinsAvailable, onClose]);

    // Render based on current view
    if (currentView === 'loading') {
        return (
            <DialogContent className='lg:max-w-fit!' neonBoxClass='max-sm:px-2!' showScrollBar={false}>
                <DialogTitle asChild>
                    <NeonText as='h3' className='h3-title sr-only'>
                        Loading Spin Wheel
                    </NeonText>
                </DialogTitle>
                <div className='py-8 flex flex-col items-center text-center relative z-10'>
                    <div className='animate-spin text-4xl mb-4'>⏳</div>
                    <NeonText as='h3' className='h3-title'>
                        Loading Spin Wheel...
                    </NeonText>
                </div>
            </DialogContent>
        );
    }

    if (currentView === 'error') {
    return (
        <DialogContent className='lg:max-w-fit!' neonBoxClass='max-sm:px-2!' showScrollBar={false}>
                        <DialogTitle asChild>
                        {/* <NeonText as='h3' className='h3-title mb-4'>
                            Treasure Wheel
                            </NeonText> */}
                        </DialogTitle>
                <div className='py-8 flex flex-col items-center text-center relative z-10'>
                            <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                                backgroundOpacity={0.2}
                        className='px-6 py-4 rounded-lg mb-6'
                    >
                        <NeonText
                            as='p'
                            glowColor='--color-yellow-500'
                            className='text-base font-medium'
                        >
                            {error || 'No spins available. Check back later!'}
                            </NeonText>
                        </NeonBox>
                    <p className='text-sm text-white/70 mb-4'>
                        Earn spins through:
                    </p>
                    <ul className='text-sm text-white/60 space-y-2 mb-6'>
                        <li>✨ First-time bonus for new users</li>
                        <li>🎲 Random triggers</li>
                        <li>💰 Spending milestones</li>
                    </ul>
                    {onClose && (
                        <Button size='lg' onClick={onClose}>
                            Close
                        </Button>
                    )}
                    </div>
            </DialogContent>
        );
    }

    if (currentView === 'reward' && wonReward) {
        return (
            <DialogContent className='max-w-[98vw] sm:max-w-[500px] md:max-w-[550px]!' neonBoxClass='p-4 sm:p-6!' showScrollBar={false}>
                <DialogTitle asChild>
                    <NeonText as='h2' className='sr-only'>
                        Congratulations! You won a reward!
                    </NeonText>
                </DialogTitle>
                <SpinWheelRewardContent
                    reward={wonReward}
                    onClaim={() => {
                        // CRITICAL: Always use rewardToClaimRef.current, never wonReward state
                        // console.log('💰 ===== OK BUTTON CLICKED =====');
                        // console.log('💰 rewardToClaimRef.current:', rewardToClaimRef.current);
                        // console.log('💰 wonReward state:', wonReward);
                        
                        const reward = rewardToClaimRef.current;
                        if (reward) {
                            // console.log('💰 ✅ Claiming with reward from ref:', reward);
                            // console.log('💰 ✅ reward.rewardId:', reward.rewardId);
                            // console.log('💰 ✅ reward.spinId:', reward.spinId);
                            handleClaimRewardWithReward(reward);
                        } else {
                            // console.error('💰 ❌ No reward in ref! Using wonReward as fallback');
                            if (wonReward) {
                                handleClaimRewardWithReward(wonReward);
                            } else {
                                // console.error('💰 ❌ No reward available to claim!');
                            }
                        }
                    }}
                    onClose={handleCloseReward}
                    isClaiming={isClaiming}
                />
            </DialogContent>
        );
    }

    // Main spin wheel view
    // console.log('🎰 Rendering wheel view:', { 
    //     currentView, 
    //     optionsLength: options.length, 
    //     configRewardsLength: configRewards.length, 
    //     spinsAvailable,
    //     hasConfigRewards: configRewards.length > 0,
    //     hasOptions: options.length > 0
    // });
    
    const getWheelSize = () => {
        if (typeof window === 'undefined') {
            if (xxs) return 360;
            if (xs) return 450;
            return 520;
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        // Very small screens (phones in portrait) - maximize width
        if (vw < 400) return Math.min(340, vw * 0.92);
        // Small screens - fill horizontal space
        if (xxs) return Math.min(400, vw * 0.92);
        // Medium phones
        if (xs) return Math.min(460, vw * 0.92);
        // Tablets - use more space
        if (vw < 900) return Math.min(500, vw * 0.75);
        // Desktops - big and prominent
        return Math.min(550, Math.min(vw * 0.7, vh * 0.65));
    };
    
    const wheelSize = getWheelSize();

    return (
        <DialogContent 
            className='max-w-[98vw] sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[700px]!' 
            neonBoxClass='p-3 sm:p-4 md:p-6!'
            showScrollBar={false}
        >
                        <DialogTitle asChild>
                <NeonText as='h3' className='text-center text-lg font-semibold mb-1'>
                    ✨ Treasure Wheel ✨
                            </NeonText>
                        </DialogTitle>

            <div className='flex flex-col items-center text-center w-full'>
                {/* Spins Available Badge - Minimal */}
                <div 
                    className='px-3 py-1 rounded-full mb-2 inline-flex items-center'
                    style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                >
                    <span className='text-green-400 text-xs font-medium'>
                        {spinsAvailable} {spinsAvailable === 1 ? 'spin' : 'spins'} left
                    </span>
                </div>

                {/* Error Display */}
                {error && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                            backgroundOpacity={0.2}
                        className='px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg mb-4 max-w-full'
                    >
                            <NeonText
                            as='p'
                            glowColor='--color-red-500'
                            className='text-xs sm:text-sm font-medium'
                        >
                            {error}
                            </NeonText>
                    </NeonBox>
                )}

                {/* Spin Wheel Container */}
                <div className='w-full flex justify-center items-center overflow-visible'>
                    {options.length > 0 ? (
                        <div 
                            className='relative'
                            style={{ 
                                width: wheelSize, 
                                height: wheelSize + 80, // Extra space for button
                            }}
                        >
                            <SpinWheel
                                options={options}
                                onSpin={handleSpinComplete}
                                requestWinnerIndex={requestWinnerIndex}
                                size={wheelSize}
                                pointerOffsetDeg={0}
                                spinDuration={5000}
                            revealOffsetMs={500}
                                disabled={isSpinning || (spinsAvailable === 0 && !isSpinningRef.current) || options.length === 0}
                                disableIdleRotation={false}
                            />
                        </div>
                    ) : (
                        <div className='flex items-center justify-center py-16'>
                            <div className='text-center'>
                                <div className='animate-spin text-5xl mb-6'>🎰</div>
                                <p className='text-white/80 text-lg font-medium'>Loading Treasure Wheel...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    );
}

export default SpinWheelModal;

