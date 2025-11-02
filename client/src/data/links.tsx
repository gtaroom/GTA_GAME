import PrivacyRequestForm from '@/components/modal/privacy-request-form';
import SweepstakesSpinModal from '@/components/modal/sweepstakes-spin';

// Link Types
export interface LinkProps {
    id?: string;
    title: string;
    href?: string;
    icon?: string;
    color?: string;
    subLinks?: LinkProps[];
    isModal?: boolean;
    isModalContent?: React.ReactNode;
}

// Helper function to get smart href based on auth status
export const getSmartHref = (href?: string, isLoggedIn?: boolean) => {
    if (!href) return undefined;
    return href === '/' && isLoggedIn ? '/lobby' : href;
};

// GLOBAL/SHARED LINKS - Used in multiple locations

const homeLink: LinkProps = {
    title: 'Home',
    href: '/',
    icon: 'lucide:home',
    color: 'green',
};

const gamesLink: LinkProps = {
    title: 'Games',
    href: '/game-listing',
};

const aboutLink: LinkProps = {
    title: 'About Us',
    href: '/about-us',
};

const supportLink: LinkProps = {
    title: 'Support',
    href: '/support',
    icon: 'lucide:headset',
    color: 'red',
};

const communityLink: LinkProps = {
    title: 'Community',
    href: '/community',
    icon: 'lucide:earth',
    color: 'red',
};

const myProfileLink: LinkProps = {
    title: 'My Profile',
    href: '/profile',
    icon: 'lucide:circle-user-round',
    color: 'amber',
};

const coinWalletLink: LinkProps = {
    title: 'Coin Wallet',
    href: '/buy-redeem',
    icon: 'lucide:wallet',
    color: 'lime',
};

const vipProgramLink: LinkProps = {
    title: 'VIP Program',
    href: '/vip-program',
    icon: 'lucide:crown',
    color: 'fuchsia',
};

const transactionHistoryLink: LinkProps = {
    title: 'Transaction History',
    href: '/transaction-history',
    icon: 'lucide:clipboard-list',
    color: 'cyan',
};

const howItWorkLink: LinkProps = {
    title: 'How It Works',
    href: '/how-it-works',
    icon: 'lucide:columns-settings',
    color: 'pink',
};

const faqsLink: LinkProps = {
    title: 'FAQs',
    href: '/faqs',
    icon: 'lucide:circle-question-mark',
    color: 'orange',
};

// SPECIFIC LINKS - Used only once or in single context

const gameSubLinks: LinkProps[] = [
    {
        title: 'Bonus Games',
        href: '/game-listing?tab=bonus',
        icon: 'lucide:coins',
        color: 'purple',
    },
    {
        title: 'Exclusive Games',
        href: '/game-listing?tab=exclusive',
        icon: 'lucide:stars',
        color: 'indigo',
    },
    {
        title: 'Signature Games',
        href: '/game-listing?tab=signature',
        icon: 'lucide:swords',
        color: 'violet',
    },
    // {
    //     title: 'Slots Games',
    //     href: '/game-listing',
    //     icon: 'icon-park-outline:seven-key',
    //     color: 'teal',
    // },
    // {
    //     title: 'Fish Games',
    //     href: '/game-listing',
    //     icon: 'lucide:fish',
    //     color: 'blue',
    // },
    {
        title: 'All Games',
        href: '/game-listing?tab=all',
        icon: 'lucide:star',
        color: 'rose',
    },
];

// Social Links
const socialLinks = {
    youtube: {
        title: 'YouTube',
        href: 'https://www.youtube.com/@GoldenTicketArcade/shorts',
        icon: '/social-icons/youtube.svg',
    },
    instagram: {
        title: 'Instagram',
        href: 'https://www.instagram.com/golden_ticketfam/',
        icon: '/social-icons/instagram.svg',
    },
    tiktok: {
        title: 'TikTok',
        href: 'https://www.tiktok.com/@gtoa_gdrs?is_from_webapp=1&sender_device=pc',
        icon: '/social-icons/tik-tok.svg',
    },
} as const;

// One-off links for specific sections
const uniqueLinks = {
    promotions: {
        title: 'Promotions',
        href: '#',
        icon: 'lucide:speech',
        color: 'sky',
    },
    affiliate: {
        title: 'Affiliate Program',
        href: '/affiliate',
        icon: 'lucide:heart-handshake',
        color: 'indigo',
    },
    referFriend: {
        title: 'Refer a Friend',
        href: '/refer-friend',
        icon: 'lucide:users',
        color: 'violet',
    },
    adminDashboard: {
        title: 'Admin Dashboard',
        href: '#',
        icon: 'tabler:dashboard',
        color: 'green',
    },
    redeem: {
        title: 'Redeem',
        href: '/redeem',
        icon: 'material-symbols:redeem',
        color: 'green',
    },
    termsRules: {
        title: 'Terms & Rules',
        href: '#',
        icon: 'lucide:scroll-text',
        color: 'pink',
    },
    freeEntryForm: {
        id: 'free-entry-form',
        title: 'Free Entry Form',
        isModal: true,
        isModalContent: <SweepstakesSpinModal />,
    },
    privacyRequestForm: {
        id: 'privacy-request-form',
        title: 'Privacy Request Form',
        isModal: true,
        isModalContent: <PrivacyRequestForm />,
    },
    vipStatus: {
        title: 'VIP Status',
        href: 'vip-program',
    },
    gameHistory: {
        title: 'Game History',
        href: '/game-history',
    },
    notifications: {
        title: 'Notifications',
        href: '/notifications',
    },
} as const;

const legalLinks = {
    termsConditions: {
        title: 'Terms & Conditions',
        href: '/terms-conditions',
    },
    privacyPolicy: {
        title: 'Privacy Policy',
        href: '/privacy-policy',
    },
    agePolicy: {
        title: 'Age Policy',
        href: '/age-verification-policy',
    },
    refundPolicy: {
        title: 'Refund Policy',
        href: '#',
    },
    accessibility: {
        title: 'Accessibility',
        href: '/accessibility-statement',
    },
    sweepstakesRules: {
        title: 'Sweepstakes Rules',
        href: '/sweepstakes-rules',
    },
    responsibleGaming: {
        title: 'Responsible Gaming',
        href: '/responsible-gameplay-policy',
    },
    smsTerms: {
        title: 'SMS Terms',
        href: '/sms-terms',
    },
} as const;

// EXPORTED LINK ARRAYS - Organized by usage context

// Header Links
export const headerLinks: LinkProps[] = [
    homeLink,
    gamesLink,
    aboutLink,
    supportLink,
    communityLink,
];

// Footer Links
export const footerQuickLinks: LinkProps[] = [
    homeLink,
    aboutLink,
    gamesLink,
    howItWorkLink,
    supportLink,
    faqsLink,
    communityLink,
    uniqueLinks.freeEntryForm,
    // uniqueLinks.privacyRequestForm,
];

export const footerAccountLinks: LinkProps[] = [
    myProfileLink,
    coinWalletLink,
    uniqueLinks.vipStatus,
    transactionHistoryLink,
    // uniqueLinks.gameHistory,
    // uniqueLinks.notifications,
];

export const footerLegalLinks: LinkProps[] = [
    legalLinks.termsConditions,
    legalLinks.privacyPolicy,
    legalLinks.agePolicy,
    legalLinks.refundPolicy,
    legalLinks.accessibility,
    legalLinks.sweepstakesRules,
    legalLinks.responsibleGaming,
    legalLinks.smsTerms,
];

export const footerSocialLinks: LinkProps[] = [
    socialLinks.youtube,
    socialLinks.instagram,
    socialLinks.tiktok,
];

// Sidebar Links
export const sidebarLinks: LinkProps[] = [
    homeLink,
    {
        title: 'All Games',
        icon: 'lucide:gamepad-2',
        color: 'cyan',
        subLinks: gameSubLinks,
    },
    myProfileLink,
    coinWalletLink,
    // uniqueLinks.promotions,
    vipProgramLink,
    // uniqueLinks.affiliate,
    // uniqueLinks.referFriend,
    communityLink,
];

export const sidebarLinksBottom: LinkProps[] = [
    howItWorkLink,
    // faqsLink,
    supportLink,
    // uniqueLinks.termsRules,
];

// Profile Dropdown
export const profileDropdownLinks: LinkProps[] = [
    myProfileLink,
    // uniqueLinks.adminDashboard,
    vipProgramLink,
    coinWalletLink,
    transactionHistoryLink,
    uniqueLinks.redeem,
];
