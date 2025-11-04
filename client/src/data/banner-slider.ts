interface BannerSliderDataProps {
    id: string;
    title: string;
    description: string;
    button: {
        text: string;
        href: string;
    };
    images: {
        background: string;
        main: string;
        cover?: string;
    };
}

export const bannerSliderData: BannerSliderDataProps[] = [
    {
        id: 'rewards-unlock',
        title: 'Spin to Unlock More!',
        description: 'Level up to unlock exciting rewards and spins.',
        button: {
            text: 'View Rewards',
            href: '/vip-program',
        },
        images: {
            background: '/banner-slider/backgrounds/rewards-unlock.jpg',
            main: '/banner-slider/main/rewards-unlock.png',
        },
    },
    {
        id: 'friend-referral',
        title: 'Invite Friends, Unlock Rewards',
        description: 'Get bonus spins for every friend who joins.',
        button: {
            text: 'Refer Now',
            href: '/refer-friend',
        },
        images: {
            background: '/banner-slider/backgrounds/friend-referral.jpg',
            main: '/banner-slider/main/friend-referral.png',
        },
    },
    {
        id: 'player-favorites',
        title: 'Discover Player Favorites',
        description:
            'From timeless classics to hidden gems, find your next favorite game here.',
        button: {
            text: 'Explore Games',
            href: '/game-listing',
        },
        images: {
            background: '/banner-slider/backgrounds/player-favorites.jpg',
            main: '/banner-slider/main/player-favorites.png',
            cover: '/banner-slider/covers/player-favorites.png',
        },
    },
    {
        id: 'daily-surprises',
        title: 'Daily Surprises Await!',
        description: 'Check back daily for new free-play opportunities.',
        button: {
            text: "See What's New",
            href: 'https://web.facebook.com/Goldenticketonlinearcade',
        },
        images: {
            background: '/banner-slider/backgrounds/daily-surprises.jpg',
            main: '/banner-slider/main/daily-surprises.png',
        },
    },
    {
        id: 'community-join',
        title: 'Join Our Community',
        description: 'Stay updated and win shoutouts on our socials.',
        button: {
            text: 'Follow Now',
            href: '/community',
        },
        images: {
            background: '/banner-slider/backgrounds/community-join.jpg',
            main: '/banner-slider/main/community-join.png',
        },
    },
];
