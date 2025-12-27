'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';

import { getBanners, type Banner } from '@/lib/api/banner';

export default function BannerSlider() {
    const router = useTransitionRouter();
    const { sm } = useBreakPoint();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadBanners() {
            try {
                const response = await getBanners();
                const data = Array.isArray(response)
                    ? response
                    : (response as any)?.data || [];
                setBanners(data);
            } catch (error) {
                console.error('Error loading banners:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadBanners();
    }, []);

    const getImageUrl = (dbPath: string) => {
        if (!dbPath) return '';
        if (dbPath.startsWith('http')) return dbPath;

        const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const cleanBase = baseUrl
            .replace('/v1', '')
            .replace('/api', '')
            .replace(/\/$/, '');

        const cleanPath = dbPath.startsWith('/') ? dbPath : `/${dbPath}`;
        return `${cleanBase}${cleanPath}`;
    };

    if (isLoading)
        return (
            <div className='h-[320px] bg-white/5 animate-pulse rounded-2xl mb-8' />
        );
    if (banners.length === 0) return null;

    return (
        <section
            className={`-mt-4 mb-8 -mx-5 lg:-mx-8 max-sm:overflow-hidden sm:pl-8 ${sm && 'slider-right-overflow'} relative z-[1]`}
        >
            <Swiper
                modules={[Autoplay, Pagination]}
                slidesPerView={1}
                slidesPerGroup={1}
                spaceBetween={16}
                loop={banners.length > 1}
                speed={2000}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                breakpoints={{
                    640: { slidesPerView: 'auto' },
                    1024: { spaceBetween: 24, slidesPerView: 'auto' },
                    1536: { spaceBetween: 40, slidesPerView: 'auto' },
                }}
                className='home-banner-slider max-sm:px-8! sm:overflow-visible! max-sm:max-w-full max-sm:[&>.swiper-pagination]:w-full!'
            >
                {banners.map(banner => (
                    <SwiperSlide
                        key={banner._id}
                        className='py-10 w-full max-w-none sm:max-w-120 md:max-w-144 lg:max-w-150 2xl:max-w-175'
                    >
                        <NeonBox
                            className='rounded-2xl bg-cover bg-center bg-no-repeat flex items-center justify-between max-md:h-[280px] md:h-[280px] lg:h-[320px] relative'
                            glowColor='--color-purple-500'
                            style={{
                                backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${getImageUrl(banner.images.background)}')`,
                            }}
                        >
                            <div className='flex flex-col flex-1 items-start py-3 max-w-[320px] max-sm:pl-5 max-lg:pl-6 lg:pl-8 xl:pl-10'>
                                {banner.title && (
                                    <NeonText
                                        as='h3'
                                        className='h4-title mb-2 line-clamp-3'
                                    >
                                        {banner.title}
                                    </NeonText>
                                )}
                                {banner.description && (
                                    <p className='text-white font-extrabold max-sm:text-sm text-base mb-4.5 line-clamp-2'>
                                        {banner.description}
                                    </p>
                                )}
                                {banner.button && (
                                    <Button
                                        size={sm ? 'md' : 'xs'}
                                        onClick={() =>
                                            router.push(banner.button.href)
                                        }
                                    >
                                        {banner.button.text}
                                    </Button>
                                )}
                            </div>

                            <div className='aspect-square flex-0 shrink-0 basis-auto h-full max-sm:w-[47%] sm:-mt-[40px]'>
                                <Image
                                    src={getImageUrl(banner.images.main)}
                                    alt={banner.title}
                                    height={510}
                                    width={510}
                                    unoptimized
                                    className='w-full object-cover sm:float-y-xs transition-all duration-600'
                                />
                            </div>

                            {banner.images.cover && (
                                <div className='absolute w-full z-[2] flex justify-end pointer-events-none transition-all duration-600 lg:right-0 lg:h-full xl:-right-2 max-sm:h-[60%]'>
                                    <Image
                                        src={getImageUrl(banner.images.cover)}
                                        alt={banner.title}
                                        height={800}
                                        width={800}
                                        unoptimized
                                        className='h-full w-auto float-y-sm'
                                    />
                                </div>
                            )}
                        </NeonBox>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
