import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none transition-[background-color,color,box-shadow] [&>svg]:shrink-0 leading-none text-white tracking-common',
    {
        variants: {
            variant: {
                default: 'bg-neutral-800 text-white',
                'free-to-play': 'bg-gradient-to-t from-green-600 to-green-500',
                popular: 'bg-gradient-to-t from-sky-600 to-sky-500',
                'top-pick': 'bg-gradient-to-t from-orange-600 to-orange-500',
                'bonus-available':
                    'bg-gradient-to-t from-yellow-600 to-yellow-500',
                new: 'bg-gradient-to-t from-purple-600 to-purple-500',
                'fan-favorite':
                    'bg-gradient-to-t from-fuchsia-600 to-fuchsia-500',
                'limited-time': 'bg-gradient-to-t from-red-600 to-red-500',

                // transaction badges
                'gc-purchased': 'bg-yellow-300/20 text-yellow-400',
                'sc-redeemed': 'bg-green-300/20 text-green-400',
                'redemption-paid': 'bg-lime-300/20 text-lime-400',
                'coupon-redeemed': 'bg-purple-300/20 text-purple-400',
                pending: 'bg-orange-300/20 text-orange-400',
                completed: 'bg-green-300/20 text-green-400',
                failed: 'bg-red-300/20 text-red-400',
                cancelled: 'bg-gray-300/20 text-gray-400',
            },
            type: {
                normal: 'border font-black uppercase focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-[4px] border-white',
                transaction: 'uppercase font-bold rounded-sm backdrop-blur-2xl',
            },
            size: {
                sm: 'h-6 px-1.25 text-xs',
                md: 'h-8 px-2.5 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            type: 'normal',
            size: 'sm',
        },
    }
);

// Auto-labels for each variant
const BADGE_LABEL: Record<
    NonNullable<VariantProps<typeof badgeVariants>['variant']>,
    string
> = {
    default: 'Badge',
    'free-to-play': 'Free To Play',
    popular: 'Popular',
    'top-pick': 'Top Pick',
    'bonus-available': 'Bonus Available',
    new: 'New',
    'fan-favorite': 'Fan Favorite',
    'limited-time': 'Limited Time',

    // transaction badges
    'gc-purchased': 'GC Purchased',
    'sc-redeemed': 'SC Redeemed',
    'redemption-paid': 'Redemption Paid',
    'coupon-redeemed': 'Coupon Redeemed',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled'
};

function Badge({
    className,
    type,
    size,
    variant = 'default',
    asChild = false,
    children,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean;
        type?: 'normal' | 'transaction';
        size?: 'sm' | 'md';
    }) {
    const Comp = asChild ? Slot.Root : 'span';
    const fallbackText =
        (variant && BADGE_LABEL[variant]) ?? BADGE_LABEL.default;

    return (
        <Comp
            data-slot='badge'
            aria-label={fallbackText}
            className={cn(badgeVariants({ variant, type, size }), className)}
            {...props}
        >
            {children ?? fallbackText}
        </Comp>
    );
}

export { Badge, badgeVariants };
