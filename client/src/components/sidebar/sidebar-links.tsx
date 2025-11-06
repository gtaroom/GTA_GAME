'use client';

import { Icon } from '@iconify/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'next-transition-router';
import { usePathname } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

import NeonBox from '@/components/neon/neon-box';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUI } from '@/contexts/ui-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

export type SidebarLink = {
    id?: string;
    title: string;
    href?: string;
    icon?: string | React.ReactNode;
    subLinks?: SidebarLink[];
    disabled?: boolean;
    color?: string;
};

type Props = {
    links: SidebarLink[];
    className?: string;
    onNavigate?: () => void;
};

const useColor500 = () =>
    useCallback((key?: string) => key && `var(--color-${key}-500)`, []);

const useIsActive = () =>
    useCallback((pathname: string, href?: string, isLoggedIn?: boolean) => {
        if (!href) return false;
        
        // Smart routing: if href is '/' and user is logged in, check against '/lobby'
        const smartHref = (href === '/' && isLoggedIn) ? '/lobby' : href;
        
        if (smartHref === '/') return pathname === '/';
        if (pathname === smartHref) return true;
        return (
            pathname.startsWith(smartHref) &&
            ['/', undefined].includes(pathname[smartHref.length])
        );
    }, []);

const MemoIcon = memo<{
    icon?: string | React.ReactNode;
    color?: string;
}>(({ icon, color }) => {
    if (!icon) return null;
    const style = color ? { color } : undefined;
    return typeof icon === 'string' ? (
        <Icon
            icon={icon}
            className='h-5 w-5 flex-shrink-0 relative -right-[2px]'
            style={style}
        />
    ) : (
        <div
            className='flex h-5 w-5 flex-shrink-0 items-center justify-center'
            style={style}
        >
            {icon}
        </div>
    );
});
MemoIcon.displayName = 'MemoIcon';

const NeonWrapper = memo<{
    active: boolean;
    glow?: string;
    bg?: string;
    children: React.ReactNode;
}>(({ active, glow, bg, children }) => (
    <NeonBox
        glowColor={glow}
        backgroundColor={bg}
        backgroundOpacity={active ? 0.4 : 0.2}
        intensity={1}
        glowSpread={3}
        enableHover
        className='rounded-[8px] px-2 backdrop-blur-3xl transition-all duration-300'
    >
        {children}
    </NeonBox>
));
NeonWrapper.displayName = 'NeonWrapper';

export default function SidebarLinks({ links, className, onNavigate }: Props) {
    const { xl } = useBreakPoint();
    const { sidebarOpen } = useUI();
    const { isLoggedIn } = useAuth();
    const pathname = usePathname();
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
    const getColor = useColor500();
    const isActive = useIsActive();
    
    // Helper function to get smart href
    const getSmartHref = (href?: string) => {
        if (!href) return '#';
        return (href === '/' && isLoggedIn) ? '/lobby' : href;
    };

    useEffect(() => {
        if (!sidebarOpen) setOpenItems(new Set());
    }, [sidebarOpen]);

    const toggleItem = useCallback((key: string) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const renderSublinks = (parentKey: string, subLinks: SidebarLink[]) => (
        <div
            className={cn(
                'overflow-hidden transition-[max-height] duration-300 ease-in-out',
                openItems.has(parentKey) ? 'max-h-[500px]' : 'max-h-0'
            )}
        >
            {subLinks.map(sub => {
                const subKey = sub.id ?? `${parentKey}-${sub.title}`;
                const active = isActive(pathname, sub.href, isLoggedIn);
                return (
                    <Link
                        key={subKey}
                        href={getSmartHref(sub.href)}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-3 p-2 text-base font-bold transition-colors duration-200',
                            active && 'text-white'
                        )}
                    >
                        <MemoIcon
                            icon={sub.icon}
                            color={getColor(sub.color ?? undefined)}
                        />
                        <span>{sub.title}</span>
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div className={cn('space-y-4', className)}>
            {links.map(link => {
                const key = link.id ?? link.title;
                const hasChildren = !!link.subLinks?.length;
                const active =
                    isActive(pathname, link.href, isLoggedIn) ||
                    (hasChildren &&
                        link.subLinks!.some(s => isActive(pathname, s.href, isLoggedIn)));

                const glow = getColor(link.color);
                const bg = getColor(link.color);
                const iconColor = getColor(link.color);

                const chevron = hasChildren && (
                    <div
                        className={cn(
                            'ml-auto transition-opacity duration-300',
                            sidebarOpen ? 'opacity-100' : 'opacity-0'
                        )}
                    >
                        {openItems.has(key) ? (
                            <ChevronDown className='h-4 w-4 rotate-180 transition-transform duration-200' />
                        ) : (
                            <ChevronRight className='h-4 w-4 transition-transform duration-200' />
                        )}
                    </div>
                );

                const mainContent = (
                    <div
                        className={cn(
                            'flex select-none cursor-pointer items-center gap-3 rounded-lg px-2 py-3 transition-colors duration-200'
                        )}
                        onClick={
                            // FIX 1: Only attach the toggle handler for the accordion view (when sidebar is open).
                            hasChildren && sidebarOpen
                                ? () => toggleItem(key)
                                : undefined
                        }
                    >
                        <MemoIcon icon={link.icon} color={iconColor} />

                        <span
                            className={cn(
                                'inline-block overflow-hidden font-bold whitespace-nowrap transition-[width,opacity] duration-300',
                                sidebarOpen
                                    ? 'w-full opacity-100'
                                    : 'w-0 opacity-0'
                            )}
                        >
                            {link.title}
                        </span>

                        {chevron}
                    </div>
                );

                const wrappedContent = (() => {
                    if (hasChildren && !sidebarOpen) {
                        // Collapsed sidebar with children: Show Popover with Tooltip
                        return (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Popover 
                                            open={openPopovers[key] || false}
                                            onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [key]: open }))}
                                        >
                                            <PopoverTrigger asChild>
                                                <div>{mainContent}</div>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                side='right'
                                                sideOffset={38}
                                                className='w-54 bg-background border-white/30'
                                            >
                                                {link.subLinks!.map(sub => {
                                                    const subKey =
                                                        sub.id ?? `${key}-${sub.title}`;
                                                    const active = isActive(
                                                        pathname,
                                                        sub.href,
                                                        isLoggedIn
                                                    );
                                                    return (
                                                        <Link
                                                            key={subKey}
                                                            href={getSmartHref(sub.href)}
                                                            onClick={() => {
                                                                setOpenPopovers(prev => ({ ...prev, [key]: false }));
                                                                onNavigate?.();
                                                            }}
                                                            className={cn(
                                                                'flex items-center gap-3 text-base font-bold transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-sm',
                                                                active && 'bg-white/20'
                                                            )}
                                                        >
                                                            <MemoIcon
                                                                icon={sub.icon}
                                                                color={getColor(
                                                                    sub.color ??
                                                                        undefined
                                                                )}
                                                            />
                                                            <span>{sub.title}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side='right'
                                    sideOffset={12}
                                    glowColor={glow}
                                    backgroundColor={bg}
                                    backgroundOpacity={0.95}
                                    intensity={2}
                                    glowSpread={4}
                                    glowLayers={3}
                                    borderColor={glow}
                                    borderWidth={1}
                                    className='border-0 px-4 py-2.5 backdrop-blur-2xl'
                                >
                                    <p className='font-bold text-sm text-white tracking-wide'>
                                        {link.title}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }
                    
                    if (link.href && !hasChildren) {
                        // Simple link (with or without sidebar open)
                        const linkContent = (
                            <Link href={getSmartHref(link.href)} onClick={onNavigate}>
                                {mainContent}
                            </Link>
                        );
                        
                        // Add tooltip when sidebar is collapsed
                        if (!sidebarOpen) {
                            return (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {linkContent}
                                    </TooltipTrigger>
                                    <TooltipContent 
                                        side='right'
                                        sideOffset={12}
                                        glowColor={glow}
                                        backgroundColor={bg}
                                        backgroundOpacity={0.95}
                                        intensity={2}
                                        glowSpread={4}
                                        glowLayers={3}
                                        borderColor={glow}
                                        borderWidth={1}
                                        className='border-0 px-4 py-2.5 backdrop-blur-2xl'
                                    >
                                        <p className='font-bold text-sm text-white tracking-wide'>
                                            {link.title}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        
                        return linkContent;
                    }
                    
                    // Expanded sidebar with children (accordion view)
                    return (
                        <>
                            {mainContent}
                            {hasChildren &&
                                sidebarOpen &&
                                renderSublinks(key, link.subLinks!)}
                        </>
                    );
                })();

                return (
                    <div key={key} className='w-full'>
                        <NeonWrapper active={active} glow={glow} bg={bg}>
                            {wrappedContent}
                        </NeonWrapper>
                    </div>
                );
            })}
        </div>
    );
}
