'use client';

import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { cloneElement } from 'react';

type BaseProps = {
    size?: number;
    color?: string;
    glowColor?: string;
    glowLayers?: number;
    glowSpread?: number;
    className?: string;
    forceCurrentColor?: boolean;
};

type WithIconify = BaseProps & { icon: string; children?: never };
type WithInlineSvg = BaseProps & { icon?: never; children: React.ReactNode };
export type NeonIconProps = WithIconify | WithInlineSvg;

function isSvgElement(
    node: React.ReactNode
): node is React.ReactElement<React.SVGProps<SVGSVGElement>, 'svg'> {
    return (
        !!node &&
        typeof (node as any).type === 'string' &&
        (node as any).type === 'svg'
    );
}

export default function NeonIcon({
    icon,
    children,
    size = 24,
    color = '--color-white',
    glowColor = '--color-purple-500',
    glowLayers = 2,
    glowSpread = 2,
    className,
    forceCurrentColor = true,
}: NeonIconProps) {
    // FIX: Wrap CSS variables in var() so the browser can apply them.
    const finalGlowColor = glowColor.startsWith('--')
        ? `var(${glowColor})`
        : glowColor;
    const finalColor = color.startsWith('--') ? `var(${color})` : color;

    const filter = Array.from({ length: glowLayers }, (_, i) => {
        const r = (i + 1) * glowSpread;
        // Use the corrected glow color variable
        return `drop-shadow(0 0 ${r}px ${finalGlowColor})`;
    }).join(' ');

    const wrapperStyle: React.CSSProperties = {
        filter,
        // Use the corrected color variable
        color: finalColor,
        lineHeight: 0,
    };

    const renderInline = () => {
        if (!children) return null;

        if (isSvgElement(children)) {
            const svgProps: React.SVGProps<SVGSVGElement> = {
                width: size,
                height: size,
                ...(forceCurrentColor && children.props.fill == null
                    ? { fill: 'currentColor' }
                    : {}),
                ...(forceCurrentColor && children.props.stroke == null
                    ? { stroke: 'currentColor' }
                    : {}),
                style: { display: 'block', ...(children.props.style || {}) },
            };
            return cloneElement(children, svgProps);
        }

        return <>{children}</>;
    };

    return (
        <span
            className={clsx('inline-flex', className)}
            style={wrapperStyle}
            aria-hidden
        >
            {icon ? (
                <Icon
                    icon={icon}
                    width={size}
                    height={size}
                    color='currentColor'
                />
            ) : (
                renderInline()
            )}
        </span>
    );
}
