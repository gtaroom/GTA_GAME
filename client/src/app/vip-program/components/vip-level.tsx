'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { useVip } from '@/contexts/vip-context';
import { useAuth } from '@/contexts/auth-context';
import { getTierImage, getTierColor, getTierDisplayName } from '@/lib/vip-utils';

export default function VIPLevel() {
    const router = useTransitionRouter();
    const { vipStatus, isLoading } = useVip();
    const { isLoggedIn } = useAuth();

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

    const getTierDisplayName = () => {
        if (!vipStatus) return 'Standard';
        return vipStatus.tierName;
    };

    const getArcadeTicketsText = () => {
        if (!vipStatus) return 'Play to earn Arcade Tickets!';
        const { arcadeTickets, arcadeTicketsNeededForNextTier } = vipStatus;
        if (arcadeTicketsNeededForNextTier === 0) {
            return `${arcadeTickets} Arcade Tickets (Max Level)`;
        }
        return `${arcadeTickets} Arcade Tickets (${arcadeTicketsNeededForNextTier} needed for next tier)`;
    };

    // Get tier image and color based on current tier
    const currentTier = vipStatus?.tier || 'none';
    const tierColor = getTierColor(currentTier);
    const tierImage = getTierImage(currentTier);
    const progressPercentage = getProgressPercentage();

    return (
        <section>
            <div className='container-xxl'>
                <div className='flex flex-col md:grid md:grid-cols-[1fr_0.7fr] gap-4 lg:gap-8 mb-20'>
                    <NeonBox
                        glowColor={tierColor}
                        backgroundColor={tierColor}
                        backgroundOpacity={0.2}
                        className='h-auto sm:h-[300px] md:h-[360px] rounded-2xl grid place-items-center backdrop-blur-2xl sm:p-4 px-4 py-6'
                    >
                        <div className='flex max-sm:flex-col items-center gap-6 md:gap-10'>
                            <div className='relative aspect-square w-full sm:w-[220px] max-sm:max-w-40'>
                                <Image
                                    src={tierImage}
                                    alt={`${getTierDisplayName()} Tier`}
                                    height={500}
                                    width={500}
                                />
                                <div className={`absolute left-1/2 top-1/2 w-[180px] aspect-1/1 rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-xl ${
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
                            <div className='flex flex-col gap-6 max-w-[420px] w-full mt-4 sm:-mt-2 max-sm:text-center'>
                                <NeonText
                                    as='h1'
                                    glowColor={tierColor}
                                    className='h1-title leading-10! sm:leading-13.5!'
                                >
                                    {isLoading ? 'Loading...' : getTierDisplayName()}
                                </NeonText>
                                
                                {/* Progress Bar */}
                                <NeonBox
                                    className='w-full p-1.5 rounded-pill'
                                    borderWidth={2}
                                    glowSpread={0.5}
                                    backgroundColor={tierColor}
                                    backgroundOpacity={0.1}
                                >
                                    <div 
                                        className='bg-white h-1 rounded-pill transition-all duration-500'
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </NeonBox>
                                
                                {/* Arcade Tickets Info */}
                                <NeonBox
                                    className='py-2 px-4 rounded-md w-fit'
                                    glowSpread={0.5}
                                    backgroundColor={tierColor}
                                    backgroundOpacity={0.1}
                                >
                                    <NeonText
                                        as='span'
                                        className='font-bold text-lg uppercase'
                                        glowSpread={0.5}
                                    >
                                        {isLoading ? 'Loading...' : getArcadeTicketsText()}
                                    </NeonText>
                                </NeonBox>

                                {/* VIP Period Info - Only show in last 2-3 days */}
                                {vipStatus?.daysRemainingInPeriod !== undefined && vipStatus.daysRemainingInPeriod <= 3 && vipStatus.daysRemainingInPeriod > 0 && (
                                    <NeonBox
                                        className='py-2 px-4 rounded-md w-fit'
                                        glowSpread={0.5}
                                        backgroundColor={tierColor}
                                        backgroundOpacity={0.1}
                                    >
                                        <NeonText
                                            as='span'
                                            className='font-bold text-base uppercase'
                                            glowSpread={0.5}
                                        >
                                            {vipStatus.daysRemainingInPeriod} days remaining in VIP period
                                        </NeonText>
                                    </NeonBox>
                                )}
                            </div>
                        </div>
                    </NeonBox>
                    <NeonBox
                        glowColor='--color-blue-500'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.2}
                        className='h-auto sm:h-[300px] md:h-[360px] rounded-2xl grid place-items-center text-center backdrop-blur-2xl sm:p-4 px-4 py-6'
                    >
                        <div className='max-w-[340px]'>
                            <NeonText
                                as='h2'
                                glowColor='--color-blue-500'
                                className='h2-title leading-10! sm:leading-13.5! mb-2'
                            >
                                Feel the Thrill of VIP!
                            </NeonText>
                            <p className='text-base font-bold mb-8'>
                                Exclusive privileges and personal rewards for
                                our VIP players.
                            </p>
                            <Button
                                size='lg'
                                onClick={() => router.push('/game-listing')}
                            >
                                Play to Level UP!
                            </Button>
                        </div>
                    </NeonBox>
                </div>
            </div>
        </section>
    );
}
