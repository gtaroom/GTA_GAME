'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { removeDefaultStyleProps } from '@/types/global.type';

function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot='tabs'
            className={cn('flex flex-col', className)}
            {...props}
        />
    );
}

function TabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot='tabs-list'
            className={cn(
                'inline-flex w-fit items-center justify-center rounded-md',
                className
            )}
            {...props}
        />
    );
}

function TabsTrigger({
    className,
    removeDefaultStyle,
    ...props
}: removeDefaultStyleProps &
    React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot='tabs-trigger'
            className={cn(
                !removeDefaultStyle &&
                    'data-[state=active]:from-btn-primary-top data-[state=active]:to-btn-primary-bottom data-[state=active]:text-btn-text select-none focus-visible:border-ring focus-visible:ring-ring/50 tracking-common inline-flex cursor-pointer items-center justify-center rounded-sm px-3.5 py-1.25 text-base font-black whitespace-nowrap uppercase outline-none hover:bg-white/10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-t data-[state=active]:shadow-xs [&_svg]:shrink-0',
                className
            )}
            {...props}
        />
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot='tabs-content'
            className={cn('flex-1 outline-none', className)}
            {...props}
        />
    );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
