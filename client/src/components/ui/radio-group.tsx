'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';
import NeonBox from '../neon/neon-box';

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot='radio-group'
            className={cn('grid gap-3', className)}
            {...props}
        />
    );
}

function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot='radio-group-item'
            asChild
            {...props}
        >
            <NeonBox
                glowSpread={0.6}
                className={cn(
                    'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary aria-invalid:ring-destructive/20  aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-current',
                    className
                )}
            >
                <RadioGroupPrimitive.Indicator className=''>
                    <svg
                        width='6'
                        height='6'
                        viewBox='0 0 6 6'
                        fill='currentcolor'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <circle cx='3' cy='3' r='3' />
                    </svg>
                </RadioGroupPrimitive.Indicator>
            </NeonBox>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
