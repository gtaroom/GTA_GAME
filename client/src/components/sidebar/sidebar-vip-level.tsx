'use client';
import NeonBox from "../neon/neon-box";
import NeonText from "../neon/neon-text";
import Image from 'next/image';
import { useVip } from '@/contexts/vip-context';
import { getTierImage, getTierColor, getTierDisplayName } from '@/lib/vip-utils';
import { useRouter } from 'next/navigation';

export default function VipLevelCard() {
    const { vipStatus, isLoading } = useVip();
    const router = useRouter();

    const getProgressPercentage = () => {
        if (!vipStatus?.nextTier) return 0;
        const { spendingNeeded, minSpend } = vipStatus.nextTier;
        const currentSpending = vipStatus.last7DaysSpending;
        const progress = Math.min((currentSpending / minSpend) * 100, 100);
        return Math.max(progress, 0);
    };

    const getProgressText = () => {
        if (!vipStatus?.nextTier) return 'Play to Level UP!';
        const { spendingNeeded, message } = vipStatus.nextTier;
        return spendingNeeded > 0 ? message : 'Max Level Reached!';
    };

    const getArcadeTicketsText = () => {
        if (!vipStatus) return 'Play to earn Arcade Tickets!';
        const { arcadeTickets, arcadeTicketsNeededForNextTier } = vipStatus;
        if (arcadeTicketsNeededForNextTier === 0) {
            return `${arcadeTickets} Arcade Tickets (Max Level)`;
        }
        return `${arcadeTickets} Arcade Tickets (${arcadeTicketsNeededForNextTier} needed for next tier)`;
    };

    const getNextTierArcadeTickets = () => {
        if (!vipStatus) return 'Play to earn Arcade Tickets!';
        const { arcadeTicketsNeededForNextTier } = vipStatus;
        return arcadeTicketsNeededForNextTier > 0 ? `${arcadeTicketsNeededForNextTier} Tickets` : 'Max Level';
    };

    // Get tier image and color based on current tier
    const currentTier = vipStatus?.tier || 'none';
    const tierColor = getTierColor(currentTier);
    const tierImage = getTierImage(currentTier);
    const progressPercentage = getProgressPercentage();

    const handleClick = () => {
        router.push('/vip-program');
    };

    return (
        <>
        <div className='px-5'>
            <NeonBox
                glowColor={tierColor}
                backgroundColor={tierColor}
                backgroundOpacity={0.2}
                className='rounded-lg grid place-items-center backdrop-blur-2xl p-4 cursor-pointer hover:scale-105 transition-transform duration-300'
                onClick={handleClick}
            >
                <div className='flex items-center gap-2 w-full'>
                    <div className='relative aspect-square w-[50px]'>
                        <Image
                            src={tierImage}
                            alt={`${getTierDisplayName(currentTier)} Tier`}
                            height={50}
                            width={50}
                            className='motion-safe:motion-scale-loop-[1.02] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear'
                        />
                        <div className={`absolute left-1/2 top-1/2 w-[40px] aspect-1/1 rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-xl ${
                            tierColor === '--color-gray-400' ? 'bg-gray-400' :
                            tierColor === '--color-amber-500' ? 'bg-amber-500' :
                            tierColor === '--color-slate-400' ? 'bg-slate-400' :
                            tierColor === '--color-yellow-500' ? 'bg-yellow-500' :
                            tierColor === '--color-blue-500' ? 'bg-blue-500' :
                            tierColor === '--color-purple-500' ? 'bg-purple-500' :
                            tierColor === '--color-red-500' ? 'bg-red-500' :
                            tierColor === '--color-green-500' ? 'bg-green-500' : 'bg-purple-500'
                        }`}></div>
                    </div>
                    <div className='flex flex-col gap-2 w-full max-sm:text-center'>
                        <div className='flex gap-4 w-full justify-between'>
                            <NeonText
                                as='h6'
                                glowColor={tierColor}
                                className='text-base leading-6! capitalize'
                            >
                                vip level
                            </NeonText>
                            <NeonText
                                as='p'
                                glowColor={tierColor}
                                className='text-base leading-6! capitalize'
                            >
                                {isLoading ? 'Loading...' : getTierDisplayName(currentTier).replace(' Tier', '')}
                            </NeonText>
                        </div>
                        <NeonBox
                            className='w-full p-1 rounded-pill'
                            borderWidth={1}
                            glowSpread={0.5}
                            backgroundColor={tierColor}
                            backgroundOpacity={0.1}
                        >
                            <div 
                                className={`h-0.5 rounded-pill transition-all duration-500 ${
                                    tierColor === '--color-gray-400' ? 'bg-gray-400' :
                                    tierColor === '--color-amber-500' ? 'bg-amber-500' :
                                    tierColor === '--color-slate-400' ? 'bg-slate-400' :
                                    tierColor === '--color-yellow-500' ? 'bg-yellow-500' :
                                    tierColor === '--color-blue-500' ? 'bg-blue-500' :
                                    tierColor === '--color-purple-500' ? 'bg-purple-500' :
                                    tierColor === '--color-red-500' ? 'bg-red-500' :
                                    tierColor === '--color-green-500' ? 'bg-green-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </NeonBox>
                        <div className='flex gap-4 w-full justify-between'>
                            <p className='text-xs'>To the Next Level</p>
                            <NeonText
                                as='span'
                                glowColor={tierColor}
                                className='text-xs'
                            >
                                {isLoading ? 'Loading...' : getNextTierArcadeTickets()}
                            </NeonText>
                        </div>
                    </div>
                </div>
            </NeonBox>
        </div>
    </>
    )
}