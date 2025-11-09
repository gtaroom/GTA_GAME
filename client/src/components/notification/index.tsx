'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    useNotificationBadge,
    useNotifications,
} from '@/contexts/notification-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { formatDistanceToNow } from '@/lib/date-utils';
import type { Notification as NotificationType } from '@/types/notification.types';
import { type ReactNode } from 'react';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';

function Dot({ className }: { className?: string }) {
    return (
        <svg
            width='6'
            height='6'
            fill='currentColor'
            viewBox='0 0 6 6'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
            aria-hidden='true'
        >
            <circle cx='3' cy='3' r='3' />
        </svg>
    );
}

// Helper to get notification ID
const getNotificationId = (notification: NotificationType): string => {
    return (
        notification._id || notification.id || notification.notificationId || ''
    );
};

// Helper to format timestamp
const formatTimestamp = (timestamp: Date): string => {
    try {
        return formatDistanceToNow(new Date(timestamp));
    } catch {
        return 'Unknown time';
    }
};

// Render notification content based on type
function NotificationContent({
    notification,
}: {
    notification: NotificationType;
}) {
    const { type } = notification;
    // Add logging
    console.log('🔔 Rendering notification:', type, notification);

    switch (type) {
        case 'deposit_success': {
            const n = notification as typeof notification & {
                amount: number;
                coins: number;
                metadata?: {
                    amount?: number;
                };
            };
            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon='lucide:check-circle'
                            size={18}
                            className='text-green-500 flex-shrink-0 mt-0.5'
                        />
                        <div className='flex-1'>
                            <p className='font-semibold text-green-400'>
                                Payment Successful! 🎉
                            </p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                Your payment of ${n.amount ||
                                    (n.metadata?.amount
                                        ? n.metadata.amount
                                        : 0)}{' '} has been processed.{' '}
                                {n.coins} Gold Coins added to your wallet.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        case 'recharge_status_updated': {
            const n = notification as typeof notification & {
                status: string;
                amount: number;
                message: string;
                gameName?: string;
                metadata?: {
                    status?: string;
                    amount?: number;
                    message?: string;
                    gameName?: string;
                };
            };
            const isApproved =
                n.status === 'approved' || n.metadata?.status === 'approved';
            const isRejected =
                n.status === 'rejected' || n.metadata?.status === 'rejected';

            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon={
                                isApproved
                                    ? 'lucide:check-circle'
                                    : isRejected
                                      ? 'lucide:x-circle'
                                      : 'lucide:clock'
                            }
                            size={18}
                            className={`flex-shrink-0 mt-0.5 ${isApproved ? 'text-green-500' : isRejected ? 'text-red-500' : 'text-yellow-500'}`}
                        />
                        <div className='flex-1'>
                            <p className='font-semibold'>
                                Deposit Status Updated
                            </p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                Your deposit request for $
                                {n.amount ||
                                    (n.metadata?.amount
                                        ? n.metadata.amount / 100
                                        : 0)}{' '}
                                {n.gameName ||
                                    (n.metadata?.gameName &&
                                        `in ${n.gameName || n.metadata?.gameName}`)}{' '}
                                is now{' '}
                                <span className='font-semibold'>
                                    {n.status || n.metadata?.status}
                                </span>
                                .
                            </p>
                            {n.message && (
                                <p className='text-xs text-foreground/60 mt-1'>
                                    {n.message || n.metadata?.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        case 'withdrawal_status_updated': {
            const n = notification as typeof notification & {
                status: string;
                amount: number;
                message: string;
                checkoutUrl?: string;
                metadata?: {
                    status?: string;
                    amount?: number;
                    message?: string;
                    checkoutUrl?: string;
                };
            };
            const isApproved =
                n.status === 'approved' || n.metadata?.status === 'approved';
            const isRejected =
                n.status === 'rejected' || n.metadata?.status === 'rejected';

            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon={
                                isApproved
                                    ? 'lucide:check-circle'
                                    : isRejected
                                      ? 'lucide:x-circle'
                                      : 'lucide:clock'
                            }
                            size={18}
                            className={`flex-shrink-0 mt-0.5 ${isApproved ? 'text-green-500' : isRejected ? 'text-red-500' : 'text-yellow-500'}`}
                        />
                        <div className='flex-1'>
                            <p className='font-semibold'>
                                Withdrawal Status Updated
                            </p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                Your withdrawal request for $
                                {n.amount || n.metadata?.amount} is now{' '}
                                <span className='font-semibold'>
                                    {n.status || n.metadata?.status}
                                </span>
                                .
                            </p>
                            {n.message && (
                                <p className='text-xs text-foreground/60 mt-1'>
                                    {n.message || n.metadata?.message}
                                </p>
                            )}
                            {n.checkoutUrl ||
                                (n.metadata?.checkoutUrl && (
                                    <a
                                        href={
                                            n.checkoutUrl ||
                                            n.metadata?.checkoutUrl
                                        }
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-xs text-blue-400 hover:underline mt-1 inline-block'
                                    >
                                        Complete Withdrawal →
                                    </a>
                                ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'payment_received': {
            const n = notification as typeof notification & {
                amount: number;
                currency: string;
                paymentGateway: string;
            };
            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon='lucide:dollar-sign'
                            size={18}
                            className='text-green-500 flex-shrink-0 mt-0.5'
                        />
                        <div className='flex-1'>
                            <p className='font-semibold'>Payment Received</p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                You received {n.amount} {n.currency} via{' '}
                                {n.paymentGateway}.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        case 'game_account_approved': {
            const n = notification as typeof notification & {
                gameName: string;
                generatedUsername: string;
                generatedPassword: string;
            };
            // Add this logging
            console.log('🎮 Game account approved notification:', {
                gameName: n.gameName,
                username: n.generatedUsername,
                password: n.generatedPassword,
                raw: n,
            });
            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon='lucide:check-circle'
                            size={18}
                            className='text-green-500 flex-shrink-0 mt-0.5'
                        />
                        <div className='flex-1'>
                            <p className='font-semibold text-green-400'>
                                Game Account Approved! 🎉
                            </p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                Your {n.gameName} account has been approved!
                            </p>
                            <div className='text-xs text-foreground/70 mt-2 space-y-1'>
                                <p>
                                    <span className='font-semibold'>
                                        Username:
                                    </span>{' '}
                                    {n.generatedUsername}
                                </p>
                                <p>
                                    <span className='font-semibold'>
                                        Password:
                                    </span>{' '}
                                    {n.generatedPassword}
                                </p>
                            </div>
                            <p className='text-xs text-yellow-500 mt-1'>
                                Please save these credentials securely!
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        case 'game_account_rejected': {
            const n = notification as typeof notification & {
                gameName: string;
                adminNotes?: string;
            };
            return (
                <div className='space-y-1'>
                    <div className='flex items-start gap-2'>
                        <NeonIcon
                            icon='lucide:x-circle'
                            size={18}
                            className='text-red-500 flex-shrink-0 mt-0.5'
                        />
                        <div className='flex-1'>
                            <p className='font-semibold'>
                                Game Account Request Rejected
                            </p>
                            <p className='text-xs text-foreground/80 mt-1'>
                                Your request for a {n.gameName} account has been
                                rejected.
                            </p>
                            {n.adminNotes && (
                                <p className='text-xs text-foreground/60 mt-1'>
                                    <span className='font-semibold'>
                                        Reason:
                                    </span>{' '}
                                    {n.adminNotes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        default:
            return (
                <div className='text-xs text-foreground/60'>
                    Unknown notification type
                </div>
            );
    }
}

export function Notification({ children }: { children: ReactNode }) {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearReadNotifications,
    } = useNotifications();
    const { md } = useBreakPoint();

    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                className='xs:w-96 w-80 max-h-[500px] overflow-y-auto'
                align={md ? 'center' : 'end'}
            >
                <div className='flex items-baseline justify-between gap-4 px-3 py-2 sticky top-0 bg-background z-10'>
                    <div className='text-sm font-semibold'>Notifications</div>
                    <div className='flex gap-2'>
                        {unreadCount > 0 && (
                            <button
                                className='text-xs font-medium hover:underline outline-0'
                                onClick={markAllAsRead}
                                disabled={isLoading}
                            >
                                Mark all as read
                            </button>
                        )}
                        {notifications.filter(n => n.read).length > 0 && (
                            <button
                                className='text-xs font-medium hover:underline outline-0 text-red-400'
                                onClick={clearReadNotifications}
                                disabled={isLoading}
                            >
                                Clear read
                            </button>
                        )}
                    </div>
                </div>
                <div
                    role='separator'
                    aria-orientation='horizontal'
                    className='-mx-1 my-1 h-px bg-neutral-600'
                ></div>
                {isLoading ? (
                    <div className='p-4 text-center flex items-center justify-center gap-2'>
                        <NeonIcon
                            icon='svg-spinners:bars-rotate-fade'
                            size={20}
                        />
                        <span className='text-sm text-muted-foreground'>
                            Loading...
                        </span>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div
                            key={getNotificationId(notification)}
                            className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-neutral-700/50 ${
                                !notification.read ? 'bg-neutral-800/30' : ''
                            }`}
                        >
                            <div className='relative flex items-start'>
                                <div className='flex-1 space-y-1 pr-6'>
                                    <NotificationContent
                                        notification={notification}
                                    />
                                    <div className='text-muted-foreground text-xs mt-2'>
                                        {formatTimestamp(
                                            notification.timestamp
                                        )}
                                    </div>
                                </div>
                                <div className='absolute top-0 right-0 flex items-center gap-1'>
                                    {!notification.read && (
                                        <>
                                            <div className='self-start mt-1'>
                                                <span className='sr-only'>
                                                    Unread
                                                </span>
                                                <Dot />
                                            </div>
                                            <button
                                                onClick={() =>
                                                    markAsRead(
                                                        getNotificationId(
                                                            notification
                                                        )
                                                    )
                                                }
                                                className='p-1 hover:bg-neutral-600 rounded transition-colors'
                                                aria-label='Mark as read'
                                                disabled={isLoading}
                                                title='Mark as read'
                                            >
                                                <NeonIcon
                                                    icon='lucide:check'
                                                    size={14}
                                                />
                                            </button>
                                        </>
                                    )}
                                    {/* <button
                                        onClick={() =>
                                            dismissNotification(
                                                getNotificationId(notification)
                                            )
                                        }
                                        className='p-1 hover:bg-neutral-600 rounded transition-colors'
                                        aria-label='Delete notification'
                                        disabled={isLoading}
                                        title='Delete notification'
                                    >
                                        <NeonIcon icon='lucide:x' size={14} />
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='p-4 text-center text-sm text-muted-foreground'>
                        No new notifications
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

function NotificationBadge() {
    const { unreadCount } = useNotifications();
    const showBadge = useNotificationBadge();

    if (!showBadge || unreadCount === 0) {
        return null;
    }

    return (
        <NeonBox
            className='absolute md:-top-2 -top-1.5 md:-right-2 -right-1.5 grid md:h-6 md:w-6 md:min-w-6 w-5.5 h-5.5 min-w-5.5 place-items-center rounded-full px-1'
            backgroundColor='--color-purple-500'
        >
            <span className='md:text-xs md:font-bold font-semibold text-[10px] leading-none'>
                {unreadCount > 99 ? '99+' : unreadCount}
            </span>
        </NeonBox>
    );
}

export function NotificationTrigger({ children }: { children: ReactNode }) {
    return (
        <div className='relative'>
            {children}
            <NotificationBadge />
        </div>
    );
}

export function NotificationBell() {
    return (
        <NeonBox
            className='grid lg:h-el-md lg:w-el-md h-el-sm w-el-sm select-none cursor-pointer place-items-center rounded-full backdrop-blur-lg'
            backgroundColor='--color-purple-500'
            backgroundOpacity={0.2}
            enableHover
            glowSpread={0.6}
        >
            <NeonIcon icon='lucide:bell' size={20} />
        </NeonBox>
    );
}
