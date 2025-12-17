// VIP Tier utility functions
export const getTierImage = (tier: string) => {
    const tierImages: Record<string, string> = {
        'none': '/vip-program/iron.png',
        'iron': '/vip-program/iron.png',
        'bronze': '/vip-program/bronze.png',
        'silver': '/vip-program/silver.png',
        'gold': '/vip-program/gold.png',
        'platinum': '/vip-program/platinum.png',
        'onyx': '/vip-program/onyx.png',
        'sapphire': '/vip-program/sapphire.png',
        'ruby': '/vip-program/ruby.png',
        'emerald': '/vip-program/emerald.png',
    };
    return tierImages[tier.toLowerCase()] || tierImages['none'];
};

export const getTierColor = (tier: string) => {
    const tierColors: Record<string, string> = {
        'none': '--color-gray-400',
        'iron': '--color-gray-400',
        'bronze': '--color-amber-500',
        'silver': '--color-slate-400',
        'gold': '--color-yellow-500',
        'platinum': '--color-blue-500',
        'onyx': '--color-purple-500',
        'sapphire': '--color-blue-500',
        'ruby': '--color-red-500',
        'emerald': '--color-green-500',
    };
    return tierColors[tier.toLowerCase()] || tierColors['none'];
};

export const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
        'none': 'Standard',
        'iron': 'Iron Tier',
        'bronze': 'Bronze Tier',
        'silver': 'Silver Tier',
        'gold': 'Gold Tier',
        'platinum': 'Platinum Tier',
        'onyx': 'Onyx Tier',
        'sapphire': 'Sapphire Tier',
        'ruby': 'Ruby Tier',
        'emerald': 'Emerald Tier',
    };
    return tierNames[tier.toLowerCase()] || tierNames['none'];
};
