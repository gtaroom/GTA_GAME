'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import * as React from 'react';

import { asCssColor } from '@/lib/css-color';
import { withOpacity } from '@/lib/neon-helper';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

function TooltipProvider({
    delayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot='tooltip-provider'
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot='tooltip' {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

type TooltipContentProps = React.ComponentProps<
    typeof TooltipPrimitive.Content
> & {
    showArrow?: boolean;
    neon?: NeonBoxPublicProps['neon'];
} & Partial<Omit<NeonBoxPublicProps, 'neon'>>;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    TooltipContentProps
>(
    (
        {
            className,
            showArrow = false,
            children,
            neon,
            glowColor,
            intensity,
            glowLayers,
            glowSpread,
            borderColor,
            borderWidth,
            insetGlow,
            backgroundColor,
            backgroundOpacity,
            style,
            ...props
        },
        ref
    ) => {
        const hasNeonOverride = React.useMemo(
            () =>
                [
                    glowColor,
                    intensity,
                    glowLayers,
                    glowSpread,
                    borderColor,
                    borderWidth,
                    insetGlow,
                    backgroundColor,
                    backgroundOpacity,
                ].some(value => value !== undefined),
            [
                glowColor,
                intensity,
                glowLayers,
                glowSpread,
                borderColor,
                borderWidth,
                insetGlow,
                backgroundColor,
                backgroundOpacity,
            ]
        );

        const neonEnabled = neon ?? hasNeonOverride;

        const neonValues = React.useMemo(() => {
            if (!neonEnabled) return null;
            return {
                glowColor: glowColor ?? NEON_BOX_DEFAULTS.glowColor,
                intensity: intensity ?? NEON_BOX_DEFAULTS.intensity,
                glowLayers: glowLayers ?? NEON_BOX_DEFAULTS.glowLayers,
                glowSpread: glowSpread ?? NEON_BOX_DEFAULTS.glowSpread,
                borderColor: borderColor ?? NEON_BOX_DEFAULTS.borderColor,
                borderWidth: borderWidth ?? NEON_BOX_DEFAULTS.borderWidth,
                insetGlow: insetGlow ?? NEON_BOX_DEFAULTS.insetGlow,
                backgroundColor:
                    backgroundColor ?? NEON_BOX_DEFAULTS.backgroundColor,
                backgroundOpacity:
                    backgroundOpacity ?? NEON_BOX_DEFAULTS.backgroundOpacity,
            };
        }, [
            neonEnabled,
            glowColor,
            intensity,
            glowLayers,
            glowSpread,
            borderColor,
            borderWidth,
            insetGlow,
            backgroundColor,
            backgroundOpacity,
        ]);

        const colors = React.useMemo(() => {
            if (!neonValues) return null;
            return {
                glow: asCssColor(neonValues.glowColor) ?? neonValues.glowColor,
                border:
                    asCssColor(neonValues.borderColor) ??
                    neonValues.borderColor,
            };
        }, [neonValues]);

        const boxShadow = React.useMemo(() => {
            if (!neonValues || !colors) return undefined;
            const layers = Math.max(0, neonValues.glowLayers || 0);
            const spread = neonValues.glowSpread || 0;
            const intensityValue = neonValues.intensity || 0;
            const shadowParts: string[] = [];

            for (let i = 1; i <= layers; i++) {
                const blur = intensityValue * i * spread;
                shadowParts.push(`0 0 ${blur}px ${colors.glow}`);
            }

            if (neonValues.insetGlow) {
                const insetBlur = intensityValue * spread;
                shadowParts.push(`inset 0 0 ${insetBlur}px ${colors.glow}`);
            }

            return shadowParts.length > 0 ? shadowParts.join(', ') : undefined;
        }, [colors, neonValues]);

        const backgroundFill = React.useMemo(() => {
            if (!neonValues) return undefined;
            const tinted = withOpacity(
                neonValues.backgroundColor,
                neonValues.backgroundOpacity
            );
            return (
                tinted ?? asCssColor(neonValues.backgroundColor) ?? undefined
            );
        }, [neonValues]);

        const borderStyle = React.useMemo(() => {
            if (!neonValues || !colors) return undefined;
            return `${neonValues.borderWidth ?? 0}px solid ${colors.border}`;
        }, [colors, neonValues]);

        const mergedStyle = React.useMemo(() => {
            if (!neonValues || !colors) return style;

            const baseStyle: React.CSSProperties = {
                boxShadow,
                border: borderStyle,
                backgroundColor: backgroundFill,
                willChange: 'transform, box-shadow',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
            };

            if (!boxShadow) delete baseStyle.boxShadow;
            if (!borderStyle) delete baseStyle.border;
            if (!backgroundFill) delete baseStyle.backgroundColor;

            return style ? { ...baseStyle, ...style } : baseStyle;
        }, [backgroundFill, borderStyle, boxShadow, colors, neonValues, style]);

        const arrowStyle = React.useMemo(() => {
            if (!backgroundFill) return undefined;
            return { fill: backgroundFill } as React.CSSProperties;
        }, [backgroundFill]);

        return (
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    ref={ref}
                    data-slot='tooltip-content'
                    className={cn(
                        'text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-70 rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-sm backdrop-blur-3xl',
                        className
                    )}
                    style={mergedStyle}
                    data-neon={neonEnabled || undefined}
                    {...props}
                >
                    {children}
                    {showArrow && (
                        <TooltipPrimitive.Arrow
                            className='fill-popover -my-px drop-shadow-[0_1px_0_var(--border)]'
                            style={arrowStyle}
                        />
                    )}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        );
    }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };