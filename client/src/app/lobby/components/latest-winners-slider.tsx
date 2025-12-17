'use client';

import SliderWrapper from '@/components/slider-wrapper';
import { latestWinnersData } from '@/data/latest-winners';
import Image from 'next/image';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import NeonBox from '@/components/neon/neon-box';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

export default function LatestWinnersSlider() {
    const { sm } = useBreakPoint();
    const swiperRef = useRef<SwiperType | null>(null);
    return (
        <section className='mb-8'>
            <SliderWrapper
                swiperSliderRef={swiperRef}
                icon={
                    <Image
                        src='/sections-icon/latest-winners.png'
                        height={100}
                        width={100}
                        alt='Latest Winners'
                        className='h-10 w-10'
                    />
                }
                color='--color-yellow-500'
                title='Latest Winners'
                className='mb-5 max-sm:[&>.swiper-arrows]:hidden'
            >
                <div
                    className={`-mx-5 lg:-mx-8 max-sm:px-8  max-sm:overflow-hidden ${sm && 'slider-right-overflow'}`}
                >
                    <Swiper
                        modules={[Autoplay]}
                        slidesPerView='auto'
                        spaceBetween={16}
                        loop={true}
                        speed={1000}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        onBeforeInit={swiper => {
                            swiperRef.current = swiper;
                        }}
                        breakpoints={{
                            1024: {
                                spaceBetween: 24,
                            },
                        }}
                        className='px-3! sm:pl-8! overflow-visible! sm:w-[calc(100%+2vw)] '
                    >
                        {latestWinnersData.map((winners, i) => {
                            return (
                                <SwiperSlide
                                    key={i}
                                    className='pt-4 max-sm:max-w-40 sm:max-w-44 lg:max-w-50'
                                >
                                    <NeonBox
                                        className={
                                            'rounded-lg relative overflow-hidden h-full aspect-[1/1.1] mb-4'
                                        }
                                        glowColor={`--color-${winners.color}-500`}
                                        glowSpread={1}
                                        borderWidth={2}
                                        glowLayers={3}
                                        insetGlow
                                    >
                                        <Image
                                            src={winners.thumbnail}
                                            alt={winners.title}
                                            height={510}
                                            width={510}
                                            className='object-cover object-center h-full w-full'
                                        />
                                    </NeonBox>
                                    <div className='flex flex-col items-start'>
                                        <span className='text-base font-extrabold mb-1'>
                                            {winners.userName}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-lg font-black inline-flex gap-1',
                                                winners.coinType ===
                                                    'sweep-coin'
                                                    ? 'text-green-400'
                                                    : winners.coinType ===
                                                        'gold-coin'
                                                      ? 'text-yellow-300'
                                                      : ''
                                            )}
                                        >
                                            <Image
                                                src={
                                                    winners.coinType ===
                                                    'sweep-coin'
                                                        ? '/coins/sweep-coin.svg'
                                                        : '/coins/gold-coin.svg'
                                                }
                                                height={20}
                                                width={20}
                                                alt={
                                                    winners.coinType ===
                                                    'sweep-coin'
                                                        ? 'sweep-coin'
                                                        : 'gold-coin'
                                                }
                                            />{' '}
                                            +{winners.winAmmount}{' '}
                                        </span>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </SliderWrapper>
        </section>
    );
}
