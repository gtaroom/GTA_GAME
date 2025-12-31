'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import NeonBox from '@/components/neon/neon-box';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

const buttonVariants = cva(
    'relative cursor-pointer select-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-black text-btn-text transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none outline-none',
    {
        variants: {
            variant: {
                primary:
                    'bg-gradient-to-t from-btn-primary-top to-btn-primary-bottom border-btn-primary-border border-[5px] rounded-[10px] shadow-btn-primary',
                secondary:
                    'bg-gradient-to-t from-btn-secondary-top to-btn-secondary-bottom border-btn-secondary-border border-[5px] rounded-[10px] shadow-btn-secondary',
                neon: 'bg-transparent border-unset rounded-unset text-white font-bold backdrop-blur-xl',
            },
            size: {
                xs: 'h-el-xs px-3 text-xs',
                sm: 'h-el-sm px-4 text-sm',
                md: 'h-el-md px-5 text-sm lg:text-base',
                lg: 'h-el-lg px-6 text-base lg:text-lg',
                xl: 'h-el-xl px-8 text-lg lg:text-xl',
                icon: 'h-el-md aspect-square p-0',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'sm',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants>,
        NeonBoxPublicProps {
    asChild?: boolean;
    neonBoxClass?: string;
    btnInnerClass?: string;
    animate?: boolean;
    icon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size,
            asChild,
            neon = false,
            neonBoxClass,
            btnInnerClass,
            glowColor = NEON_BOX_DEFAULTS.glowColor,
            intensity = NEON_BOX_DEFAULTS.intensity,
            glowLayers = NEON_BOX_DEFAULTS.glowLayers,
            glowSpread = NEON_BOX_DEFAULTS.glowSpread,
            borderColor = NEON_BOX_DEFAULTS.borderColor,
            borderWidth = NEON_BOX_DEFAULTS.borderWidth,
            insetGlow = NEON_BOX_DEFAULTS.insetGlow,
            backgroundColor = NEON_BOX_DEFAULTS.backgroundColor,
            backgroundOpacity = NEON_BOX_DEFAULTS.backgroundOpacity,
            animate = false,
            icon = false,
            children,
            ...props
        },
        ref
    ) => {
        const [isHovered, setHovered] = React.useState(false);
        const Comp = asChild ? Slot : ('button' as any);

        const shouldAnimate =
            animate || variant === 'primary' || variant === 'secondary';
        const animCls = shouldAnimate ? 'scale-effect' : '';

        const effectiveBackgroundOpacity = isHovered
            ? (backgroundOpacity ?? 0) + 0.1
            : backgroundOpacity;

        const getIconClasses = (size: string | undefined) => {
            if (!icon) return '';

            switch (size) {
                case 'sm':
                    return 'h-el-sm';
                case 'md':
                    return 'h-el-md';
                case 'lg':
                    return 'h-el-lg';
                case 'xl':
                    return 'h-el-xl';
                case 'icon':
                default:
                    return 'h-el-md';
            }
        };

        const iconClasses = getIconClasses(size ?? undefined);

        // When asChild is true, we should pass children directly without wrapping
        if (asChild) {
            return (
                <Comp
                    ref={ref}
                    className={cn(
                        buttonVariants({ variant, size: icon ? 'icon' : size }),
                        animCls,
                        icon && iconClasses,
                        icon && 'gap-0',
                        className
                    )}
                    {...props}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {children}
                </Comp>
            );
        }

        return (
            <Comp
                ref={ref}
                className={cn(
                    buttonVariants({ variant, size: icon ? 'icon' : size }),
                    animCls,
                    icon && iconClasses,
                    icon && 'gap-0',
                    className
                )}
                {...props}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {neon && (
                    <NeonBox
                        aria-hidden
                        className={cn(
                            'rounded-inherit pointer-events-none absolute inset-0 duration-300 transition-all',
                            neonBoxClass
                        )}
                        glowColor={glowColor}
                        intensity={intensity}
                        glowLayers={glowLayers}
                        glowSpread={glowSpread}
                        borderColor={borderColor}
                        borderWidth={borderWidth}
                        insetGlow={insetGlow}
                        backgroundColor={backgroundColor}
                        backgroundOpacity={effectiveBackgroundOpacity}
                    />
                )}

                <div
                    className={cn(
                        'relative z-10 leading-0',
                        icon && 'flex items-center justify-center',
                        btnInnerClass
                    )}
                >
                    {children}
                </div>
            </Comp>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
