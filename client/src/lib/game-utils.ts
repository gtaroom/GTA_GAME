/**
 * Game Data Utilities
 * Converts between legacy and new game data formats
 * Updated to support types array from API response
 */

import type { Game, GameDataProps, GameTag, GameColor } from '@/types/game.types';

// Available colors for games
const GAME_COLORS: GameColor[] = [
  'red', 'purple', 'cyan', 'orange', 'green', 'yellow', 'blue',
  'emerald', 'violet', 'fuchsia', 'teal', 'sky', 'indigo', 'amber', 'lime'
];

// Get random color from the palette
const getRandomColor = (): GameColor => {
  return GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
};

/**
 * Convert legacy game data to new format
 */
// export function convertLegacyGame(legacyGame: GameDataProps): Game {
//   // Map legacy badge to new tag format
//   const tagMap: Record<string, GameTag> = {
//     'free-to-play': 'free_to_play',
//     'top-pick': 'top_pick',
//     'bonus-available': 'bonus',
//     'limited-time': 'hot',
//     'new': 'new',
//     'popular': 'popular',
//   };

//   // Map legacy color to new color format
//   const colorMap: Record<string, GameColor> = {
//     'red': 'red',
//     'purple': 'purple',
//     'cyan': 'cyan',
//     'orange': 'orange',
//     'green': 'green',
//     'yellow': 'yellow',
//     'blue': 'blue',
//     'emerald': 'emerald',
//     'violet': 'violet',
//     'fuchsia': 'fuchsia',
//     'teal': 'teal',
//     'sky': 'sky',
//     'indigo': 'indigo',
//     'amber': 'amber',
//     'lime': 'lime',
//   };

//   return {
//     _id: legacyGame._id || legacyGame.title.toLowerCase().replace(/\s+/g, '-'),
//     name: legacyGame.title,
//     image: legacyGame.thumbnail,
//     link: `#${legacyGame._id || legacyGame.title.toLowerCase().replace(/\s+/g, '-')}`,
//     types: ['slots'], // Default type for legacy games
//     tag: legacyGame.badge ? tagMap[legacyGame.badge] || null : null,
//     color: colorMap[legacyGame.color] || 'purple',
//     provider: legacyGame.provider,
//     isActive: true,
//   };
// }

/**
 * Convert new game data to legacy format for backward compatibility
 */
export function convertToLegacyGame(game: Game): GameDataProps {
  // Map new tag to legacy badge format
  const badgeMap: Record<string, string> = {
    'free_to_play': 'free-to-play',
    'top_pick': 'top-pick',
    'bonus': 'bonus-available',
    'hot': 'limited-time',
    'new': 'new',
    'popular': 'popular',
    'trending': 'popular',
    'jackpot': 'bonus-available',
    'exclusive': 'exclusive',
    'download_only': 'download-only',
    'web_only': 'web-only',
  };

  return {
    _id: game._id,
    title: game.name,
    provider: game.provider,
    thumbnail: getGameImageUrl(game.image),
    badge: game.tag ? badgeMap[game.tag] || game.tag : undefined,
    // Ensure every game has a color - use API color or assign random
    color: game.color || getRandomColor(),
    // Preserve types array and link for iframe games
    types: game.types, // Preserve the types array from API
    link: game.link, // Preserve the game link for iframe games
    description: game.provider,
  };
}

/**
 * Convert array of legacy games to new format
 */
// export function convertLegacyGames(legacyGames: GameDataProps[]): Game[] {
//   return legacyGames.map(convertLegacyGame);
// }

/**
 * Convert array of new games to legacy format
 */
export function convertToLegacyGames(games: Game[]): GameDataProps[] {
  return games.map(convertToLegacyGame);
}

/**
 * Get image URL with proper base URL handling
 */
export function getGameImageUrl(imagePath: string): string {
  if (!imagePath) return '/game-thumbnails/placeholder.jpg';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Always prefix with base URL as per requirement (do not add extra /)
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || '';
  return baseUrl + imagePath;
}

/**
 * Generate game link with proper handling
 */
export function getGameLink(game: Game): string {
  if (!game.link) return '#';
  
  // If it's already a full URL, return as is
  if (game.link.startsWith('http')) {
    return game.link;
  }
  
  // If it starts with #, it's a local anchor
  if (game.link.startsWith('#')) {
    return game.link;
  }
  
  // Otherwise, treat as relative path
  return game.link;
}

/**
 * Filter games by type
 */
export function filterGamesByType(games: Game[], type: string): Game[] {
  return games.filter(game => game.types.includes(type as any));
}

/**
 * Filter games by tag
 */
export function filterGamesByTag(games: Game[], tag: GameTag): Game[] {
  return games.filter(game => game.tag === tag);
}

/**
 * Search games by name
 */
export function searchGames(games: Game[], query: string): Game[] {
  if (!query.trim()) return games;
  
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.name.toLowerCase().includes(lowercaseQuery) ||
    game.provider?.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Sort games by various criteria
 */
export function sortGames(games: Game[], sortBy: string): Game[] {
  const sortedGames = [...games];
  
  switch (sortBy) {
    case 'name:asc':
      return sortedGames.sort((a, b) => a.name.localeCompare(b.name));
    case 'name:desc':
      return sortedGames.sort((a, b) => b.name.localeCompare(a.name));
    case 'popularity:desc':
      // Sort by tag priority (popular games first)
      const tagPriority: Record<string, number> = { 'popular': 1, 'trending': 2, 'hot': 3, 'top_pick': 4 };
      return sortedGames.sort((a, b) => {
        const aPriority = tagPriority[a.tag || ''] || 999;
        const bPriority = tagPriority[b.tag || ''] || 999;
        return aPriority - bPriority;
      });
    case 'newest:desc':
      return sortedGames.sort((a, b) => {
        const aIsNew = a.tag === 'new';
        const bIsNew = b.tag === 'new';
        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;
        return 0;
      });
    default:
      return sortedGames;
  }
}
