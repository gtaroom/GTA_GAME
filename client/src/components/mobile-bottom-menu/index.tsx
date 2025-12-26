'use client';

import { useIsLoggedIn } from '@/contexts/auth-context';
import { useUI } from '@/contexts/ui-context';
import { cn } from '@/lib/utils';
import { Link } from 'next-transition-router';
import { usePathname } from 'next/navigation'; // Added for active state
import { useEffect, useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';

function NavButton({
    icon,
    label,
    isActive,
    onClick,
}: {
    icon: string;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-out',
                isActive ? 'text-white scale-110' : 'text-white/60'
            )}
        >
            <div
                className={cn(
                    'p-2 rounded-xl transition-all duration-300',
                    isActive && 'bg-white/20 shadow-lg'
                )}
            >
                <NeonIcon icon={icon} className='xs:w-6 xs:h-6 h-5 w-5' />
            </div>
            <span
                className={cn(
                    'text-[10px] font-bold uppercase tracking-tight leading-none',
                    isActive ? 'opacity-100' : 'opacity-80'
                )}
            >
                {label}
            </span>
        </button>
    );
}

export default function BottomNavigation() {
    interface NavItem {
        href?: string;
        icon: string;
        label: string;
        type?: 'link' | 'button';
        onClick?: () => void;
        showUserLoggedIn?: boolean | 'both';
    }

    const { isLoggedIn } = useIsLoggedIn();
    const { toggleSidebar, toggleMobileMenu } = useUI();
    const pathname = usePathname(); // Get current URL

    const handleMenuToggle = () => {
        if (isLoggedIn) {
            toggleSidebar();
        } else {
            toggleMobileMenu();
        }
    };

    const handleSupportClick = () => {
        window.open(
            'https://web.facebook.com/Goldenticketonlinearcade',
            '_blank'
        );
    };

    const navItems: NavItem[] = [
        {
            icon: 'lucide:menu',
            label: 'Menu',
            type: 'button',
            onClick: handleMenuToggle,
            showUserLoggedIn: 'both',
        },
        {
            href: '/buy-coins',
            icon: 'lucide:shopping-cart',
            label: 'Get Coins',
            type: 'link',
            showUserLoggedIn: 'both',
        },
        {
            href: '/',
            icon: 'ic:round-home',
            label: 'Home',
            type: 'link',
            showUserLoggedIn: 'both',
        },
        {
            href: '/redeem',
            icon: 'material-symbols:redeem',
            label: 'Redeem',
            type: 'link',
            showUserLoggedIn: true,
        },
        {
            icon: 'lucide:users',
            label: 'Community',
            type: 'button',
            onClick: handleSupportClick,
            showUserLoggedIn: false,
        },
        {
            href: '/buy-redeem',
            icon: 'lucide:wallet',
            label: 'Wallet',
            type: 'link',
            showUserLoggedIn: true,
        },
        {
            href: '/game-listing',
            icon: 'lucide:gamepad-2',
            label: 'Games',
            type: 'link',
            showUserLoggedIn: false,
        },
    ];

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out transform w-full max-w-md ${
                isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
            }`}
        >
            <NeonBox
                className='mx-4 mb-5 rounded-2xl backdrop-blur-2xl border border-white/20 shadow-lg flex items-end justify-around px-2 py-3'
                backgroundColor='--color-purple-500'
                backgroundOpacity={0.4}
            >
                {navItems
                    .filter(item => {
                        if (item.showUserLoggedIn === true && !isLoggedIn)
                            return false;
                        if (item.showUserLoggedIn === false && isLoggedIn)
                            return false;
                        return true;
                    })
                    .map((item, index) => {
                        const isActive = pathname === item.href;

                        return item.type === 'link' && item.href ? (
                            <Link key={index} href={item.href}>
                                <NavButton
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={isActive}
                                />
                            </Link>
                        ) : (
                            <NavButton
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                onClick={item.onClick}
                            />
                        );
                    })}
            </NeonBox>
        </nav>
    );
}
