type Badge =
    | 'top-pick'
    | 'bonus-available'
    | 'free-to-play'
    | 'new'
    | 'popular'
    | 'limited-time';

type Color =
    | 'red'
    | 'purple'
    | 'cyan'
    | 'orange'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'emerald'
    | 'violet'
    | 'fuchsia'
    | 'teal'
    | 'sky'
    | 'indigo'
    | 'amber'
    | 'lime'
    | 'cyan';

export interface GameDataProps {
    id?: string;
    _id?: string; // Add _id for compatibility with game account system
    title: string;
    name?: string; // Add name for compatibility
    provider?: string;
    thumbnail: string;
    badge?: Badge;
    color: Color;
    type?: 'exclusive' | 'signature' | 'bonus' | 'featured'; // Add game type
    types?: string[]; // Add types array from API response
    description?: string; // Add description
    link?: string; // Game URL for iframe games (bonus/signature)
}

export interface removeDefaultStyleProps {
    removeDefaultStyle?: boolean;
}
