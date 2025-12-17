import {
    GiftIcon,
    GoldCoinPurchasesIcon,
    GoldCoinsIcon,
    MailIcon,
} from '@/app/(home)/components/feature-tiels-icons';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import SweepstakesSpinModal from '@/components/modal/sweepstakes-spin';
import { FeatureTile } from '@/types/content.types';
import type { GameDataProps } from '@/types/global.type';

type FeatureGamesCategory = {
    title: string;
    games: GameDataProps[];
};

export const featureGamesData: FeatureGamesCategory[] = [
    {
        title: 'Bonus Games',
        games: [
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
        ],
    },
    {
        title: 'Exclusive games',
        games: [
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
        ],
    },
    {
        title: 'Signature games',
        games: [
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
        ],
    },
    {
        title: 'New Releases',
        games: [
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },

            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },

            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
        ],
    },
    {
        title: 'Slots',
        games: [
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },

            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },

            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
        ],
    },
    {
        title: 'Fish Games',
        games: [
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'juwa',
                title: 'Welcome to Fabulous Juwa',
                provider: 'Juwa Online',
                thumbnail: '/game-thumbnails/11.jpg',
                badge: 'limited-time',
                color: 'sky',
            },
            {
                id: 'cash-frenzy',
                title: 'Cash Frenzy',
                provider: 'Vegas Studio',
                thumbnail: '/game-thumbnails/12.jpg',
                badge: 'top-pick',
                color: 'indigo',
            },
            {
                id: 'game-vault',
                title: 'Game Vault',
                provider: 'Vault Play',
                thumbnail: '/game-thumbnails/13.jpg',
                badge: 'free-to-play',
                color: 'violet',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'easy-street',
                title: 'Easy Street',
                provider: 'Street Play',
                thumbnail: '/game-thumbnails/16.jpg',
                badge: 'bonus-available',
                color: 'lime',
            },
            {
                id: 'ultra-panda',
                title: 'Ultra Panda',
                provider: 'Bamboo Labs',
                thumbnail: '/game-thumbnails/7.jpg',
                badge: 'free-to-play',
                color: 'blue',
            },
        ],
    },
    {
        title: 'All games',
        games: [
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'ace-book',
                title: 'Ace Book',
                provider: 'Sharkbyte',
                thumbnail: '/game-thumbnails/5.jpg',
                badge: 'top-pick',
                color: 'red',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'ocean-king-ii',
                title: 'Ocean King II',
                provider: 'Neptune Studio',
                thumbnail: '/game-thumbnails/1.jpg',
                badge: 'free-to-play',
                color: 'cyan',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'golden-dragon',
                title: 'Golden Dragon',
                provider: 'DragonForge',
                thumbnail: '/game-thumbnails/8.jpg',
                badge: 'popular',
                color: 'green',
            },
            {
                id: 'ten-times-win',
                title: '10X Ten Times Win',
                provider: 'Fortune Spin',
                thumbnail: '/game-thumbnails/9.jpg',
                badge: 'bonus-available',
                color: 'emerald',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'wild-buffalo',
                title: 'Wild Buffalo',
                provider: 'Prairie Play',
                thumbnail: '/game-thumbnails/6.jpg',
                badge: 'bonus-available',
                color: 'purple',
            },
            {
                id: 'gameroom-online',
                title: 'Gameroom Online',
                provider: 'Casino Hub',
                thumbnail: '/game-thumbnails/14.jpg',
                badge: 'top-pick',
                color: 'fuchsia',
            },
            {
                id: 'orion-stars',
                title: 'Orion Stars',
                provider: 'Galaxy Gaming',
                thumbnail: '/game-thumbnails/15.jpg',
                badge: 'new',
                color: 'amber',
            },
            {
                id: 'blue-dragon',
                title: 'Blue Dragon',
                provider: 'Mythic Play',
                thumbnail: '/game-thumbnails/10.jpg',
                badge: 'popular',
                color: 'teal',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
            {
                id: 'crystal-clovers',
                title: 'Crystal Clovers',
                provider: 'Emerald Labs',
                thumbnail: '/game-thumbnails/3.jpg',
                badge: 'new',
                color: 'green',
            },
            {
                id: 'lucky-duck',
                title: 'Lucky Duck',
                provider: 'Quack Games',
                thumbnail: '/game-thumbnails/4.jpg',
                badge: 'popular',
                color: 'yellow',
            },
            {
                id: 'zeus-iii',
                title: 'Zeus III',
                provider: 'Olympus Play',
                thumbnail: '/game-thumbnails/2.jpg',
                badge: 'new',
                color: 'orange',
            },
        ],
    },
];

interface IconProps {
    className?: string;
    color?: string;
}

interface featureTielsDataProps {
    title: string;
    icon: {
        component: React.FC<IconProps>;
        color: string;
    };
    modal: {
        title: string;
        content: React.ReactNode;
    };
}

const FeatureTielsModalWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <div className='flex flex-col items-start gap-4 md:gap-6'>{children}</div>
);

const FeatureTielsText = ({
    children,
    className = 'text-base md:text-lg leading-6 md:leading-8 font-bold max-xs:text-center',
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <NeonText as='p' className={className} glowSpread={0.5}>
        {children}
    </NeonText>
);

const FeatureTielsBox = ({ children }: { children: React.ReactNode }) => (
    <NeonBox
        backgroundColor='--color-purple-500'
        backgroundOpacity={0.2}
        glowSpread={0.5}
        className='text-center p-4 md:p-6 rounded-lg'
    >
        {children}
    </NeonBox>
);

const FeatureTielsList = ({ children }: { children: React.ReactNode }) => (
    <ul className='list-disc pl-6'>{children}</ul>
);

const FeatureTielsListItem = ({ children }: { children: React.ReactNode }) => (
    <li>
        <FeatureTielsText className='text-base md:text-lg leading-6 md:leading-8 font-bold'>
            {children}
        </FeatureTielsText>
    </li>
);

export const featureTielsData: FeatureTile[] = [
    {
        title: 'Daily Login Bonus',
        icon: {
            component: GiftIcon,
            color: 'sky',
        },
        modal: {
            title: 'Daily Login Bonus',
            content: (
                <FeatureTielsModalWrapper>
                    <FeatureTielsText>
                        Participants can claim free Gold Coins daily by logging
                        into their Customer Account and claiming the Daily
                        Bonus.
                    </FeatureTielsText>

                    <FeatureTielsList>
                        <FeatureTielsListItem>
                            Log in once per day to receive a free Gold Coin
                            bonus.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Limit: one claim per day per account.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Gold Coins are for gameplay only and cannot be
                            redeemed for rewards.
                        </FeatureTielsListItem>
                    </FeatureTielsList>
                </FeatureTielsModalWrapper>
            ),
        },
    },
    {
        title: 'Alternative Method of Entry (AMOE)',
        icon: {
            component: MailIcon,
            color: 'pink',
        },
        modal: {
            title: 'Alternative Method of Entry (AMOE)',
            content: (
                <FeatureTielsModalWrapper>
                    <FeatureTielsText>
                        Sweeps Coins may be requested without purchase by using one of the following free entry methods:
                    </FeatureTielsText>

                    <FeatureTielsText className='text-base md:text-lg leading-6 md:leading-8 font-bold'>
                        1. Mail-In Request
                    </FeatureTielsText>
                    <FeatureTielsText>
                        To qualify, mail a handwritten entry including the following:
                    </FeatureTielsText>
                    <FeatureTielsList>
                        <FeatureTielsListItem>Full name</FeatureTielsListItem>
                        <FeatureTielsListItem>Address</FeatureTielsListItem>
                        <FeatureTielsListItem>Email</FeatureTielsListItem>
                        <FeatureTielsListItem>
                            The phrase: “Golden Ticket Online Arcade Sweepstakes Entry”
                        </FeatureTielsListItem>
                    </FeatureTielsList>
                    <FeatureTielsText>Mail to:</FeatureTielsText>
                    <FeatureTielsText>
                        Golden Ticket Online Arcade
                        <br />
                        2186 Jackson Keller Rd, Suite 2269
                        <br />
                        San Antonio, TX 78213
                    </FeatureTielsText>
                    <FeatureTielsText className='text-base md:text-lg leading-6 md:leading-8 font-bold'>
                        Mail-In Rules:
                    </FeatureTielsText>
                    <FeatureTielsList>
                        <FeatureTielsListItem>One request per envelope per day</FeatureTielsListItem>
                        <FeatureTielsListItem>Requests must be handwritten and legible</FeatureTielsListItem>
                        <FeatureTielsListItem>Valid entries will receive Sweeps Coins credited to their account</FeatureTielsListItem>
                    </FeatureTielsList>

                    <div className='h-px w-full bg-white/10 my-2 md:my-3' />

                    <FeatureTielsText className='text-base md:text-lg leading-6 md:leading-8 font-bold'>
                        2. Free Online Entry Form
                    </FeatureTielsText>
                    <FeatureTielsText>
                        You can also request a free entry once per week by completing our online form.
                    </FeatureTielsText>
                    <div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='inline-flex items-center mt-1 md:mt-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white font-bold transition-colors'>
                                    <span className='mr-2'>👉</span> Submit Free Entry Form
                                </Button>
                            </DialogTrigger>
                            <SweepstakesSpinModal />
                        </Dialog>
                    </div>
                    <FeatureTielsText className='text-base md:text-lg leading-6 md:leading-8 font-bold'>
                        Online Entry Rules:
                    </FeatureTielsText>
                    <FeatureTielsList>
                        <FeatureTielsListItem>Limit: 1 free entry per person, per 7 days</FeatureTielsListItem>
                        <FeatureTielsListItem>Duplicate submissions will not be accepted</FeatureTielsListItem>
                        <FeatureTielsListItem>Valid submissions will receive Sweeps Coins credited to their account</FeatureTielsListItem>
                    </FeatureTielsList>

                    <div className='h-px w-full bg-white/10 my-2 md:my-3' />

                    <FeatureTielsText>
                        No purchase necessary to enter. Void where prohibited.
                    </FeatureTielsText>
                </FeatureTielsModalWrapper>
            ),
        },
    },
    {
        title: 'Free Gold Coin Bonuses',
        icon: {
            component: GoldCoinsIcon,
            color: 'yellow',
        },
        modal: {
            title: 'Free Gold Coin Bonuses',
            content: (
                <FeatureTielsModalWrapper>
                    <FeatureTielsList>
                        <FeatureTielsListItem>
                            New participants receive 10,000 Gold Coins as a
                            sign-up bonus.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            5,000 Gold Coins are awarded daily for use in
                            free-to-play games.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Additional bonus Gold Coins may be received when
                            purchasing designated Gold Coin packages.
                        </FeatureTielsListItem>
                    </FeatureTielsList>
                    <FeatureTielsText>Details:</FeatureTielsText>
                    <FeatureTielsList>
                        <FeatureTielsListItem>
                            Eligible Packages: Only specific packages include
                            bonus Gold Coins.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Bonus Amounts: Bonus Gold Coins vary by package.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Gold Coins are for entertainment gameplay only and
                            cannot be redeemed for rewards.
                        </FeatureTielsListItem>
                    </FeatureTielsList>
                    <FeatureTielsText>
                        <strong>Disclaimer:</strong> No purchase necessary to
                        play. All Gold Coins are for entertainment purposes only
                        and have no cash value. Must be 21 or older to
                        participate. Void where prohibited.
                    </FeatureTielsText>
                </FeatureTielsModalWrapper>
            ),
        },
    },
    {
        title: 'Gold Coin Purchases',
        icon: {
            component: GoldCoinPurchasesIcon,
            color: 'rose',
        },
        modal: {
            title: 'By Entering Competitions',
            content: (
                <FeatureTielsModalWrapper>
                    <FeatureTielsText>Gold Coin Purchases</FeatureTielsText>
                    <FeatureTielsText>
                        Players may purchase Gold Coin packages for
                        entertainment gameplay. Some packages may include bonus
                        Gold Coins as a free promotional reward.
                    </FeatureTielsText>
                    <FeatureTielsList>
                        <FeatureTielsListItem>
                            Gold Coins are used for gameplay only and cannot be
                            redeemed for rewards.
                        </FeatureTielsListItem>
                        <FeatureTielsListItem>
                            Bonus Gold Coins may vary depending on the package
                            selected.
                        </FeatureTielsListItem>
                    </FeatureTielsList>
                    <FeatureTielsText>
                        <strong>Reminder:</strong> No purchase is necessary to
                        play. An Alternative Method of Entry is always available
                        (see AMOE instructions).
                    </FeatureTielsText>
                </FeatureTielsModalWrapper>
            ),
        },
    },
];