'use client';
import AccountPageTitle from '@/app/(account)/profile/components/account-page-title';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useReferral } from '@/hooks/useReferral';
import { useEffect } from 'react';
import NeonIcon from '@/components/neon/neon-icon';

export default function Statistics({ isLoggedIn }: { isLoggedIn?: boolean }) {
    const { stats, isLoadingStats, fetchStats } = useReferral();

    useEffect(() => {
        if (isLoggedIn) {
            fetchStats();
        }
    }, [isLoggedIn, fetchStats]);
    const StatisticBox = ({
        title,
        children,
    }: {
        title: string;
        children: React.ReactNode;
    }) => (
        <NeonBox
            className='p-6 lg:p-7 rounded-lg backdrop-blur-2xl flex flex-col items-center lg:items-start gap-4 lg:mb-6'
            glowSpread={0.5}
            backgroundColor='--color-purple-500'
            backgroundOpacity={0.1}
        >
            <NeonText as='h5' className='h5-title' glowSpread={0.4}>
                {title}
            </NeonText>
            <ul className='flex max-md:flex-col items-normal justify-between gap-5 md:gap-2 lg:[&>li]:pr-5 lg:[&>li]:mr-5 [&>li]:flex [&>li]:flex-col lg:[&>li]:items-start [&>li]:gap-3 [&>li]:flex-1 w-full'>
                {children}
            </ul>
        </NeonBox>
    );

    return (
        <section className='mb-14 md:mb-16'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <AccountPageTitle
                    as='h2'
                    className='mb-6 md:mb-8  max-lg:text-center'
                >
                    Your statistics
                </AccountPageTitle>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <StatisticBox title='Friends statistics'>
                        {isLoadingStats ? (
                            <li className='flex items-center justify-center w-full py-8'>
                                <NeonIcon
                                    icon='svg-spinners:bars-rotate-fade'
                                    size={32}
                                />
                            </li>
                        ) : (
                            [
                                {
                                    icon: 'lucide:user',
                                    label: 'Friends invited',
                                    value: stats.totalInvited || 0,
                                },
                                {
                                    icon: 'lucide:check-circle',
                                    label: 'Friends qualified',
                                    value: stats.qualified || 0,
                                },
                            ].map((item, index) => (
                                <li
                                    className='flex flex-col items-center lg:items-start'
                                    key={index}
                                >
                                    <div className='flex items-center gap-3'>
                                        <Icon icon={item.icon} fontSize={24} />
                                        <span className='text-2xl font-bold'>
                                            {item.value}
                                        </span>
                                    </div>
                                    <span className='capitalize'>
                                        {item.label}
                                    </span>
                                </li>
                            ))
                        )}
                    </StatisticBox>
                    <StatisticBox title='Your rewards'>
                        {isLoadingStats ? (
                            <li className='flex items-center justify-center w-full py-8'>
                                <NeonIcon
                                    icon='svg-spinners:bars-rotate-fade'
                                    size={32}
                                />
                            </li>
                        ) : (
                            [
                                {
                                    image: '/coins/gold-coin.svg',
                                    label: 'Total rewards earned',
                                    value: stats.totalRewards || 0,
                                    subtext: '1,000 Gold Coins per qualified friend',
                                },
                            ].map((item, index) => (
                                <li
                                    className='flex flex-col items-center lg:items-start w-full'
                                    key={index}
                                >
                                    <div className='flex items-center gap-3'>
                                        <Image
                                            src={item.image}
                                            height={24}
                                            width={24}
                                            alt={item.label}
                                        />
                                        <span className='text-2xl font-bold'>
                                            {item.value}
                                        </span>
                                    </div>
                                    <span className='capitalize'>
                                        {item.label}
                                    </span>
                                    {item.subtext && (
                                        <span className='text-xs text-white/60 mt-1'>
                                            {item.subtext}
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </StatisticBox>
                </div>
            </div>
        </section>
    );
}
