import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { useVip } from '@/contexts/vip-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { profileDropdownLinks } from '@/data/links';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { logout as logoutApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import { getTierColor, getTierImage } from '@/lib/vip-utils';
import { Link, useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';

const UserProfile = () => {
    const { lg, sm, xs } = useBreakPoint();
    const { setLoggedIn, user, setUser } = useAuth();
    const { vipStatus } = useVip();
    const { balance: walletBalance } = useWalletBalance();
    const router = useTransitionRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const truncateText = (text: string, maxLength: number = 12): string => {
        const trimmedText = text.trim();

        if (trimmedText.length <= maxLength) {
            return trimmedText;
        }

        return trimmedText.substring(0, maxLength) + '...';
    };

    // Get user display name from context
    const getUserDisplayName = () => {
        if (!user) return 'Guest';
        const { first, middle, last } = user.name;
        const fullName = [first, middle, last].filter(Boolean).join(' ');
        return fullName || 'User';
    };

    const displayName = truncateText(getUserDisplayName());
    const fullName = getUserDisplayName();

    // Get user avatar URL
    const getUserAvatar = () => {
        if (user?.avatar?.url)
            return `${process.env.NEXT_PUBLIC_IMAGE_URL}/public${user.avatar.url}`;
        return '/account/avatar.jpg'; // Default avatar
    };

    const avatarUrl = getUserAvatar();

    // Format numbers with compact K/M/B/T for large values, locale for small values
    const formatNumber = (num: number) => {
        if (num === null || num === undefined || Number.isNaN(num)) return '0';
        const abs = Math.abs(num);
        const sign = num < 0 ? '-' : '';

        // Use compact notation for >= 10,000 (5+ digits only)
        if (abs >= 10_000) {
            const units = [
                { value: 1_000_000_000_000, symbol: 'T' },
                { value: 1_000_000_000, symbol: 'B' },
                { value: 1_000_000, symbol: 'M' },
                { value: 1_000, symbol: 'K' },
            ];

            for (const u of units) {
                if (abs >= u.value) {
                    const raw = abs / u.value;
                    // One decimal for smaller magnitudes (e.g., 1.2K, 9.5M), none for big (e.g., 120K)
                    const withPrecision =
                        raw < 100 ? Number(raw.toFixed(1)) : Math.round(raw);
                    const numPart = new Intl.NumberFormat('en-US', {
                        maximumFractionDigits: 1,
                    }).format(withPrecision);
                    return `${sign}${numPart}${u.symbol}`;
                }
            }
        }

        // Fallback: standard locale formatting
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Handle logout with API call
    const handleLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError(null);

        try {
            const response = (await logoutApi()) as any;

            if (response.success) {
                // Clear user state
                setUser(null);
                setLoggedIn(false);

                // Redirect to home page
                router.push('/');
            } else {
                setLogoutError(response.message || 'Failed to logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setLogoutError(
                error instanceof Error
                    ? error.message
                    : 'An error occurred during logout'
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const userBadgeStats = [
        {
            type: 'bonusGC',
            image: '/coins/gold-coin.svg',
            display: {
                text: `${formatNumber(user?.balance || 0)} GC`,
                color: '--color-yellow-300',
            },
            color: '--color-yellow-500',
            label: 'Bonus Gold Coins',
            description: 'Free coins for bonus games',
        },
        {
            type: 'gameGC',
            image: '/coins/bronze-coin.svg',
            display: {
                text: `${formatNumber(walletBalance || 0)} GC`,
                color: '--color-yellow-300',
            },
            color: '--color-yellow-500',
            label: 'Exclusive Gold Coins',
            description:
                'These coins are exclusively for Signature and Exclusive games',
        },
        {
            type: 'sweepCoins',
            image: '/coins/sweep-coin.svg',
            display: {
                text: `${formatNumber(user?.sweepCoins || 0)} SC`,
                color: '--color-green-300',
            },
            color: '--color-green-500',
            label: 'Sweep Coins',
            description: 'For redemption only',
        },
        {
            type: 'tier',
            image: vipStatus
                ? getTierImage(vipStatus.tier)
                : '/vip-program/iron.png',
            display: {
                neon: true,
                text: vipStatus ? vipStatus.tierName : 'Standard',
                color: '--color-white',
            },
            color: vipStatus
                ? getTierColor(vipStatus.tier)
                : '--color-gray-400',
        },
    ];

    const Seprator = ({ className }: { className?: string }) => {
        return (
            <div className={cn('h-[1px] w-full bg-white/20', className)}></div>
        );
    };

    // Handle link click to close dropdown
    const handleLinkClick = () => {
        setIsDropdownOpen(false);
    };

    return (
        <>
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
            >
                <DropdownMenuTrigger asChild>
                    {xs ? (
                        // MOBILE: Show avatar instead of name
                        <NeonBox
                            glowSpread={0.8}
                            backgroundColor='--color-purple-500'
                            backgroundOpacity={0.2}
                            className='p-1 w-[48px] aspect-square rounded-full overflow-hidden backdrop-blur-2xl'
                        >
                            <Image
                                src={avatarUrl}
                                width={200}
                                height={200}
                                alt='Profile Avatar'
                                className='h-full w-full object-cover object-center rounded-full'
                            />
                        </NeonBox>
                    ) : (
                        // DESKTOP: Show avatar too (or you can keep the button if you prefer)
                        <NeonBox
                            glowSpread={0.8}
                            backgroundColor='--color-purple-500'
                            backgroundOpacity={0.2}
                            className='p-1 w-[48px] aspect-square rounded-full overflow-hidden backdrop-blur-2xl'
                        >
                            <Image
                                src={avatarUrl}
                                width={200}
                                height={200}
                                alt='Profile Avatar'
                                className='h-full w-full object-cover object-center rounded-full'
                            />
                        </NeonBox>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align='end'
                    sideOffset={20}
                    className={xs ? 'w-[300px]' : 'w-[280px]'}
                    removeDefaultStyle
                >
                    <NeonBox
                        glowSpread={0.8}
                        backgroundColor='--color-purple-900'
                        backgroundOpacity={0.6}
                        className='overflow-x-hidden overflow-y-auto backdrop-blur-[100px] rounded-lg transition-[backdrop-filter] duration-500'
                    >
                        <div className='p-4'>
                            <div className='flex items-center justify-start gap-3 mb-5'>
                                {xs && (
                                    <NeonBox
                                        glowSpread={0.8}
                                        backgroundColor='--color-purple-500'
                                        backgroundOpacity={0.2}
                                        className='p-1 w-[54px] aspect-square rounded-full overflow-hidden backdrop-blur-2xl'
                                    >
                                        <Image
                                            src={avatarUrl}
                                            width={200}
                                            height={200}
                                            alt='Profile Avatar'
                                            className='h-full w-full object-cover object-center rounded-full'
                                        />
                                    </NeonBox>
                                )}
                                <div className='flex flex-col'>
                                    <span className='text-base font-extrabold'>
                                        {fullName}
                                    </span>
                                    <p className='font-bold text-sm text-white/80'>
                                        {user?.email || 'No email'}
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-x-4.5 gap-y-4 flex-wrap'>
                                {userBadgeStats.map((badge, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex gap-2 items-center',
                                            badge.type === 'tier' && 'w-full'
                                        )}
                                    >
                                        <Image
                                            src={badge.image}
                                            width={32}
                                            height={32}
                                            alt={badge.type}
                                            className='xxl:w-7 xl:w-6 w-5 aspect-square'
                                        />
                                        <div className='flex items-center gap-2'>
                                            <NeonText
                                                className='text-base font-extrabold! uppercase'
                                                glowColor={badge.color}
                                                color={badge.display.color}
                                                glowSpread={0}
                                            >
                                                {badge.display.text}
                                            </NeonText>
                                            {badge.label && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className='cursor-help'>
                                                                <NeonIcon
                                                                    icon='lucide:info'
                                                                    size={14}
                                                                    className='opacity-60 hover:opacity-100 transition-opacity'
                                                                    glowColor={
                                                                        badge.color
                                                                    }
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side='top'
                                                            align='center'
                                                            className='max-w-[200px]'
                                                        >
                                                            <div className='text-center'>
                                                                <div className='font-bold text-white mb-1'>
                                                                    {
                                                                        badge.label
                                                                    }
                                                                </div>
                                                                <div className='text-sm text-white opacity-90'>
                                                                    {
                                                                        badge.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='px-4'>
                            <Seprator className='mb-3' />
                        </div>

                        <nav className='px-2 mb-2.5'>
                            <ul className='space-y-1'>
                                {profileDropdownLinks.map((link, index) => (
                                    <li
                                        key={index}
                                        className='hover:bg-white/20 transition-colors duration-200 leading-1 px-2.5 py-2 rounded-sm'
                                    >
                                        <Link
                                            href={link.href || '#'}
                                            title={link.title}
                                            className='inline-flex items-center gap-2'
                                            onClick={handleLinkClick}
                                        >
                                            <NeonIcon
                                                icon={link.icon || ''}
                                                size={24}
                                                glowColor={`--color-${link.color}-500`}
                                            />

                                            <NeonText
                                                as='span'
                                                className='text-base font-bold'
                                                glowColor={`--color-${link.color}-500`}
                                                glowSpread={0.3}
                                            >
                                                {link.title}
                                            </NeonText>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className='px-4 mb-5'>
                            <Seprator className='mt-2 mb-5' />

                            {/* Error message */}
                            {logoutError && (
                                <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg'>
                                    <NeonText className='text-red-400 text-sm'>
                                        {logoutError}
                                    </NeonText>
                                </div>
                            )}

                            <Button
                                neon
                                size='sm'
                                variant='neon'
                                className='w-full rounded-sm'
                                neonBoxClass='rounded-sm'
                                btnInnerClass='inline-flex items-center gap-2'
                                glowColor='--color-red-500'
                                backgroundColor='--color-red-500'
                                backgroundOpacity={0.2}
                                glowSpread={0.5}
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <NeonIcon
                                            icon='lucide:loader-2'
                                            size={22}
                                            glowColor={`--color-red-500`}
                                            className='animate-spin'
                                        />
                                        <NeonText
                                            as='span'
                                            className='text-base font-bold'
                                            glowColor={`--color-red-500`}
                                            glowSpread={0.3}
                                        >
                                            Logging out...
                                        </NeonText>
                                    </>
                                ) : (
                                    <>
                                        <NeonIcon
                                            icon='lucide:log-out'
                                            size={22}
                                            glowColor={`--color-red-500`}
                                        />
                                        <NeonText
                                            as='span'
                                            className='text-base font-bold'
                                            glowColor={`--color-red-500`}
                                            glowSpread={0.3}
                                        >
                                            Log Out
                                        </NeonText>
                                    </>
                                )}
                            </Button>
                        </div>
                    </NeonBox>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default UserProfile;
