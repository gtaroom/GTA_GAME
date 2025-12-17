'use client';

import { Icon } from '@iconify/react';
import { Select as SelectPrimitive } from 'radix-ui';
import * as React from 'react';

import { asCssColor } from '@/lib/css-color';
import { withOpacity } from '@/lib/neon-helper';
import { cn } from '@/lib/utils';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

type NeonSurfaceProps = {
    neon?: NeonBoxPublicProps['neon'];
} & Partial<Omit<NeonBoxPublicProps, 'neon'>>;

function useNeonSurface({
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
}: NeonSurfaceProps & { style?: React.CSSProperties }) {
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
                asCssColor(neonValues.borderColor) ?? neonValues.borderColor,
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
        return tinted ?? asCssColor(neonValues.backgroundColor) ?? undefined;
    }, [neonValues]);

    const borderStyle = React.useMemo(() => {
        if (!neonValues || !colors) return undefined;
        return `${neonValues.borderWidth ?? 0}px solid ${colors.border}`;
    }, [colors, neonValues]);

    const mergedStyle = React.useMemo(() => {
        if (!neonValues || !colors) return style;

        const baseStyle: React.CSSProperties = {
            ...(boxShadow ? { boxShadow } : {}),
            ...(borderStyle ? { border: borderStyle } : {}),
            ...(backgroundFill ? { backgroundColor: backgroundFill } : {}),
            willChange: 'transform, box-shadow',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
        };

        return style ? { ...baseStyle, ...style } : baseStyle;
    }, [backgroundFill, borderStyle, boxShadow, colors, neonValues, style]);

    return { neonEnabled, style: mergedStyle };
}

function Select({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectGroup({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot='select-group' {...props} />;
}

function SelectValue({
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

interface SelectTriggerProps
    extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
    showIcon?: boolean;
    className?: string;
    children?: React.ReactNode;
}

function SelectTrigger({
    showIcon = true,
    className,
    children,
    ...props
}: SelectTriggerProps) {
    return (
        <SelectPrimitive.Trigger
            data-slot='select-trigger'
            className={cn(
                'flex  w-full items-center justify-between gap-2 bg-transparent text-base font-black text-white outline-none *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>span]:line-clamp-1',
                className
            )}
            {...props}
        >
            {children}
            {showIcon && (
                <SelectPrimitive.Icon asChild>
                    <Icon
                        icon='lucide:chevron-down'
                        className='text-2xl shrink-0 text-white'
                    />
                </SelectPrimitive.Icon>
            )}
        </SelectPrimitive.Trigger>
    );
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content> &
    NeonSurfaceProps;

function SelectContent({
    className,
    children,
    position = 'popper',
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
}: SelectContentProps) {
    const { neonEnabled, style: neonStyle } = useNeonSurface({
        neon,
        glowColor,
        intensity,
        glowLayers,
        glowSpread,
        borderColor,
        borderWidth,
        insetGlow,
        backgroundColor: '--color-purple-500',
        backgroundOpacity: 0.2,
        style,
    });

    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot='select-content'
                className={cn(
                    'text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-32 overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800 shadow-lg [&_[role=group]]:py-1 p-1 backdrop-blur-3xl',
                    position === 'popper' &&
                        `w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2`,
                    className
                )}
                position={position}
                style={neonStyle}
                data-neon={neonEnabled || undefined}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        'p-1',
                        position === 'popper' &&
                            'h-[var(--radix-select-trigger-height)]'
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot='select-label'
            className={cn(
                'text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium',
                className
            )}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot='select-item'
            className={cn(
                'focus:text-white relative flex w-full cursor-default items-center rounded-sm py-2 ps-8 pe-2 text-sm font-black outline-hidden select-none focus:bg-white/20 data-disabled:pointer-events-none data-disabled:opacity-50',
                className
            )}
            {...props}
        >
            <span className='absolute start-2 flex size-3.5 items-center justify-center'>
                <SelectPrimitive.ItemIndicator>
                    <Icon icon='lucide:check' className='text-white ' />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot='select-separator'
            className={cn('bg-border -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot='select-scroll-up-button'
            className={cn(
                'text-muted-foreground/80 flex cursor-default items-center justify-center py-1',
                className
            )}
            {...props}
        >
            <Icon icon='chevron-up' fontSize={16} />
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot='select-scroll-down-button'
            className={cn(
                'text-muted-foreground/80 flex cursor-default items-center justify-center py-1',
                className
            )}
            {...props}
        >
            <Icon icon='chevron-down' fontSize={16} />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};