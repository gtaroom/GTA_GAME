import type { FC, ReactNode } from 'react';

import type { InputProps } from '@/components/ui/input';
import type { GameDataProps } from '@/types/global.type';

export interface CTAButton {
    text: string;
    href: string;
    target?: '_self' | '_blank';
    rel?: string;
}

export interface MediaAssetSet {
    background: string;
    main: string;
    cover?: string;
    alt?: string;
}

export interface BannerSlide {
    id: string;
    title: string;
    description: string;
    button: CTAButton;
    images: MediaAssetSet;
}

export interface TooltipContent {
    title?: string;
    description?: ReactNode;
}

export type PromotionColor = 'green' | 'purple' | 'blue' | 'pink' | 'yellow';

export interface PromotionSlide {
    id: string;
    title: string;
    description?: string;
    button?: CTAButton;
    images: MediaAssetSet;
    color?: PromotionColor;
    tooltip?: TooltipContent;
}

export interface LinkItem {
    id?: string;
    title: string;
    href?: string;
    icon?: string;
    color?: string;
    subLinks?: LinkItem[];
    isModal?: boolean;
    isModalContent?: ReactNode;
}

export interface FooterSection {
    id: string;
    title: string;
    links: LinkItem[];
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface SocialChannel {
    icon: string;
    title: string;
    description: string;
    buttonLabel: string;
    url: string;
    color:
        | '--color-blue-500'
        | '--color-pink-500'
        | '--color-sky-500'
        | '--color-purple-500'
        | '--color-red-500';
}

export interface CoinPackage {
    totalGC: string;
    bonusGC: string;
    tag?: string;
    price: string;
}

export interface WeeklyReward {
    day: number;
    SC: string;
    GC: string;
    claimed: boolean;
    message?: string;
}

export type WinnerUserType = 'Player' | 'Guest';
export type WinnerCoinType = 'sweep-coin' | 'gold-coin';

export interface LatestWinner {
    thumbnail: string;
    title: string;
    gameType: string;
    userName: string;
    userType: WinnerUserType;
    winAmmount: number;
    coinType: WinnerCoinType;
    color: string;
}

export type TransactionKind =
    | 'gc-purchased'
    | 'sc-redeemed'
    | 'redemption-paid';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface TransactionRecord {
    orderId: string;
    date: string;
    type: TransactionKind;
    amount: string;
    promotionalValue?: string;
    status: TransactionStatus;
    linkAvailable: boolean;
}

export interface VipFeature {
    label: string;
    icon: string;
    rightSec: string;
    isLock: boolean;
    color: string;
}

export interface VipTier {
    tier: string;
    image: string;
    color: string;
    features: VipFeature[];
}

export interface FeatureGamesCategory {
    title: string;
    games: GameDataProps[];
}

export interface IconComponentProps {
    className?: string;
    color?: string;
}

export interface FeatureTile {
    title: string;
    icon: {
        component: FC<IconComponentProps>;
        color: string;
    };
    modal: {
        title: string;
        content: ReactNode;
    };
}

export interface RichContentSection {
    title: ReactNode;
    description: ReactNode;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export type InputStylePreset = Required<
    Pick<
        InputProps,
        | 'size'
        | 'glowColor'
        | 'glowSpread'
        | 'backgroundColor'
        | 'backgroundOpacity'
        | 'borderColor'
    >
>;
