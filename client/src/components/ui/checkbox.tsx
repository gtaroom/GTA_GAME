'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import NeonBox from '@/components/neon/neon-box';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

export const checkboxVariants = cva(
    [
        'relative',
        'peer border-white data-[state=checked]:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        'shrink-0 rounded-[4px] border-2 outline-none focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
    {
        variants: {
            size: {
                sm: 'size-4',
                md: 'size-[18px]',
                lg: 'size-5',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

const indicatorIconVariants = cva('size-3.5', {
    variants: {
        size: {
            sm: 'size-3',
            md: 'size-3.5',
            lg: 'size-4',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

/* ---------- Types ---------- */

export interface CheckboxProps
    extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
        VariantProps<typeof checkboxVariants>,
        NeonBoxPublicProps {
    /** Optional extra class for the neon overlay layer */
    neonClassName?: string;
}

/* ---------- Component ---------- */

function Checkbox({
    className,
    size,
    neon = true,
    neonClassName,

    // Neon props (forwarded to overlay)
    glowColor = NEON_BOX_DEFAULTS.glowColor,
    intensity = NEON_BOX_DEFAULTS.intensity,
    glowLayers = NEON_BOX_DEFAULTS.glowLayers,
    glowSpread = NEON_BOX_DEFAULTS.glowSpread,
    borderColor = NEON_BOX_DEFAULTS.borderColor,
    borderWidth = 0, 
    insetGlow = NEON_BOX_DEFAULTS.insetGlow,
    backgroundColor = NEON_BOX_DEFAULTS.backgroundColor,
    backgroundOpacity = NEON_BOX_DEFAULTS.backgroundOpacity,

    ...props
}: CheckboxProps) {
    return (
        <CheckboxPrimitive.Root
            data-slot='checkbox'
            className={cn(checkboxVariants({ size }), className)}
            {...props}
        >
            {neon && (
                <NeonBox
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute inset-0 rounded-[inherit]',
                        neonClassName
                    )}
                    glowColor={glowColor}
                    intensity={intensity}
                    glowLayers={glowLayers}
                    glowSpread={glowSpread}
                    borderColor={borderColor}
                    borderWidth={borderWidth}
                    insetGlow={insetGlow}
                    backgroundColor={backgroundColor}
                    backgroundOpacity={backgroundOpacity}
                />
            )}

            <CheckboxPrimitive.Indicator
                data-slot='checkbox-indicator'
                className='p-0. relative z-10 flex items-center justify-center text-current transition-none'
            >
                <CheckIcon className={indicatorIconVariants({ size })} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
