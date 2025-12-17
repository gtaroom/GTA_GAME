import Image from 'next/image';

export interface PromotionItem {
    id: string;
    title: string;
    description?: string;
    button?: {
        text: string;
        href: string;
    };
    images: {
        background: string;
        main: string;
        cover?: string;
    };
    color?: 'green' | 'purple' | 'blue' | 'pink' | 'yellow';
    tooltip?: {
        title?: string;
        description?: React.ReactNode;
    };
}

export const promotionsSliderData: PromotionItem[] = [
    {
        id: 'daily-bonus-boost',
        title: 'Daily Bonus Boost',
        description: 'Available Daily · Auto-Applies at Checkout',
        button: {
            text: 'Claim Bonus',
            href: '#',
        },
        images: {
            background: '/promotions-slider/backgrounds/daily-bonus-boost.jpg',
            main: '/promotions-slider/main/daily-bonus-boost.png',
        },
        color: 'green',
        tooltip: {
            title: 'Make a Purchase Today and Get Bonus Gold Coins!',
            description: (
                <ul>
                    {[
                        '500 GC + 100 Bonus GC – $5',
                        '1,000 GC + 200 Bonus GC – $10',
                        '2,000 GC + 300 Bonus GC – $20',
                        '4,000 GC + 500 Bonus GC – $40',
                        '6,000 GC + 600 Bonus GC – $60',
                    ].map((item, index) => (
                        <li key={index} className='flex items-center gap-2'>
                            <Image
                                src='/coins/gold-coin.svg'
                                height={20}
                                width={20}
                                className='h-5 w-5'
                                alt='gold-coin'
                            />
                            {item}
                        </li>
                    ))}
                </ul>
            ),
        },
    },
    {
        id: 'level-up-unlock-more',
        title: 'Level Up & Unlock More',
        description: 'Keep Playing · Unlock More',
        button: {
            text: 'Play to Unlock',
            href: '/vip-program',
        },
        images: {
            background:
                '/promotions-slider/backgrounds/level-up-unlock-more.jpg',
            main: '/promotions-slider/main/level-up-unlock-more.png',
        },
        color: 'purple',
        tooltip: {
            title: 'Play More to Unlock Exclusive Perks!',
            description: (
                <ul>
                    {[
                        'Hit milestones to unlock premium perks',
                        'Unlock exclusive rewards as you advance',
                        'Higher levels = better limited-time boosts',
                    ].map((item, index) => (
                        <li key={index} className='list-disc list-inside'>
                            {item}
                        </li>
                    ))}
                </ul>
            ),
        },
    },
    {
        id: 'invite-friends-rewards',
        title: 'Invite Friends Get Rewarded',
        description: 'Rewards Apply Instantly After Signup',
        button: {
            text: 'Copy Link',
            href: '#',
        },
        images: {
            background:
                '/promotions-slider/backgrounds/invite-friends-rewards.jpg',
            main: '/promotions-slider/main/invite-friends-rewards.png',
        },
        color: 'blue',
        tooltip: {
            title: 'Share the Fun, Get Bonus Coins',
            description: (
                <ul>
                    {[
                        'Invite friends with your link',
                        'Earn Bonus Gold Coins on activation',
                        'Instant rewards for successful joins',
                    ].map((item, index) => (
                        <li key={index} className='list-disc list-inside'>
                            {item}
                        </li>
                    ))}
                </ul>
            ),
        },
    },
    {
        id: 'weekly-spin-boost',
        title: 'Weekly Spin Boost',
        description: "Don't Miss This Week's Spin",
        button: {
            text: 'Spin Now',
            href: '#',
        },
        images: {
            background: '/promotions-slider/backgrounds/weekly-spin-boost.jpg',
            main: '/promotions-slider/main/weekly-spin-boost.png',
        },
        color: 'pink',
        tooltip: {
            title: 'Log In Weekly for a Free Bonus Spin!',
            description: (
                <ul>
                    {[
                        'One free spin every 7 days',
                        'Win Bonus Gold Coins or exclusive perks',
                        'Spins reset each week',
                    ].map((item, index) => (
                        <li key={index} className='list-disc list-inside'>
                            {item}
                        </li>
                    ))}
                </ul>
            ),
        },
    },
    {
        id: 'double-reward-days',
        title: 'Double Reward Days',
        description: 'Active During Limited Bonus Times',
        button: {
            text: 'View Details',
            href: '#',
        },
        images: {
            background: '/promotions-slider/backgrounds/double-reward-days.jpg',
            main: '/promotions-slider/main/double-reward-days.png',
        },
        color: 'purple',
        tooltip: {
            title: 'Earn Twice the Bonus During Boost Hours!',
            description: (
                <ul>
                    {[
                        'Play during special Double Reward events',
                        'Earn 2x Bonus GC while playing',
                        'More play = more rewards',
                    ].map((item, index) => (
                        <li key={index} className='list-disc list-inside'>
                            {item}
                        </li>
                    ))}
                </ul>
            ),
        },
    },
];
