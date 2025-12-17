'use client';

import * as React from 'react';

import { asCssColor } from '@/lib/css-color';
import { withOpacity } from '@/lib/neon-helper';
import { cn } from '@/lib/utils';
import { styled } from '@/root/stitches.config';
import { NEON_BOX_DEFAULTS, type NeonBoxPublicProps } from '@/types/neon.types';

type HoverTweaks = {
    hoverGlowSpreadMultiplier?: number;
    hoverOpacityDelta?: number;
    enableHover?: boolean;
    hover?: boolean;
};

export type NeonBoxProps = React.HTMLAttributes<HTMLDivElement> &
    NeonBoxPublicProps &
    HoverTweaks & {
        neonBoxRef?: React.Ref<HTMLDivElement>;
    };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const StyledNeonBox = styled('div', {
    variants: {
        hover: {
            true: {
                transition: 'all 0.3s ease',
            },
            false: {},
        },
    },
});

const NeonBox = React.memo<NeonBoxProps>(
    ({
        neonBoxRef,
        children,
        glowColor = NEON_BOX_DEFAULTS.glowColor,
        intensity = NEON_BOX_DEFAULTS.intensity,
        glowLayers = NEON_BOX_DEFAULTS.glowLayers,
        glowSpread = NEON_BOX_DEFAULTS.glowSpread,
        borderColor = NEON_BOX_DEFAULTS.borderColor,
        borderWidth = NEON_BOX_DEFAULTS.borderWidth,
        insetGlow = NEON_BOX_DEFAULTS.insetGlow,
        backgroundColor = NEON_BOX_DEFAULTS.backgroundColor,
        backgroundOpacity = NEON_BOX_DEFAULTS.backgroundOpacity,
        hoverGlowSpreadMultiplier = 1.1,
        hoverOpacityDelta = 0.12,
        enableHover,
        hover,
        className = 'h-50 w-50 rounded-lg',
        onMouseEnter,
        onMouseLeave,
        ...props
    }) => {
        const hoverEnabled = (enableHover ?? hover) === true;
        const [hovered, setHovered] = React.useState(false);

        const colors = React.useMemo(
            () => ({
                glow: asCssColor(glowColor)!,
                border: asCssColor(borderColor)!,
            }),
            [glowColor, borderColor]
        );

        const effectiveValues = React.useMemo(
            () => ({
                spread:
                    (glowSpread || 0) *
                    (hoverEnabled && hovered ? hoverGlowSpreadMultiplier : 1),
                opacity: clamp01(
                    (backgroundOpacity || 0) +
                        (hoverEnabled && hovered ? hoverOpacityDelta : 0)
                ),
            }),
            [
                glowSpread,
                hoverEnabled,
                hovered,
                hoverGlowSpreadMultiplier,
                backgroundOpacity,
                hoverOpacityDelta,
            ]
        );

        const bg = React.useMemo(
            () => withOpacity(backgroundColor, effectiveValues.opacity),
            [backgroundColor, effectiveValues.opacity]
        );

        const generatedShadow = React.useMemo(() => {
            const parts: string[] = [];
            const layers = Math.max(0, glowLayers || 0);

            for (let i = 1; i <= layers; i++) {
                const blur = (intensity || 0) * i * effectiveValues.spread;
                parts.push(`0 0 ${blur}px ${colors.glow}`);
            }

            if (insetGlow) {
                parts.push(
                    `inset 0 0 ${(intensity || 0) * effectiveValues.spread}px ${colors.glow}`
                );
            }

            return parts.join(', ');
        }, [
            glowLayers,
            intensity,
            effectiveValues.spread,
            colors.glow,
            insetGlow,
        ]);

        const handleEnter = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (hoverEnabled) setHovered(true);
                onMouseEnter?.(e);
            },
            [hoverEnabled, onMouseEnter]
        );

        const handleLeave = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (hoverEnabled) setHovered(false);
                onMouseLeave?.(e);
            },
            [hoverEnabled, onMouseLeave]
        );

        return (
            <StyledNeonBox
                ref={neonBoxRef}
                hover={hoverEnabled}
                className={cn(className)}
                css={{
                    border: `${borderWidth}px solid ${colors.border}`,
                    backgroundColor: bg,
                    boxShadow: generatedShadow,
                }}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                {...props}
            >
                {children}
            </StyledNeonBox>
        );
    }
);

NeonBox.displayName = 'NeonBox';

export default NeonBox;
