'use client';

import * as React from 'react';

import { asCssColor } from '@/lib/css-color';
import { styled } from '@/root/stitches.config';
import { NEON_TEXT_DEFAULTS } from '@/types/neon.types';

type OwnProps = Omit<React.HTMLAttributes<HTMLElement>, 'ref'> & {
    className?: string;
    color?: string;
    glowColor?: string;
    intensity?: number;
    glowLayers?: number;
    glowSpread?: number;
    borderColor?: string;
    borderWidth?: number;
};

type SpanProps = OwnProps &
    React.HTMLAttributes<HTMLSpanElement> & { as?: 'span' };
type LabelProps = OwnProps &
    React.LabelHTMLAttributes<HTMLLabelElement> & { as: 'label' };
type AnchorProps = OwnProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingProps = OwnProps &
    React.HTMLAttributes<HTMLHeadingElement> & { as: HeadingTag };
type ParagraphProps = OwnProps &
    React.HTMLAttributes<HTMLParagraphElement> & { as: 'p' };

export type NeonTextProps =
    | SpanProps
    | LabelProps
    | AnchorProps
    | HeadingProps
    | ParagraphProps;

type NeonTextRef =
    | HTMLSpanElement
    | HTMLLabelElement
    | HTMLAnchorElement
    | HTMLHeadingElement
    | HTMLParagraphElement;

const StyledNeonText = styled('span', {
    variants: {
        tag: {
            span: {},
            label: {},
            a: {},
            h1: {},
            h2: {},
            h3: {},
            h4: {},
            h5: {},
            h6: {},
            p: {},
        },
    },
});

const NeonText = React.memo(
    React.forwardRef<NeonTextRef, NeonTextProps>((props, ref) => {
        const {
            as = 'span',
            children,
            color = NEON_TEXT_DEFAULTS.color,
            glowColor = NEON_TEXT_DEFAULTS.glowColor,
            intensity = NEON_TEXT_DEFAULTS.intensity,
            glowLayers = NEON_TEXT_DEFAULTS.glowLayers,
            glowSpread = NEON_TEXT_DEFAULTS.glowSpread,
            borderColor = NEON_TEXT_DEFAULTS.borderColor,
            borderWidth = NEON_TEXT_DEFAULTS.borderWidth,
            className,
            ...rest
        } = props;

        const colors = React.useMemo(
            () => ({
                text: asCssColor(color)!,
                glow: asCssColor(glowColor)!,
                border: asCssColor(borderColor)!,
            }),
            [color, glowColor, borderColor]
        );

        const generatedShadow = React.useMemo(() => {
            const parts: string[] = [];
            const layers = Math.max(0, glowLayers || 0);

            for (let i = 1; i <= layers; i++) {
                const blur = (intensity || 0) * i * (glowSpread || 0);
                parts.push(`0 0 ${blur}px ${colors.glow}`);
            }

            if ((borderWidth || 0) > 0) {
                for (let x = -borderWidth!; x <= borderWidth!; x++) {
                    for (let y = -borderWidth!; y <= borderWidth!; y++) {
                        if (x !== 0 || y !== 0) {
                            parts.unshift(`${x}px ${y}px 0px ${colors.border}`);
                        }
                    }
                }
            }

            return parts.join(', ');
        }, [
            glowLayers,
            intensity,
            glowSpread,
            colors.glow,
            borderWidth,
            colors.border,
        ]);

        return (
            <StyledNeonText
                as={as}
                tag={as}
                ref={ref}
                className={className}
                css={{
                    color: colors.text,
                    textShadow: generatedShadow,
                    WebkitTextStroke:
                        (borderWidth || 0) > 0
                            ? `${borderWidth}px ${colors.border}`
                            : 'none',
                }}
                {...rest}
            >
                {children}
            </StyledNeonText>
        );
    })
);

NeonText.displayName = 'NeonText';

export default NeonText;
