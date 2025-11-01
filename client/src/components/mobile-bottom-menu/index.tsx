'use client';

import { useIsLoggedIn } from '@/contexts/auth-context';
import { useUI } from '@/contexts/ui-context';
import { cn } from '@/lib/utils';
import { Link } from 'next-transition-router';
import { usePathname } from 'next/navigation';
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
                'relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-300 min-w-[60px]',
                isActive
                    ? 'text-white scale-105'
                    : 'text-white/60 hover:text-white/90'
            )}
        >
            <NeonIcon
                icon={icon}
                className={cn(
                    'w-6 h-6 transition-all duration-300',
                    isActive && 'drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]'
                )}
            />
            <span className='text-[10px] font-medium uppercase tracking-wider'>
                {label}
            </span>
            {isActive && (
                <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full' />
            )}
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
    const pathname = usePathname();

    const handleMenuToggle = () => {
        if (isLoggedIn) {
            toggleSidebar();
        } else {
            toggleMobileMenu();
        }
    };

    const handleSupportClick = () => {
        // Open support - you can integrate Rocket.Chat here later
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
            href: '/redeem',
            icon: 'material-symbols:redeem',
            label: 'Redeem',
            type: 'link',
            showUserLoggedIn: 'both',
        },
        {
            href: isLoggedIn ? '/lobby' : '/',
            icon: 'ic:round-home',
            label: 'Home',
            type: 'link',
            showUserLoggedIn: 'both',
        },
        {
            icon: 'lucide:earth',
            label: 'Community',
            type: 'link',
            href: '/community',
            // onClick: handleSupportClick,
            showUserLoggedIn: 'both',
        },
        {
            href: '/game-listing',
            icon: 'lucide:gamepad-2',
            label: 'Games',
            type: 'link',
            showUserLoggedIn: 'both',
        },
    ];

    return (
        <nav className='fixed bottom-0 left-0 right-0 z-50 pb-safe'>
            <div className='relative mx-auto max-w-screen-sm px-4 pb-4'>
                <NeonBox
                    className='w-full rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl'
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.3}
                    glowColor='--color-purple-500'
                    glowSpread={0.5}
                >
                    <div className='flex items-center justify-around px-2 py-3'>
                        {navItems
                            .filter(item => {
                                if (
                                    item.showUserLoggedIn === true &&
                                    !isLoggedIn
                                )
                                    return false;
                                if (
                                    item.showUserLoggedIn === false &&
                                    isLoggedIn
                                )
                                    return false;
                                return true;
                            })
                            .map((item, index) => {
                                const isActive =
                                    item.href === pathname ||
                                    (item.href === '/' && pathname === '/') ||
                                    (item.href === '/lobby' &&
                                        pathname === '/lobby');

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
                    </div>
                </NeonBox>
            </div>
        </nav>
    );
}
// 'use client';

// import { useIsLoggedIn } from '@/contexts/auth-context';
// import { useUI } from '@/contexts/ui-context';
// import { cn } from '@/lib/utils';
// import { Link } from 'next-transition-router';
// import { useEffect, useState } from 'react';
// import NeonBox from '../neon/neon-box';
// import NeonIcon from '../neon/neon-icon';

// function NavButton({
//     icon,
//     label,
//     isActive,
//     onClick,
// }: {
//     icon: string;
//     label: string;
//     isActive?: boolean;
//     onClick?: () => void;
// }) {
//     return (
//         <button
//             onClick={onClick}
//             aria-label={label}
//             className={cn(
//                 'relative flex flex-col items-center group p-3 rounded-xl transition-all duration-300 ease-out text-white/70',
//                 isActive && 'bg-white/20 text-white shadow-lg scale-110'
//             )}
//         >
//             <NeonIcon icon={icon} className='xs:w-5.5 xs:h-5.5 h-5 w-5' />
//         </button>
//     );
// }

// export default function BottomNavigation() {
//     interface NavItem {
//         href?: string;
//         icon: string;
//         label: string;
//         type?: 'link' | 'button';
//         onClick?: () => void;
//         showUserLoggedIn?: boolean | 'both';
//     }

//     const { isLoggedIn } = useIsLoggedIn();
//     const { toggleSidebar, toggleMobileMenu } = useUI();

//     const handleMenuToggle = () => {
//         if (isLoggedIn) {
//             toggleSidebar();
//         } else {
//             toggleMobileMenu();
//         }
//     };

//     const handleSupportClick = () => {
//         // Redirect to Facebook support page
//         window.open(
//             'https://web.facebook.com/Goldenticketonlinearcade',
//             '_blank'
//         );
//     };

//     const navItems: NavItem[] = [
//         {
//             icon: 'lucide:menu',
//             label: 'Menu',
//             type: 'button',
//             onClick: handleMenuToggle,
//             showUserLoggedIn: 'both',
//         },
//         {
//             href: '/buy-coins',
//             icon: 'lucide:shopping-cart',
//             label: 'Buy Coins',
//             type: 'link',
//             showUserLoggedIn: 'both',
//         },
//         {
//             href: '/',
//             icon: 'ic:round-home',
//             label: 'Home',
//             type: 'link',
//             showUserLoggedIn: 'both',
//         },
//         {
//             icon: 'lucide:headphones',
//             label: 'Support',
//             type: 'button',
//             onClick: handleSupportClick,
//             showUserLoggedIn: false,
//         },
//         {
//             href: '/buy-redeem',
//             icon: 'lucide:wallet',
//             label: 'Wallet',
//             type: 'link',
//             showUserLoggedIn: true,
//         },
//         {
//             href: '/game-listing',
//             icon: 'lucide:gamepad-2',
//             label: 'Game',
//             type: 'link',
//             showUserLoggedIn: 'both',
//         },
//     ];

//     const [isVisible, setIsVisible] = useState(true);
//     const [lastScrollY, setLastScrollY] = useState(0);

//     useEffect(() => {
//         const handleScroll = () => {
//             const currentScrollY = window.scrollY;

//             if (currentScrollY < lastScrollY || currentScrollY < 100) {
//                 setIsVisible(true);
//             } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
//                 setIsVisible(false);
//             }

//             setLastScrollY(currentScrollY);
//         };

//         window.addEventListener('scroll', handleScroll, { passive: true });
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [lastScrollY]);

//     return (
//         <nav
//             className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out transform ${
//                 isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
//             }`}
//         >
//             <NeonBox
//                 className='mx-4 mb-5 rounded-2xl backdrop-blur-2xl border border-white/20 shadow-lg inline-flex items-center justify-around px-[clamp(0.875rem,_0.6071rem_+_1.3393vw,_1.25rem)] py-4 gap-[clamp(0.375rem,_-0.6071rem_+_4.9107vw,_1.75rem)]'
//                 backgroundColor='--color-purple-500'
//                 backgroundOpacity={0.4}
//             >
//                 {navItems
//                     .filter(item => {
//                         if (item.showUserLoggedIn === true && !isLoggedIn)
//                             return false;
//                         if (item.showUserLoggedIn === false && isLoggedIn)
//                             return false;
//                         return true;
//                     })
//                     .map((item, index) =>
//                         item.type === 'link' && item.href ? (
//                             <Link
//                                 key={index}
//                                 href={item.href}
//                                 className={
//                                     (item.label === 'Home' && 'mx-2') || ''
//                                 }
//                             >
//                                 <NavButton
//                                     icon={item.icon}
//                                     label={item.label}
//                                     isActive={item.label === 'Home'}
//                                 />
//                             </Link>
//                         ) : (
//                             <NavButton
//                                 key={index}
//                                 icon={item.icon}
//                                 label={item.label}
//                                 onClick={item.onClick}
//                             />
//                         )
//                     )}

//                 {/* {isLoggedIn && (
//                     <Notification>
//                         <div className='mobile-notification'>
//                             <NotificationTrigger>
//                                 <NavButton
//                                     icon='lucide:bell'
//                                     label='Notifications'
//                                 />
//                             </NotificationTrigger>
//                         </div>
//                     </Notification>
//                 )} */}
//             </NeonBox>
//         </nav>
//     );
// }
