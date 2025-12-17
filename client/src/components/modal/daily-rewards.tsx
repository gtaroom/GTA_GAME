import { cn } from '@/lib/utils';
import Image from 'next/image';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { DialogContent, DialogTitle } from '../ui/dialog';
import type { User } from '@/types/user.types';

const DAY_REWARDS = {
    1: 5000,
    2: 5500,
    3: 6000,
    4: 6500,
    5: 7000,
    6: 7500,
    7: 10000,
} as Record<number, number>;

type Reward = {
    day: number;
    GC: number;
    claimed: boolean;
    message?: string;
};

interface DailyRewardsProps {
    user: User | null;
    onClaim: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function DailyRewards({ user, onClaim, loading = false, error }: DailyRewardsProps) {
    // Calculate current day in weekly cycle
    const getCurrentDayInCycle = (loginStreak: number): number => {
        const streak = Number(loginStreak) || 0;
        if (streak <= 0) return 1;
        return ((streak - 1) % 7) + 1;
    };

    const currentDayInCycle = user ? getCurrentDayInCycle(user.loginStreak) : 1;
    
    // Create weekly rewards based on DAY_REWARDS
    const weeklyRewards: Reward[] = Object.entries(DAY_REWARDS).map(([day, gcAmount]) => ({
        day: Number(day),
        GC: gcAmount,
        claimed: false,
        message: day === '7' ? 'Thanks For Playing All Week!' : undefined
    }));
    
    // Create dynamic rewards based on user's progress
    const dynamicRewards = weeklyRewards.map(reward => {
        const isPastDay = user && reward.day < currentDayInCycle;
        const isCurrentDay = user && reward.day === currentDayInCycle;
        
        return {
            ...reward,
            claimed: Boolean(isPastDay || (isCurrentDay && user?.claimedDailyBonus))
        };
    });
    
    const RewardBox = ({ rewardData }: { rewardData: Reward }) => {
        const isCurrentDay = user && rewardData.day === currentDayInCycle;
        const isClaimed = rewardData.claimed;
        const isClaimable = isCurrentDay && !isClaimed;
        const shouldHighlight = isCurrentDay; // Highlight current day regardless of claim status
        
        const handleBoxClick = () => {
            if (isClaimable && !loading) {
                onClaim();
            }
        };
        
        return (
            <NeonBox
                className={cn(
                    'p-4 rounded-2xl relative flex flex-col items-center justify-between text-center transition-all duration-300',
                    rewardData.day === 7 &&
                        'col-start-1 lg:col-start-4 col-end-2 lg:col-end-5 md:col-end-4 sm:col-end-3  row-start-7 lg:row-start-1 md:row-start-3 sm:row-start-4 row-end-7 lg:row-end-3 md:row-end-3 sm:row-end-4',
                    shouldHighlight && !isClaimed && 'ring-4 ring-yellow-400 ring-opacity-90 shadow-2xl shadow-yellow-400/40 scale-105',
                    shouldHighlight && isClaimed && 'ring-2 ring-yellow-500 ring-opacity-60 shadow-lg shadow-yellow-500/20',
                    isClaimable && 'cursor-pointer hover:scale-110 hover:shadow-yellow-400/60',
                    loading && 'cursor-not-allowed opacity-50'
                )}
                backgroundColor={shouldHighlight && !isClaimed ? '--color-yellow-500' : '--color-purple-500'}
                backgroundOpacity={isClaimed ? 0.4 : shouldHighlight && !isClaimed ? 0.15 : 0.1}
                glowSpread={shouldHighlight && !isClaimed ? 1.5 : shouldHighlight ? 1.2 : 0.8}
                onClick={handleBoxClick}
            >
                {isClaimed && (
                    <NeonIcon
                        icon='lucide:badge-check'
                        className='text-lg md:text-xl absolute top-4 right-4'
                    />
                )}
                
                {shouldHighlight && !isClaimed && (
                    <div className='absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse'>
                        CLICK TO CLAIM!
                    </div>
                )}
                
                <NeonText
                    as='span'
                    className={cn(
                        'text-lg md:text-xl uppercase font-bold mb-2 md:mb-4',
                        shouldHighlight && !isClaimed && 'text-yellow-300'
                    )}
                >
                    Day {rewardData.day}
                </NeonText>
                <div>
                    <Image
                        src='/modal/gift-icon.png'
                        height={200}
                        width={200}
                        alt='Gift Icon'
                        className={cn(
                            'w-[80px] aspect-square mb-2 md:mb-4',
                            rewardData.day === 7 && 'w-[110px] sm:w-[150px]'
                        )}
                    />
                    <div className='flex items-center justify-center gap-2'>
                        <Image
                            src='/coins/gold-coin.svg'
                            height={40}
                            width={40}
                            alt='Gold Coin'
                            className='w-[20px] aspect-square'
                        />
                        <NeonText
                            glowColor='--color-yellow-500'
                            glowSpread={0.5}
                        >
                            <span className='text-base font-bold'>
                                {rewardData.GC.toLocaleString()} GC
                            </span>
                        </NeonText>
                    </div>
                </div>
                {rewardData.message && (
                    <NeonText className='text-base font-bold text-center mt-1'>
                        {rewardData.message}
                    </NeonText>
                )}
            </NeonBox>
        );
    };

    return (
        <DialogContent
            className='lg:max-w-[1000px]! sm:max-w-[calc(100%-2rem)]!'
            neonBoxClass='max-sm:px-2!'
        >
            <div className='px-3 py-3 flex flex-col items-center text-center'>
                <DialogTitle className='mb-3' asChild>
                    <NeonText as='h3' className='h3-title'>
                        DAILY REWARDS
                    </NeonText>
                </DialogTitle>
                <p className='text-base font-bold capitalize mb-6 md:mb-8'>
                    Log in daily to earn amazing rewards
                </p>

                {currentDayInCycle && user && !user?.claimedDailyBonus && (
                    <div className='mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg'>
                        <NeonText className='text-yellow-400 text-sm mb-2'>
                            Today's Reward: Day {currentDayInCycle}
                        </NeonText>
                        <br />
                        <NeonText className='text-yellow-400 text-sm'>
                            {DAY_REWARDS[currentDayInCycle]?.toLocaleString()} Gold Coins
                        </NeonText>
                    </div>
                )}

                {error && (
                    <div className='mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg'>
                        <NeonText className='text-red-400 text-sm'>
                            {error}
                        </NeonText>
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-2 md:gap-4 lg:gap-8 w-full mb-6'>
                    {dynamicRewards.map((reward, index) => (
                        <RewardBox key={index} rewardData={reward} />
                    ))}
                </div>

                {currentDayInCycle && user && !user?.claimedDailyBonus && (
                    <Button 
                        onClick={onClaim}
                        disabled={loading}
                        size='lg'
                        className='relative z-[1]'
                    >
                        {loading ? 'Claiming...' : `Claim Day ${currentDayInCycle} Reward`}
                    </Button>
                )}
            </div>
        </DialogContent>
    );
}
