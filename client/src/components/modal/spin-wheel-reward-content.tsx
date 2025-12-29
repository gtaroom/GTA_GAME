'use client';

import { useEffect, useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { DialogTitle, DialogClose } from '../ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';

interface SpinWheelRewardContentProps {
    reward: {
        rewardId: number;
        amount: number;
        type: 'GC' | 'SC';
        rarity?: string;
        description?: string;
        spinId: string;
    };
    onClaim: () => void;
    onClose?: () => void;
    isClaiming?: boolean;
}

export default function SpinWheelRewardContent({
    reward,
    onClaim,
    onClose,
    isClaiming = false,
}: SpinWheelRewardContentProps) {
    const { xs } = useBreakPoint();
    const [showConfetti, setShowConfetti] = useState(false);
    const [showWinAnimation, setShowWinAnimation] = useState(false);

    useEffect(() => {
        // Trigger confetti and win animation on mount
        setShowConfetti(true);
        setShowWinAnimation(true);
        
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const coinIcon = reward.type === 'GC' ? '/coins/bronze-coin.svg' : '/coins/sweep-coin.svg';
    const coinName = reward.type === 'GC' ? 'Gold Coins' : 'Silver Coins';
    
    // Use type-based colors: Gold for GC, Green for SC
    // GC = Gold Coins = Gold/Orange color
    // SC = Silver/Sweep Coins = Green color (matches website theme)
    const getTypeColor = () => {
        if (reward.type === 'SC') {
            // Green for Silver/Sweep Coins
            return { color: '--color-green-500', hexColor: '#22c55e' };
        } else {
            // Gold/Orange for Gold Coins
            return { color: '--color-yellow-500', hexColor: '#f59e0b' };
        }
    };

    const { color: rewardColor, hexColor } = getTypeColor();

    return (
        <div className='py-6 flex flex-col items-center text-center relative overflow-hidden'>
            {/* Confetti Effect - Reduced count for performance */}
            {showConfetti && (
                <div className='absolute inset-0 pointer-events-none z-50 overflow-hidden'>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className='absolute'
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)],
                                animation: `confetti-fall ${Math.random() * 2 + 1.5}s ease-out forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                borderRadius: '50%',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className='relative z-10 w-full max-w-md mx-auto'>
                <DialogTitle asChild>
                    <div className='mb-4'>
                        <NeonText 
                            as='h2' 
                            className='text-2xl sm:text-3xl font-black'
                            style={{
                                animation: 'title-pop 0.5s ease-out',
                                textShadow: `0 0 30px var(${rewardColor})`,
                            }}
                        >
                            🎉 CONGRATULATIONS! 🎉
                        </NeonText>
                        <p className='text-lg font-bold text-white/90 mt-2'>
                            You Won!
                        </p>
                    </div>
                </DialogTitle>

                {/* Prize Display */}
                <div className='relative mb-6'>
                    <NeonBox
                        glowColor={rewardColor}
                        backgroundColor={rewardColor}
                        backgroundOpacity={0.3}
                        className='px-8 py-6 rounded-2xl border-2 relative'
                        style={{
                            borderColor: `var(${rewardColor})`,
                            boxShadow: `0 0 40px var(${rewardColor})`,
                        }}
                    >
                            <div
                                className='absolute inset-0 shimmer-effect'
                                style={{
                                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                                    animation: 'shimmer 2s infinite',
                                }}
                            />

                        <div className='flex flex-col items-center gap-4'>
                            {/* Coin Icon */}
                            <img
                                src={coinIcon}
                                alt={coinName}
                                className='w-20 h-20 drop-shadow-2xl'
                                style={{
                                    filter: `drop-shadow(0 0 15px var(${rewardColor}))`,
                                    animation: 'coin-spin 2s ease-in-out infinite',
                                }}
                            />

                            {/* Amount */}
                            <div
                                className='text-4xl sm:text-5xl font-black'
                                style={{
                                    color: `var(${rewardColor})`,
                                    textShadow: `0 0 20px var(${rewardColor})`,
                                }}
                            >
                                {new Intl.NumberFormat('en-US').format(reward.amount)}
                            </div>
                            
                            {/* Coin Name */}
                            <div 
                                className='text-xl font-bold uppercase'
                                style={{
                                    color: `var(${rewardColor})`,
                                }}
                            >
                                {coinName}
                            </div>
                        </div>
                    </NeonBox>
                </div>

                {/* Success Message */}
                <div 
                    className='flex items-center gap-2 mb-6 px-4 py-2 rounded-lg'
                    style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.5)',
                    }}
                >
                    <span className='text-xl'>✅</span>
                    <span className='text-green-400 font-bold'>
                        {isClaiming ? 'Claiming...' : 'Reward Claimed Successfully!'}
                    </span>
                    <span className='text-xl'>🎉</span>
                </div>

                {/* OK Button */}
                <Button
                    size='lg'
                    onClick={onClose || onClaim}
                    disabled={isClaiming}
                    className='px-12 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl'
                    style={{
                        boxShadow: '0 0 25px rgba(168, 85, 247, 0.5)',
                    }}
                >
                    {isClaiming ? (
                        <span className='flex items-center gap-2'>
                            <span className='animate-spin'>⏳</span>
                            Claiming...
                        </span>
                    ) : (
                        <span className='flex items-center gap-2'>
                            ✨ OK ✨
                        </span>
                    )}
                </Button>
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes win-burst {
                    0% {
                        transform: scale(0) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2) rotate(180deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1.5) rotate(360deg);
                        opacity: 0;
                    }
                }

                @keyframes title-pop {
                    0% {
                        transform: scale(0) rotate(-10deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1) rotate(5deg);
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }

                @keyframes prize-enter {
                    0% {
                        transform: scale(0) rotateY(90deg);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.1) rotateY(-5deg);
                    }
                    100% {
                        transform: scale(1) rotateY(0deg);
                        opacity: 1;
                    }
                }

                @keyframes coin-enter {
                    0% {
                        transform: scale(0) rotate(-180deg);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.2) rotate(10deg);
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }

                @keyframes prize-glow {
                    0%, 100% {
                        transform: scale(1);
                        filter: brightness(1);
                        box-shadow: 0 0 50px var(${rewardColor}), inset 0 0 30px var(${rewardColor});
                    }
                    50% {
                        transform: scale(1.02);
                        filter: brightness(1.3);
                        box-shadow: 0 0 80px var(${rewardColor}), inset 0 0 50px var(${rewardColor});
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1.5);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.8);
                    }
                }

                @keyframes coin-spin {
                    0%, 100% {
                        transform: rotate(0deg) scale(1);
                    }
                    25% {
                        transform: rotate(-15deg) scale(1.15);
                    }
                    75% {
                        transform: rotate(15deg) scale(1.15);
                    }
                }

                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%) skewX(-20deg);
                    }
                    100% {
                        transform: translateX(200%) skewX(-20deg);
                    }
                }

                @keyframes amount-pop {
                    0% {
                        transform: scale(0) rotateY(90deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.3) rotateY(-5deg);
                    }
                    100% {
                        transform: scale(1) rotateY(0deg);
                        opacity: 1;
                    }
                }

                @keyframes message-slide {
                    0% {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes button-enter {
                    0% {
                        transform: translateY(30px) scale(0.9);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .confetti-particle {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }

                .shimmer-effect {
                    pointer-events: none;
                }

                .prize-container {
                    perspective: 1000px;
                }

                .coin-container {
                    transform-style: preserve-3d;
                }
            `}</style>
        </div>
    );
}

