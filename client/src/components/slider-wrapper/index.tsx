'use client';
import { Icon } from '@iconify/react';
import { Swiper as SwiperInstance } from 'swiper';

import { cn } from '@/lib/utils';
import SecTitle from '../sec-title';
import { Button } from '../ui/button';
import ButtonGroup from '../ui/button-group';

export default function SliderWrapper({
    children,
    title,
    color,
    icon,
    className,
    swiperSliderRef,
}: {
    children: React.ReactNode;
    title: string;
    color: string;
    icon?: React.ReactNode;
    className?: string;
    swiperSliderRef?: React.RefObject<SwiperInstance | null>;
}) {
    return (
        <>
            <div className={cn('flex items-center justify-between', className)}>
                <SecTitle icon={icon} color={color}>
                    {title}
                </SecTitle>
                <ButtonGroup className='swiper-arrows gap-4'>
                    <Button
                        icon
                        size='lg'
                        onClick={() => {
                            swiperSliderRef?.current?.slidePrev();
                        }}
                    >
                        <Icon icon='lucide:chevron-left' className='size-6' />
                    </Button>
                    <Button
                        icon
                        variant='secondary'
                        size='lg'
                        onClick={() => {
                            swiperSliderRef?.current?.slideNext();
                        }}
                    >
                        <Icon icon='lucide:chevron-right' className='size-6' />
                    </Button>
                </ButtonGroup>
            </div>
            {children}
        </>
    );
}
