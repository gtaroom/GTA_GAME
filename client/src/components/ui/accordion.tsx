'use client';

import NeonIcon from '@/components/neon/neon-icon';
import { cn } from '@/lib/utils';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import * as React from 'react';
import NeonBox from '../neon/neon-box';

function NeonBoxWrapper({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <NeonBox
            className='transition-all rounded-md backdrop-blur-2xl'
            backgroundColor='--color-purple-500'
            backgroundOpacity={0.1}
            glowSpread={0.8}
            {...props}
        >
            {children}
        </NeonBox>
    );
}

function Accordion({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return (
        <div className={cn('space-y-5', className)}>
            <AccordionPrimitive.Root data-slot='accordion' {...props} />
        </div>
    );
}

function AccordionItem({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <NeonBoxWrapper className={cn('w-full', className)}>
            <AccordionPrimitive.Item data-slot='accordion-item' {...props} />
        </NeonBoxWrapper>
    );
}

function AccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className='flex'>
            <AccordionPrimitive.Trigger
                data-slot='accordion-trigger'
                className={cn(
                    'group flex w-full items-center justify-between max-sm:px-4 max-sm:py-3! sm:px-5 sm:py-4! focus:outline-none',
                    className
                )}
                {...props}
            >
                <span className='select-none font-bold text-base text-white text-left'>
                    {children}
                </span>
                <NeonIcon
                    icon='lucide:chevron-down'
                    size={24}
                    className='ml-4 pointer-events-none shrink-0 opacity-70 neon-glow transition-transform duration-200 group-data-[state=open]:rotate-180'
                />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot='accordion-content'
            className={cn(
                'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden  transition-all duration-200 px-4 pb-5 -mt-2',
                className
            )}
            {...props}
        >
            <div className='text-base text-white/80'>{children}</div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
