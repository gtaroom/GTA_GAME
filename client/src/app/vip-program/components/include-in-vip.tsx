'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';
export default function IncludeInVIP() {
    interface VipProgramFeaturesProps {
        img: string;
        title: string;
        color: string;
    }

    const vipProgramFeatures: VipProgramFeaturesProps[] = [
        {
            img: '/vip-program/features/1.png',
            title: 'Fortune Wheel',
            color: 'red',
        },
        {
            img: '/vip-program/features/2.png',
            title: ' Level Up Reward',
            color: 'green',
        },
        // {
        //     img: '/vip-program/features/3.png',
        //     title: 'Weekly Reward',
        //     color: 'lime',
        // },
        {
            img: '/vip-program/features/4.png',
            title: 'Personal Manager',
            color: 'amber',
        },
    ];
    const { sm, md, lg } = useBreakPoint();
    return (
        <section className='mb-20'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title text-center mb-8'>
                    What’s Included in VIP?
                </NeonText>
                <div
                    className={`row max-sm:gap-y-6 ${sm && 'row-gap-16'} ${md && 'row-gap-24'} ${lg && 'row-gap-32'}`}
                >
                    {vipProgramFeatures.map((feature, index) => (
                        <div className='sm:col-6 lg:col-3' key={index}>
                            <NeonBox
                                className='p-5 rounded-2xl backdrop-blur-sm h-full'
                                glowColor={`--color-${feature.color}-500`}
                                backgroundColor={`--color-${feature.color}-500`}
                                backgroundOpacity={0.2}
                                glowSpread={0.8}
                            >
                                <div className='flex flex-col items-center text-center max-w-[90%] mx-auto'>
                                    <Image
                                        src={feature.img}
                                        alt={feature.title}
                                        width={300}
                                        height={300}
                                        className='max-sm:w-[110px] sm:w-[180px] lg:w-[120px] xl:w-[140px] xxl:w-[180px] aspect-square mb-4'
                                    />
                                    <NeonText
                                        as='h4'
                                        className='h4-title'
                                        glowColor={`--color-${feature.color}-500`}
                                    >
                                        {feature.title}
                                    </NeonText>
                                </div>
                            </NeonBox>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
