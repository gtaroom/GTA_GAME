'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';

export default function VIPSection() {
    const router = useTransitionRouter();

    interface VipFeaturesProps {
        icon: string;
        title: string;
        color: string;
    }

    const vipFeatures: VipFeaturesProps[] = [
        {
            icon: 'lucide:ferris-wheel',
            title: '3-Tier Fortune Wheel',
            color: '--color-fuchsia-500',
        },
        {
            icon: 'lucide:crown',
            title: 'VIP Manager Access',
            color: '--color-yellow-500',
        },
        {
            icon: 'lucide:calendar',
            title: 'Weekly & Level-Up Rewards',
            color: '--color-blue-500',
        },
        {
            icon: 'lucide:gift',
            title: 'Special Rewards',
            color: '--color-green-500',
        },
    ];

    return (
        <section className='mb-20'>
            <div className='container-xxl'>
                <NeonBox className='rounded-3xl bg-[url("/home-page-logged-in/vip-section-bg.jpg")] bg-cover bg-center bg-no-repeat max-sm:p-6 sm:p-10 lg:pl-[40px] xl:pl-[60px] xl:pr-[30px] 2xl:px-[80px] py-[48px] flex items-center justify-between gap-8 max-lg:flex-col-reverse'>
                    <div className='flex flex-col items-start w-full lg:max-w-[52%]! max-lg:text-center md:max-w-[800px] md:mx-auto'>
                        <NeonText as='h2' className='h2-title sm:h1-title mb-6'>
                            Unlock VIP Rewards & Level Up Your Spin!
                        </NeonText>
                        <ul className='mb-8 grid md:grid-cols-2 md:gap-x-[30px] lg:gap-x-[30px] xl:gap-x-[50px] gap-y-[20px] max-lg:mx-auto'>
                            {vipFeatures.map((feature, index) => (
                                <li
                                    key={index}
                                    className='inline-flex items-start gap-3 text-left max-md:justify-center max-md:text-center'
                                >
                                    <NeonIcon
                                        icon={feature.icon}
                                        size={26}
                                        glowColor={feature.color}
                                    />
                                    <NeonText
                                        as='span'
                                        glowColor={feature.color}
                                        glowSpread={0.2}
                                        className='text-base sm:text-xl font-bold capitalize'
                                    >
                                        {feature.title}
                                    </NeonText>
                                </li>
                            ))}
                        </ul>
                        <NeonBox
                            glowColor='--color-pink-500'
                            backgroundColor='--color-pink-500'
                            backgroundOpacity={0.2}
                            className='px-[20px] sm:px-[36px] py-[12px] rounded-[8px] mb-[30px] sm:mb-[42px] max-lg:mx-auto'
                        >
                            <NeonText
                                as='span'
                                glowColor='--color-pink-500'
                                glowSpread={0.4}
                                className='text-base sm:text-xl font-bold uppercase'
                            >
                                Current Level: Iron 🚀 Progress to Bronze
                            </NeonText>
                        </NeonBox>
                        <Button
                            size='xl'
                            className='max-lg:mx-auto'
                            onClick={() => router.push('/vip-program')}
                        >
                            Play to Level Up
                        </Button>
                    </div>

                    <Image
                        src='/home-page-logged-in/vip-section-img.png'
                        alt='VIP Section'
                        height={500}
                        width={500}
                        className='float-y float-y-fast float-y-sm h-[250px] sm:h-[300px] md:h-[400px] lg:h-[360px] xl:h-[420px] 2xl:h-[460px] aspect-square w-auto basis-auto'
                    />
                </NeonBox>
            </div>
        </section>
    );
}
