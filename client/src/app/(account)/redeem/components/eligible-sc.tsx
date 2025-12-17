'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';
import AccountPageTitle from '../../profile/components/account-page-title';

export default function EligibleSC() {
    const { user } = useAuth();

    return (
        <section className='mb-12'>
            <AccountPageTitle className='max-lg:text-center max-lg:mb-8 mb-10'>
                Redeem SC
            </AccountPageTitle>
            <NeonBox
                glowColor='--color-green-500'
                glowSpread={0.5}
                backgroundColor='--color-green-500'
                backgroundOpacity={0.1}
                className='xxl:p-10 lg:p-8 md:p-6 px-4 py-6 rounded-lg flex max-md:flex-col items-center justify-between xl:gap-8 md:gap-6 gap-5 backdrop-blur-2xl'
            >
                <div className='flex flex-col md:items-start items-center'>
                    <NeonText
                        as='h4'
                        className='h4-title mb-4'
                        glowColor='--color-green-500'
                        glowSpread={0.4}
                    >
                        Balance
                    </NeonText>
                    <div className='inline-flex items-center gap-3 leading-none'>
                        <Image
                            src='/coins/sweep-coin.svg'
                            height={64}
                            width={64}
                            alt='SC Icon'
                            className='xl:w-[64px] lg:w-[52px] sm:w-[42px] w-[34px] aspect-square'
                        />
                        <span className='text-green-400 xs:text-h1-title text-h2-title font-extrabold!'>
                            {(user?.sweepCoins)}
                        </span>
                    </div>
                </div>
            </NeonBox>
        </section>
    );
}
