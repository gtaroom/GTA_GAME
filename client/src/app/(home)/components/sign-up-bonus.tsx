'use client';
import GameCard from '@/components/game-card';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { gamesData } from '@/data/games';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';

const SignUpBonus = () => {
    const { md } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <section className='pb-16 sm:pb-20 md:pb-25'>
            <div className='container-xl'>
                <div className='grid lg:grid-cols-2 items-center gap-8 sm:gap-11 max-lg:justify-center'>
                    <div className="relative max-lg:max-w-[800px] grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:gap-6 max-sm:-mx-5 p-5 before:absolute before:inset-y-0 before:left-0 before:z-[2] before:w-[93px] before:bg-gradient-to-r before:from-[#310A47] before:to-transparent before:content-[''] after:absolute after:inset-y-0 after:right-0 after:z-[2] after:w-[93px] after:bg-gradient-to-r after:from-transparent after:to-[#310A47] after:content-['']">
                        {gamesData.map(
                            (game, index) =>
                                index < 6 && (
                                    <GameCard
                                        key={index}
                                        game={game}
                                        playable={false}
                                    />
                                )
                        )}
                    </div>
                    <div className='flex flex-col items-start lg:items-start max-lg:max-w-[700px] max-lg:mx-auto max-lg:text-center'>
                        <NeonText as='h2' className='h1-title mb-6'>
                            Sign up to claim your welcome bonus
                        </NeonText>

                        <ButtonGroup className='gap-4 sm:gap-6 flex-wrap max-lg:justify-center max-lg:w-full'>
                            <Button
                                size={md ? 'xl' : 'lg'}
                                className={`${md ? 'min-w-[180px]' : 'min-w-[140px]'}`}
                                onClick={() => router.push('/register')}
                            >
                                Play Now
                            </Button>
                            <Button
                                variant='secondary'
                                size={md ? 'xl' : 'lg'}
                                className={`${md ? 'min-w-[180px]' : 'min-w-[140px]'}`}
                                onClick={() => router.push('/about-us')}
                            >
                                Learn More
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUpBonus;
