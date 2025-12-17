'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import NeonBox from '@/components/neon/neon-box';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

const textareaVariants = cva(
    'placeholder:text-white/80 placeholder:capitalize aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex w-full min-w-0 rounded-md border-[2px] border-white font-bold normal-case shadow-xs outline-none backdrop-blur-xs disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content resize-y',
    {
        variants: {
            size: {
                sm: 'min-h-16 px-3 py-2 text-sm',
                md: 'min-h-20 px-4 py-3 text-sm lg:text-base',
                lg: 'min-h-24 px-5 py-4 text-base lg:text-lg',
                xl: 'min-h-28 px-6 py-5 text-lg lg:text-xl',
            },
        },
        defaultVariants: { size: 'sm' },
    }
);

type TextareaSize = NonNullable<VariantProps<typeof textareaVariants>['size']>;

export interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
        NeonBoxPublicProps {
    wrapperClassName?: string;
    size?: TextareaSize;
    neonBoxClass?: string;
    autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            wrapperClassName,
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
            neonBoxClass,
            autoResize = false,
            ...props
        },
        ref
    ) => {
        const [isHovered, setHovered] = React.useState(false);
        const [isFocused, setFocused] = React.useState(false);
        const textareaRef = React.useRef<HTMLTextAreaElement>(null);

        React.useImperativeHandle(ref, () => textareaRef.current!, []);

        const vSize: TextareaSize = size ?? 'sm';

        const effectiveBackgroundOpacity =
            isHovered || isFocused
                ? (backgroundOpacity ?? 0) + 0.1
                : backgroundOpacity;
        const effectiveGlowSpread = isFocused
            ? (glowSpread ?? 0) + 0.3
            : glowSpread;
        const effectiveIntensity = isFocused
            ? (intensity ?? 1) + 0.2
            : intensity;

        const handleAutoResize = React.useCallback(() => {
            if (autoResize && textareaRef.current) {
                const textarea = textareaRef.current;
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }, [autoResize]);

        const handleInput = React.useCallback(
            (e: React.FormEvent<HTMLTextAreaElement>) => {
                handleAutoResize();
                props.onInput?.(e);
            },
            [handleAutoResize, props]
        );

        React.useEffect(() => {
            if (autoResize) {
                handleAutoResize();
            }
        }, [handleAutoResize]);

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
                            'pointer-events-none absolute inset-0 duration-300 ease-out',
                            'rounded-md',
                            neonBoxClass
                        )}
                        glowColor={glowColor}
                        intensity={effectiveIntensity}
                        glowLayers={glowLayers}
                        glowSpread={effectiveGlowSpread}
                        borderColor={borderColor}
                        borderWidth={borderWidth}
                        insetGlow={insetGlow}
                        backgroundColor={backgroundColor}
                        backgroundOpacity={effectiveBackgroundOpacity}
                    />
                )}

                <textarea
                    ref={textareaRef}
                    data-slot='textarea'
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onInput={handleInput}
                    className={cn(
                        'relative z-[1]',
                        textareaVariants({ size: vSize }),
                        autoResize && 'resize-none overflow-hidden',
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
