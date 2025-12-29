'use client';

import { useEffect, useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { DialogContent, DialogTitle, DialogClose } from '../ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';

interface SpinWheelRewardModalProps {
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

export default function SpinWheelRewardModal({
    reward,
    onClaim,
    onClose,
    isClaiming = false,
}: SpinWheelRewardModalProps) {
    const { xs } = useBreakPoint();
    const [showConfetti, setShowConfetti] = useState(false);
    const [showWinAnimation, setShowWinAnimation] = useState(false);

    useEffect(() => {
        // Trigger confetti and win animation on mount
        setShowConfetti(true);
        setShowWinAnimation(true);
        
        // Play win sound effect (optional - can be added later)
        // const audio = new Audio('/sounds/win.mp3');
        // audio.play().catch(() => {}); // Ignore errors if file doesn't exist
        
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const coinIcon = reward.type === 'GC' ? '/coins/bronze-coin.svg' : '/coins/sweep-coin.svg';
    const coinName = reward.type === 'GC' ? 'Gold Coins' : 'Silver Coins';
    
    // Determine rarity color and celebration level
    const getRarityColor = () => {
        switch (reward.rarity) {
            case 'top_reward':
                return { color: '--color-yellow-500', level: 'epic' };
            case 'ultra_rare':
                return { color: '--color-purple-500', level: 'legendary' };
            case 'very_rare':
                return { color: '--color-pink-500', level: 'rare' };
            case 'rare':
                return { color: '--color-blue-500', level: 'rare' };
            case 'uncommon':
                return { color: '--color-green-500', level: 'good' };
            default:
                return { color: '--color-blue-500', level: 'normal' };
        }
    };

    const { color: rarityColor, level } = getRarityColor();

    return (
        <DialogContent className='lg:max-w-fit! max-w-[95vw]' neonBoxClass='max-sm:px-2!'>
            <div className='py-6 sm:py-8 flex flex-col items-center text-center relative overflow-hidden min-h-[400px]'>
                {/* Enhanced Confetti Effect - More like gaming sites */}
                {showConfetti && (
                    <div className='absolute inset-0 pointer-events-none z-50 overflow-hidden'>
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div
                                key={i}
                                className='absolute confetti-particle'
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 10 + 6}px`,
                                    height: `${Math.random() * 10 + 6}px`,
                                    backgroundColor: [
                                        '#FFD700',
                                        '#FF6B6B',
                                        '#4ECDC4',
                                        '#45B7D1',
                                        '#FFA07A',
                                        '#98D8C8',
                                        '#FFD93D',
                                        '#6BCF7F',
                                    ][Math.floor(Math.random() * 8)],
                                    animation: `confetti-fall ${Math.random() * 3 + 2}s ease-out forwards`,
                                    animationDelay: `${Math.random() * 1}s`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                    borderRadius: '50%',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Win Animation Overlay */}
                {showWinAnimation && (
                    <div className='absolute inset-0 pointer-events-none z-40 flex items-center justify-center'>
                        <div
                            className='win-burst'
                            style={{
                                animation: 'win-burst 1s ease-out',
                            }}
                        >
                            <div className='text-8xl sm:text-9xl font-black opacity-20' style={{ color: `var(${rarityColor})` }}>
                                WIN!
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className='relative z-10 w-full'>
                    <DialogTitle asChild>
                        <div className='mb-6'>
                            <NeonText 
                                as='h2' 
                                className='text-3xl sm:text-4xl md:text-5xl font-black mb-2'
                                style={{
                                    animation: 'title-pop 0.8s ease-out',
                                    textShadow: `0 0 30px var(${rarityColor})`,
                                }}
                            >
                                🎉 CONGRATULATIONS! 🎉
                            </NeonText>
                            <p className='text-xl sm:text-2xl font-bold text-white/90 mt-2'>
                                You Won!
                            </p>
                        </div>
                    </DialogTitle>

                    {/* Prize Display - Enhanced Gaming Style */}
                    <div className='relative mb-8'>
                        <div
                            className='relative prize-container'
                            style={{
                                animation: 'prize-enter 1s ease-out',
                            }}
                        >
                            {/* Outer Glow Ring */}
                            <div
                                className='absolute inset-0 rounded-full blur-2xl opacity-60'
                                style={{
                                    background: `radial-gradient(circle, var(${rarityColor}) 0%, transparent 70%)`,
                                    transform: 'scale(1.5)',
                                    animation: 'glow-pulse 2s ease-in-out infinite',
                                }}
                            />

                            <NeonBox
                                glowColor={rarityColor}
                                backgroundColor={rarityColor}
                                backgroundOpacity={0.4}
                                className='px-8 sm:px-12 py-8 sm:py-10 rounded-2xl border-4 relative overflow-hidden'
                                style={{
                                    borderColor: `var(${rarityColor})`,
                                    boxShadow: `0 0 50px var(${rarityColor}), inset 0 0 30px var(${rarityColor})`,
                                    animation: 'prize-glow 2s ease-in-out infinite',
                                }}
                            >
                                {/* Shimmer effect */}
                                <div
                                    className='absolute inset-0 shimmer-effect'
                                    style={{
                                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                                        animation: 'shimmer 2s infinite',
                                    }}
                                />

                                <div className='relative z-10 flex flex-col items-center gap-6'>
                                    {/* Coin Icon with enhanced animation */}
                                    <div
                                        className='relative coin-container'
                                        style={{
                                            animation: 'coin-enter 1s ease-out 0.3s both',
                                        }}
                                    >
                                        <div
                                            className='relative'
                                            style={{
                                                animation: 'coin-spin 3s ease-in-out infinite',
                                            }}
                                        >
                                            <img
                                                src={coinIcon}
                                                alt={coinName}
                                                className={`${xs ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-20 h-20'} drop-shadow-2xl`}
                                                style={{
                                                    filter: `drop-shadow(0 0 20px var(${rarityColor}))`,
                                                }}
                                            />
                                            {/* Multiple glow layers */}
                                            <div
                                                className='absolute inset-0 blur-2xl opacity-40'
                                                style={{
                                                    background: `radial-gradient(circle, var(${rarityColor}) 0%, transparent 70%)`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Amount Display - Big and Bold */}
                                    <div className='flex flex-col items-center gap-3'>
                                        <div
                                            className='text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight'
                                            style={{
                                                color: `var(${rarityColor})`,
                                                textShadow: `0 0 30px var(${rarityColor}), 0 0 60px var(${rarityColor})`,
                                                animation: 'amount-pop 0.8s ease-out 0.5s both',
                                                WebkitTextStroke: '2px rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            {new Intl.NumberFormat('en-US', {
                                                notation: 'standard',
                                            }).format(reward.amount)}
                                        </div>
                                        <div 
                                            className='text-xl sm:text-2xl font-bold uppercase'
                                            style={{
                                                color: `var(${rarityColor})`,
                                                textShadow: `0 0 10px var(${rarityColor})`,
                                            }}
                                        >
                                            {coinName}
                                        </div>
                                        {reward.rarity && (
                                            <div
                                                className='text-sm font-bold uppercase px-4 py-2 rounded-full border-2'
                                                style={{
                                                    backgroundColor: `var(${rarityColor})`,
                                                    opacity: 0.2,
                                                    borderColor: `var(${rarityColor})`,
                                                    color: `var(${rarityColor})`,
                                                    textShadow: `0 0 5px var(${rarityColor})`,
                                                }}
                                            >
                                                {reward.rarity.replace(/_/g, ' ').toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </NeonBox>
                        </div>
                    </div>

                    {/* Success Message - Gaming Style */}
                    <NeonBox
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.3}
                        className='px-6 py-4 rounded-xl mb-8 inline-flex items-center gap-3'
                        style={{
                            animation: 'message-slide 0.8s ease-out 0.7s both',
                        }}
                    >
                        <span className='text-2xl'>✨</span>
                        <NeonText
                            as='span'
                            glowColor='--color-green-500'
                            glowSpread={0.6}
                            className='text-lg sm:text-xl font-black uppercase'
                        >
                            Prize Ready to Claim!
                        </NeonText>
                        <span className='text-2xl'>✨</span>
                    </NeonBox>

                    {/* Claim Button - Enhanced */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                        <Button
                            size='lg'
                            onClick={onClaim}
                            disabled={isClaiming}
                            className='min-w-[220px] h-14 text-lg font-bold relative overflow-hidden group'
                            style={{
                                animation: 'button-enter 0.8s ease-out 0.9s both',
                            }}
                        >
                            {isClaiming ? (
                                <span className='flex items-center gap-3'>
                                    <span className='animate-spin text-xl'>⏳</span>
                                    <span>Claiming...</span>
                                </span>
                            ) : (
                                <span className='flex items-center gap-3'>
                                    <span className='text-2xl group-hover:scale-125 transition-transform'>✨</span>
                                    <span>Claim Reward</span>
                                    <span className='text-2xl group-hover:scale-125 transition-transform'>🎁</span>
                                </span>
                            )}
                        </Button>
                        
                        {onClose && (
                            <DialogClose asChild>
                                <Button
                                    variant='secondary'
                                    size='lg'
                                    onClick={onClose}
                                    className='min-w-[120px]'
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        )}
                    </div>
                </div>

                {/* Enhanced CSS Animations - Gaming Style */}
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
                            box-shadow: 0 0 50px var(${rarityColor}), inset 0 0 30px var(${rarityColor});
                        }
                        50% {
                            transform: scale(1.02);
                            filter: brightness(1.3);
                            box-shadow: 0 0 80px var(${rarityColor}), inset 0 0 50px var(${rarityColor});
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
        </DialogContent>
    );
}
