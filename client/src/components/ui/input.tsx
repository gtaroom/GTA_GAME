'use client';

import { Icon } from '@iconify/react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import NeonBox from '@/components/neon/neon-box';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

const inputVariants = cva(
    'placeholder:text-white/80 placeholder:capitalize aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex w-full min-w-0 rounded-md border-[2px] border-white font-bold normal-case shadow-xs outline-none backdrop-blur-2xl disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            size: {
                sm: 'h-el-sm px-4 text-sm',
                md: 'h-el-md px-4 md:px-6 text-sm lg:text-base',
                lg: 'h-el-lg px-7 text-base lg:text-lg',
                xl: 'h-el-xl px-8 text-lg lg:text-xl',
            },
        },
        defaultVariants: { size: 'sm' },
    }
);

// Non-null size type
type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>;

const sizeRightPadding: Record<InputSize, string> = {
    sm: 'pr-12 right-4',
    md: 'pr-14 right-6',
    lg: 'pr-16 right-7',
    xl: 'pr-20 right-8',
};

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        NeonBoxPublicProps {
    wrapperClassName?: string;
    size?: InputSize; // <- non-null union
    passwordToggle?: boolean;
    onToggleVisibility?: (visible: boolean) => void;
    neonBoxClass?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            wrapperClassName,
            type,
            size = 'sm',
            neon = true,
            glowColor = NEON_BOX_DEFAULTS.glowColor,
            intensity = NEON_BOX_DEFAULTS.intensity,
            glowLayers = NEON_BOX_DEFAULTS.glowLayers,
            glowSpread = NEON_BOX_DEFAULTS.glowSpread,
            borderColor = NEON_BOX_DEFAULTS.borderColor,
            borderWidth = NEON_BOX_DEFAULTS.borderWidth,
            insetGlow = NEON_BOX_DEFAULTS.insetGlow,
            backgroundColor = NEON_BOX_DEFAULTS.backgroundColor,
            backgroundOpacity = NEON_BOX_DEFAULTS.backgroundOpacity,
            passwordToggle,
            onToggleVisibility,
            neonBoxClass,
            ...props
        },
        ref
    ) => {
        const [isHovered, setHovered] = React.useState(false);
        const [isFocused, setFocused] = React.useState(false);
        const [visible, setVisible] = React.useState(false);

        // force non-null for indexing
        const vSize: InputSize = size ?? 'sm';

        const shouldToggle = (passwordToggle ?? true) && type === 'password';

        const effectiveBackgroundOpacity =
            isHovered || isFocused
                ? (backgroundOpacity ?? 0) + 0.1
                : backgroundOpacity;
        const effectiveGlowSpread = isFocused
            ? (glowSpread ?? 0) + 0.3
            : glowSpread;

        const handleToggle = () => {
            const next = !visible;
            setVisible(next);
            onToggleVisibility?.(next);
        };

        return (
            <div
                className={cn(
                    'relative w-full min-w-0',
                    props.disabled && 'pointer-events-none opacity-50',
                    wrapperClassName
                )}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {neon && (
                    <NeonBox
                        aria-hidden
                        className={cn(
                            'pointer-events-none absolute inset-0 duration-200',
                            'rounded-md',
                            neonBoxClass
                        )}
                        glowColor={glowColor}
                        intensity={intensity}
                        glowLayers={glowLayers}
                        glowSpread={effectiveGlowSpread}
                        borderColor={borderColor}
                        borderWidth={borderWidth}
                        insetGlow={insetGlow}
                        backgroundColor={backgroundColor}
                        backgroundOpacity={effectiveBackgroundOpacity}
                    />
                )}

                <input
                    ref={ref}
                    type={shouldToggle ? (visible ? 'text' : 'password') : type}
                    data-slot='input'
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        inputVariants({ size: vSize }),
                        shouldToggle && sizeRightPadding[vSize],
                        className
                    )}
                    {...props}
                />

                {shouldToggle && (
                    <button
                        type='button'
                        onClick={handleToggle}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                        className={cn(
                            'absolute inset-y-0 z-[1] grid cursor-pointer select-none place-items-center text-white/80 hover:text-white focus-visible:outline-none',
                            sizeRightPadding[vSize].split(' ')[1]
                        )}
                        tabIndex={props.disabled ? -1 : 0}
                    >
                        {visible ? (
                            <Icon
                                icon='lucide:eye-closed'
                                className='h-5 w-5'
                            />
                        ) : (
                            <Icon icon='lucide:eye' className='h-5 w-5' />
                        )}
                    </button>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
export { Input, inputVariants };
