'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from '@/rootnode_modules/next-transition-router/dist';
import Image from 'next/image';

export default function ChooseGameTypes() {
    const { lg, md } = useBreakPoint();
    const router = useTransitionRouter();
    const gameCategories = [
        {
            key: 'bonus',
            image: '/how-its-work/game-types/bonus-game.png',
            title: 'Bonus Games',
            features: [
                'Free-To-Play',
                'Gold Coins Only',
                'Great For Casual Fun',
            ],
            button: {
                text: 'Explore Bonus Games',
                href: '/game-listing?tab=bonus',
            },
            color: '--color-orange-500',
        },
        {
            key: 'exclusive',
            image: '/how-its-work/game-types/exclusive-game.png',
            title: 'Exclusive Games',
            description:
                'Explore Full Platforms Featuring A Variety Of Slot-Style And Arcade Games For Nonstop Entertainment.',
            features: [
                'Playable With Gold Coins Or Eligible Sweep Coins',
                'May Launch In A Separate Tab For Best Experience',
                'Designed For Use With Gold Coins',
                'Designed For Use With Gold Coins Purchased For Entertainment',
            ],
            button: {
                text: 'Explore Exclusive Games',
                href: '/game-listing?tab=exclusive',
            },
            color: '--color-purple-500',
        },
        {
            key: 'signature',
            image: '/how-its-work/game-types/signature-game.png',
            title: 'Signature Games',
            description:
                'Play Premium Games Designed To Maximize Fun, Features, And Engagement Only Available On GTOA.',
            features: [
                'Built For Reward-Driven Play',
                'Full Of Features, Bonuses, And Surprises',
                'Playable With Gold Coins Or Eligible Sweeps Coins',
                'Perfect For VIP Progress & Bonus Events',
            ],
            button: {
                text: 'Explore Signature Games',
                href: '/game-listing?tab=signature',
            },
            color: '--color-cyan-500',
        },
    ];
    return (
        <section className='mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Three Game Types to Choose From
                </NeonText>
                <div className='grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-10 justify-center'>
                    {gameCategories.map(category => (
                        <NeonBox
                            key={category.key}
                            glowColor={category.color}
                            backgroundColor={category.color}
                            backgroundOpacity={0.1}
                            className='p-6 lg:p-10 md:p-8 rounded-2xl backdrop-blur-2xl flex flex-col items-center'
                        >
                            <div className='relative'>
                                <Image
                                    src={category.image}
                                    height={250}
                                    width={250}
                                    alt={category.title}
                                    className='mb-4 lg:mb-6 w-[120px] md:w-[140px] aspect-square'
                                />
                                <div
                                    className='absolute left-1/2 top-1/2 aspect-square w-[100px] rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-2xl'
                                    style={{
                                        backgroundColor: `var(${category.color})`,
                                    }}
                                ></div>
                            </div>

                            <div className='text-center mb-4 md:mb-6'>
                                <NeonText
                                    as='h4'
                                    className='h4-title mb-3 text-center'
                                    glowColor={category.color}
                                >
                                    {category.title}
                                </NeonText>

                                <NeonText
                                    as='p'
                                    className='text-base font-bold mb-3 leading-6.5'
                                    glowColor={category.color}
                                    glowSpread={0.4}
                                >
                                    {category.description}
                                </NeonText>
                            </div>

                            <ul className='space-y-3 mb-6 lg:mb-10 w-full'>
                                {category.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className='flex items-start gap-3'
                                    >
                                        <NeonIcon
                                            icon='lucide:circle-check'
                                            size={md ? 26 : 20}
                                            glowColor={category.color}
                                        />
                                        <NeonText
                                            as='p'
                                            className='text-base md:text-lg font-bold mb-0 md:mb-3'
                                            glowColor={category.color}
                                            glowSpread={0.4}
                                        >
                                            {feature}
                                        </NeonText>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => router.push(category.button.href)}
                                className='mt-auto w-full md:w-auto'
                                size={md ? 'lg' : 'md'}
                            >
                                {category.button.text}
                            </Button>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}
