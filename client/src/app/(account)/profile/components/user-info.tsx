'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';

import VIPprogramBtn from '@/components/vip-program-btn';

import { useVip } from '@/contexts/vip-context';
import { getTierColor, getTierImage } from '@/lib/vip-utils';

import Image from 'next/image';

import NeonIcon from '@/components/neon/neon-icon';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { uploadAvatar } from '@/lib/api/auth';
import { formatNumber } from '@/lib/utils';
import { useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import AccountPageTitle from './account-page-title';
import ChangePasswordForm from './change-password-form';
import EditUserInfoForm from './edit-user-Info-form';

export default function UserInfo() {
    const { lg, xxl } = useBreakPoint();
    const [ref, { width: avatarWidth }] = useMeasure();
    const { user, setUser } = useAuth();
    const { balance: walletBalance } = useWalletBalance();
    const { vipStatus } = useVip();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Get user display name
    const getUserDisplayName = () => {
        if (!user) return 'Guest User';
        const { first, middle, last } = user.name;
        return [first, middle, last].filter(Boolean).join(' ');
    };

    // Get user avatar URL
    const getUserAvatar = () => {
        if (user?.avatar?.url)
            return `${process.env.NEXT_PUBLIC_IMAGE_URL}/public/${user.avatar.url}`;
        return '/account/avatar.jpg'; // Default avatar
    };

    // Handle avatar click to trigger file input
    const handleAvatarClick = () => {
        if (isUploading) return; // Prevent clicks during upload
        fileInputRef.current?.click();
    };

    // Validate file is an image
    const isImageFile = (file: File): boolean => {
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        return validTypes.includes(file.type);
    };

    // Handle file selection and upload
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!isImageFile(file)) {
            setUploadError(
                'Please upload an image file (JPEG, PNG, GIF, or WebP)'
            );
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setUploadError('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const response = (await uploadAvatar(file)) as any;

            if (response.success && response.data?.avatar) {
                // Update user context with new avatar
                setUser({
                    ...user!,
                    avatar: response.data.avatar,
                });
            } else {
                setUploadError(response.message || 'Failed to upload avatar');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload avatar'
            );
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Get user badge stats with real data
    const userBadgeStats = [
        {
            type: 'bonusGC',
            image: '/coins/gold-coin.svg',
            display: {
                text: `${formatNumber(user?.balance || 0)} GC`,
                color: '--color-yellow-300',
            },
            color: '--color-yellow-500',
            label: 'Gold Coins',
            description:
                'Play-for-fun mode. Used for bonus games, daily rewards, and casual gameplay.',
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
                'Play-for-fun mode. Used to access exclusive and signature games for entertainment only.',
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
            description:
                'Promotional play mode. Used for sweepstakes-style games available in supported regions per terms.',
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
            label: 'VIP Tier',
            description: 'Your current VIP status',
        },
    ];

    const EditButton = ({ className }: { className?: string }) => (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={xxl ? 'lg' : 'md'} className={className}>
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className='lg:max-w-[800px]! sm:max-w-[calc(100%-48px)]! max-w-[calc(100%-24px)]'>
                <DialogTitle asChild>
                    <NeonText
                        as='h4'
                        className='h4-title text-center pt-4 mb-6'
                    >
                        Edit Profile
                    </NeonText>
                </DialogTitle>
                <EditUserInfoForm />
            </DialogContent>
        </Dialog>
    );

    const ChangePasswordButton = ({ className }: { className?: string }) => (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size={xxl ? 'lg' : 'md'}
                    variant='secondary'
                    className={className}
                >
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className='lg:max-w-[500px]! sm:max-w-[calc(100%-48px)]! max-w-[calc(100%-24px)]'>
                <DialogTitle asChild>
                    <NeonText
                        as='h4'
                        className='h4-title text-center pt-4 mb-6'
                    >
                        Change Password
                    </NeonText>
                </DialogTitle>
                <ChangePasswordForm />
            </DialogContent>
        </Dialog>
    );

    return (
        <section className='mb-14'>
            <AccountPageTitle className='max-lg:text-center max-lg:mb-8 mb-10'>
                Player Profile
            </AccountPageTitle>

            {/* Error message */}
            {uploadError && (
                <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg'>
                    <NeonText className='text-red-400 text-sm'>
                        {uploadError}
                    </NeonText>
                </div>
            )}

            <div className='flex items-center max-lg:flex-col max-lg:text-center xxl:gap-10 lg:gap-8 gap-6 lg:mb-10 mb-2'>
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                    onChange={handleFileChange}
                    className='hidden'
                    aria-label='Upload avatar'
                />

                <NeonBox
                    neonBoxRef={ref}
                    glowSpread={0.8}
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.2}
                    className={`p-2 xl:w-[220px] lg:w-[240px] md:w-[200px] w-[160px] aspect-square rounded-full backdrop-blur-2xl relative group ${
                        isUploading ? 'pointer-events-none' : 'cursor-pointer'
                    }`}
                >
                    <Image
                        src={getUserAvatar()}
                        width={200}
                        height={200}
                        alt='Profile Avatar'
                        className='h-full w-full object-cover object-center rounded-full'
                    />

                    {/* Upload overlay */}
                    <button
                        onClick={handleAvatarClick}
                        disabled={isUploading}
                        className={`absolute inset-0 bg-black/60 w-full h-full grid place-items-center rounded-full transition-all duration-300 ${
                            isUploading
                                ? 'visible opacity-100'
                                : 'invisible opacity-0 group-hover:visible group-hover:opacity-100'
                        }`}
                        aria-label='Change avatar'
                    >
                        {isUploading ? (
                            <div className='flex flex-col items-center gap-2'>
                                <Icon
                                    icon='lucide:loader-2'
                                    className='xl:text-4xl text-3xl animate-spin'
                                />
                                <span className='text-xs font-bold'>
                                    Uploading...
                                </span>
                            </div>
                        ) : (
                            <span className='text-xs font-bold'>
                                <Icon
                                    icon='lucide:image'
                                    className='xl:text-4xl text-3xl'
                                />
                            </span>
                        )}
                    </button>
                </NeonBox>

                <div className='flex flex-col max-lg:items-center lg:gap-7 gap-5 '>
                    <span className='h1-title font-extrabold!'>
                        {getUserDisplayName()}
                    </span>

                    {!lg && (
                        <div className='flex gap-3 mb-4'>
                            <EditButton />
                            <ChangePasswordButton />
                        </div>
                    )}

                    <div className='flex items-center max-lg:justify-center xl:gap-6 gap-5 flex-wrap'>
                        {userBadgeStats.map((badge, index) => (
                            <NeonBox
                                key={index}
                                glowColor={badge.color}
                                glowSpread={0.5}
                                backgroundColor={badge.color}
                                backgroundOpacity={0.2}
                                className='xl:px-4 px-3 xl:py-3 py-2 rounded-md backdrop-blur-2xl inline-flex items-center xl:gap-3 gap-2'
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
                                        className='xxl:text-xl xl:text-lg text-base font-extrabold! uppercase'
                                        glowColor={badge.color}
                                        color={badge.display.color}
                                        glowSpread={
                                            badge.display.neon ? 0.2 : 0
                                        }
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
                                                            {badge.label}
                                                        </div>
                                                        <div className='text-sm text-white opacity-90'>
                                                            {badge.description}
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </NeonBox>
                        ))}
                    </div>
                </div>

                <div className='flex items-center max-lg:flex-col justify-end xxl:gap-12 xl:gap-10 gap-6 lg:ms-auto flex-1'>
                    <VIPprogramBtn className='xxl:w-[240px] xl:w-[220px] w-[200px]' />
                    {/* <Button size={xxl ? 'lg' : 'md'} variant='secondary'>
                        Admin Dashboard
                    </Button> */}
                </div>
            </div>

            {lg && (
                <div
                    className='ml-20 p-5 flex items-center justify-center gap-3'
                    style={{ width: lg ? `${avatarWidth}px` : 'auto' }}
                >
                    <EditButton />
                    <ChangePasswordButton />
                </div>
            )}
        </section>
    );
}
