'use client';

import SliderWrapper from '@/components/slider-wrapper';
import { promotionsSliderData } from '@/data/promotions';
import Image from 'next/image';
import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';

export default function PromotionsSlider() {
    const router = useTransitionRouter();
    const { sm } = useBreakPoint();
    const swiperRef = useRef<SwiperType | null>(null);
    return (
        <section className='mb-20'>
            <SliderWrapper
                swiperSliderRef={swiperRef}
                icon={
                    <Image
                        src='/sections-icon/promotions.png'
                        height={100}
                        width={100}
                        alt='Promotions'
                        className='h-10 w-10'
                    />
                }
                color='--color-purple-500'
                title='Promotions'
                className='mb-5 max-sm:[&>.swiper-arrows]:hidden'
            >
                <div
                    className={`${sm && 'slider-right-overflow'} max-sm:overflow-hidden -mx-5 lg:-mx-8 max-sm:px-8 mb-8`}
                >
                    <Swiper
                        modules={[Autoplay]}
                        slidesPerView={1}
                        slidesPerGroup={1}
                        spaceBetween={16}
                        loop={true}
                        speed={1000}
                        autoplay={{
                            delay: 3000,
                        }}
                        onBeforeInit={swiper => {
                            swiperRef.current = swiper;
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 'auto',
                            },
                            1024: {
                                spaceBetween: 24,
                                slidesPerView: 'auto',
                            },
                            1536: {
                                spaceBetween: 40,
                                slidesPerView: 'auto',
                            },
                        }}
                        className='grid grid-flow-col sm:pl-8! overflow-visible! sm:w-[calc(100%+2vw)]'
                    >
                        {promotionsSliderData.map((banner, i) => {
                            const button = banner.button;
                            return (
                                <SwiperSlide
                                    key={i}
                                    className='py-4 sm:max-w-72 md:max-w-84 lg:max-w-90 xl:max-w-94 2xl:max-w-104'
                                >
                                    <NeonBox
                                        className={
                                            'rounded-2xl bg-cover bg-center bg-no-repeat relative h-[435px] sm:h-[500px] pt-6 pb-10'
                                        }
                                        glowColor={`--color-${banner.color}-500`}
                                        glowSpread={1}
                                        borderWidth={2}
                                        glowLayers={3}
                                        insetGlow
                                        style={{
                                            backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.images.background})`,
                                        }}
                                    >
                                        <div className='flex items-center flex-col text-center h-full'>
                                            <div className='w-[160px] sm:w-[180px] aspect-square mb-4'>
                                                <Image
                                                    src={banner.images.main}
                                                    alt={banner.title}
                                                    height={510}
                                                    width={510}
                                                    className='object-cover h-full w-full float-y-xs float-y-slow'
                                                />
                                            </div>

                                            <div className='flex flex-1 flex-col items-center max-w-[80%] '>
                                                {banner.title && (
                                                    <NeonText
                                                        glowColor={`--color-${banner.color}-500`}
                                                        as='h3'
                                                        className='h3-title mb-2'
                                                    >
                                                        {banner.title}
                                                    </NeonText>
                                                )}
                                                {banner.description && (
                                                    <p className='text-white font-extrabold text-base mb-4.5 line-clamp-2 sm:line-clamp-3'>
                                                        {banner.description}
                                                    </p>
                                                )}
                                            </div>

                                            {button && (
                                                <Button
                                                    size={sm ? 'lg' : 'md'}
                                                    onClick={() =>
                                                        router.push(button.href)
                                                    }
                                                >
                                                    {button.text}
                                                </Button>
                                            )}

                                            <div className='absolute top-6 right-6'>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <NeonIcon
                                                                icon={
                                                                    'lucide:info'
                                                                }
                                                                size={23}
                                                                glowColor={`--color-${banner.color}-500`}
                                                            />
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side='bottom'
                                                        align='center'
                                                        className=' text-white [&>ul]:space-y-2 [&>ul>li]:text-sm [&>ul>li]:font-bold [&>ul]:p-1'
                                                    >
                                                        <h6 className='text-base font-black mb-1'>
                                                            {
                                                                banner.tooltip
                                                                    ?.title
                                                            }
                                                        </h6>
                                                        {
                                                            banner.tooltip
                                                                ?.description
                                                        }
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </NeonBox>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
                <div className='flex items-center justify-center'>
                    <Button size='lg'>Join for Extra Promotions</Button>
                </div>
            </SliderWrapper>
        </section>
    );
}
