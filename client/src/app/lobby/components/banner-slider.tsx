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
            process.env.NEXT_PUBLIC_API_URL || 'https://gtoarcade.com';
        const cleanBase = baseUrl
            .replace('/v1', '')
            .replace('/api', '')
            .replace(/\/$/, '');

        let cleanPath = dbPath.startsWith('/') ? dbPath : `/${dbPath}`;
        if (!cleanPath.startsWith('/uploads')) {
            cleanPath = `/uploads${cleanPath}`;
        }

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
                className='home-banner-slider'
            >
                {banners.map(banner => (
                    <SwiperSlide
                        key={banner._id}
                        className='py-10 w-full sm:max-w-150'
                    >
                        <NeonBox
                            className='rounded-2xl bg-cover bg-center flex items-center justify-between h-[320px] relative'
                            glowColor='--color-purple-500'
                            style={{
                                backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2)), url('${getImageUrl(banner.images.background)}')`,
                            }}
                        >
                            <div className='flex flex-col flex-1 items-start py-3 max-w-[320px] pl-10'>
                                {/* 1. SHOW UID (Useful for editing) */}
                                <span className='text-[10px] text-white/40 mb-1 font-mono'>
                                    ID: {banner._id}
                                </span>

                                {banner.title && (
                                    <NeonText
                                        as='h3'
                                        className='h4-title mb-2 line-clamp-2'
                                    >
                                        {banner.title}
                                    </NeonText>
                                )}

                                {banner.description && (
                                    <p className='text-white/80 text-sm mb-4 line-clamp-2'>
                                        {banner.description}
                                    </p>
                                )}

                                {/* 2. FIX BUTTON & URL DISPLAY */}
                                <Button
                                    size={sm ? 'md' : 'xs'}
                                    onClick={() =>
                                        router.push(banner.button?.href || '#')
                                    }
                                >
                                    {/* Fallback to 'Learn More' if text is missing */}
                                    {banner.button?.text || 'Learn More'}
                                </Button>

                                {/* 3. SHOW URL FOR DEBUGGING (Optional - remove for production) */}
                                <span className='text-[9px] text-white/30 mt-2'>
                                    Link: {banner.button?.href || 'No Link Set'}
                                </span>
                            </div>

                            <div className='h-full w-[45%] relative'>
                                <Image
                                    src={getImageUrl(banner.images.main)}
                                    alt={banner.title}
                                    fill
                                    unoptimized
                                    className='object-contain'
                                />
                            </div>
                        </NeonBox>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
