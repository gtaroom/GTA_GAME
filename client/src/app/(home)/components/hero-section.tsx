'use client';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';

import { useTransitionRouter } from 'next-transition-router';
const HeroSection = () => {
    const { md } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <section className='pt-15 pb-18 sm:pt-20 sm:pb-[115px]'>
            <div className='container-xl relative z-[1]'>
                <div className='text-center'>
                    {/* Hero Section Title */}
                    <h1 className='mb-5 flex flex-col items-center'>
                        <NeonText
                            as='span'
                            className='display-1'
                            glowColor='--color-pink-400'
                        >
                            PLAY FOR FREE
                        </NeonText>
                        <NeonText
                            as='span'
                            className='display-1'
                            glowColor='--color-yellow-500'
                        >
                            UNLOCK REWARDS
                        </NeonText>
                    </h1>

                    {/* Hero Section Description */}
                    <p className='mx-auto mb-7.5 max-w-[1000px] text-2xl sm:text-3xl'>
                        Experience exciting arcade-style games no purchase
                        required.
                    </p>

                    {/* Hero Section Action Button */}
                    <ButtonGroup className='sm:mb-[50px] mb-8 gap-4 sm:gap-7.5 flex-wrap'>
                        <Button
                            variant='secondary'
                            size={md ? 'xl' : 'lg'}
                            className={`${md ? 'w-[240px]' : 'w-[180px]'}`}
                            onClick={() => router.push('/register')}
                        >
                            Start Playing Free
                        </Button>
                        <Button
                            size={md ? 'xl' : 'lg'}
                            className={`${md ? 'w-[240px]' : 'w-[180px]'}`}
                            onClick={() => router.push('/buy-coins')}
                        >
                            Buy Gold Coins
                        </Button>
                    </ButtonGroup>

                    {/* Hero Section Bottom Text */}
                    <div className='inline-flex flex-wrap items-center justify-center gap-3.5 [&>span]:font-bold [&>span]:uppercase'>
                        <NeonText
                            as='span'
                            className='h3-title'
                            glowColor='--color-blue-500'
                        >
                         Play Games
                        </NeonText>
                        <NeonText
                            as='span'
                            className='h3-title'
                            glowColor='--color-blue-500'
                        >
                            No Purchase Needed to Play
                        </NeonText>
                        <NeonText
                            as='span'
                            className='h3-title'
                            glowColor='--color-red-500'
                        >
                            JUST FUN.
                        </NeonText>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
