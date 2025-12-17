'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';

export default function SweepCoinReward() {
    const { lg, md } = useBreakPoint();
    const rewardsInfo = [
        {
            icon: 'lucide:lightbulb',
            text: '40 SC required for redemption',
        },
        {
            icon: 'lucide:notebook-text',
            text: 'Must meet playthrough and verification rules',
        },
        {
            icon: 'lucide:ticket',
            text: 'Under 40 SC? You still qualify for drawings',
        },
    ];
    return (
        <section className='mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Redeemable Rewards with Sweeps Coins
                </NeonText>
                <NeonBox
                    glowColor='--color-green-500'
                    backgroundColor='--color-green-500'
                    backgroundOpacity={0.1}
                    className='p-6 lg:p-10 md:p-8 rounded-2xl backdrop-blur-2xl flex items-center justify-center gap-[30px] md:gap-[40px] lg:gap-[60px] flex-col md:flex-row'
                >
                    <div className='flex items-center gap-4 md:gap-6 flex-col md:flex-row'>
                        <Image
                            src='/coins/sweep-coin.svg'
                            alt='Sweep Coin Reward'
                            height={lg ? '100' : `${md ? '80' : '70'}`}
                            width={lg ? '100' : `${md ? '80' : '70'}`}
                        />
                        <div className='flex flex-col items-start gap-4 w-full lg:w-[calc(100%-124px)] md:w-[calc(100%-104px)]'>
                            <NeonText
                                as='h4'
                                className='h4-title text-center md:text-left'
                                glowColor='--color-green-500'
                                glowSpread={0.5}
                            >
                                Current SC: 25 / 40 needed to redeem
                            </NeonText>
                            <NeonBox
                                className='max-w-[400px] w-full p-1.5 rounded-pill'
                                borderWidth={2}
                                glowSpread={0.5}
                                glowColor='--color-green-500'
                                backgroundColor='--color-green-500'
                                backgroundOpacity={0.1}
                            >
                                <div className='bg-white h-1 w-1/2 rounded-pill'></div>
                            </NeonBox>
                        </div>
                    </div>

                    <ul className='space-y-3'>
                        {rewardsInfo.map((reward, index) => (
                            <li key={index} className='flex items-center gap-3'>
                                <NeonIcon
                                    icon={reward.icon}
                                    size={24}
                                    glowSpread={0.8}
                                    glowColor='--color-green-500'
                                />
                                <NeonText
                                    className='text-base md:text-lg font-bold'
                                    glowColor='--color-green-500'
                                    glowSpread={0.1}
                                >
                                    {reward.text}
                                </NeonText>
                            </li>
                        ))}
                    </ul>
                </NeonBox>
            </div>
        </section>
    );
}
