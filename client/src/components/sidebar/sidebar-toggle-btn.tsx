'use client';

import { Icon } from '@iconify/react';

import { buttonVariants } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { styled } from '@/root/stitches.config';

const Label = styled('span', {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s ease, width 0.2s ease',
    variants: {
        collapsed: {
            true: { opacity: 0, width: 0 },
            false: { opacity: 1, width: 'auto' },
        },
    },
});

const IconWrapper = styled('span', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'margin 0.2s ease',
    variants: {
        collapsed: {
            true: { margin: '0' },
            false: { margin: '0 -0.5rem 0 0' },
        },
    },
});

type SidebarButtonProps = {
    label: string;
    icon: string;
    sidebarOpen: boolean;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    tooltipColor?: string; // Custom color for tooltip glow and background
};

export function SidebarButton({
    label,
    icon,
    sidebarOpen,
    variant = 'primary',
    onClick,
    tooltipColor,
}: SidebarButtonProps) {
    const { is2xl } = useBreakPoint();
    const btnClass = buttonVariants({
        variant,
        size: is2xl ? 'md' : 'lg',
        className: 'w-full scale-effect',
    });

    const button = (
        <button className={btnClass} onClick={onClick}>
            <IconWrapper collapsed={sidebarOpen}>
                <Icon icon={icon} width={20} height={20} />
            </IconWrapper>
            <Label collapsed={!sidebarOpen}>{label}</Label>
        </button>
    );

    // Show tooltip when sidebar is collapsed
    if (!sidebarOpen) {
        // Use custom color if provided, otherwise fallback to variant colors
        const glowColor = tooltipColor || (variant === 'primary' 
            ? 'var(--color-primary-500)' 
            : 'var(--color-secondary-500)');
        const bgColor = tooltipColor || (variant === 'primary' 
            ? 'var(--color-primary-500)' 
            : 'var(--color-secondary-500)');

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {button}
                </TooltipTrigger>
                <TooltipContent 
                    side='right'
                    sideOffset={12}
                    glowColor={glowColor}
                    backgroundColor={bgColor}
                    backgroundOpacity={0.95}
                    intensity={2}
                    glowSpread={4}
                    glowLayers={3}
                    borderColor={glowColor}
                    borderWidth={1}
                    className='border-0 px-4 py-2.5 backdrop-blur-2xl'
                >
                    <p className='font-bold text-sm text-white tracking-wide'>
                        {label}
                    </p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return button;
}
