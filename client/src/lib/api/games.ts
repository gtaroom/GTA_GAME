/**
 * Game API - Industrial Level API Management
 * Handles game data fetching, caching, and optimization
 */

import { http } from './http';
import type { Game, GameFilterParams, GameApiResponse } from '@/types/game.types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'games_cache';

interface GameCache {
  data: GameApiResponse;
  timestamp: number;
  filters: GameFilterParams;
}

/**
 * Get games with advanced filtering and caching
 */
export async function getGames(filters: GameFilterParams = {}): Promise<GameApiResponse> {
  const cacheKey = `${CACHE_KEY}_${JSON.stringify(filters)}`;
  
  // Check cache first
  if (typeof window !== 'undefined') {
    const cached = getCachedGames(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.types?.length) {
      filters.types.forEach(type => params.append('types', type));
    }
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await http<GameApiResponse>(`/games/filter?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store', // Always fetch fresh data for games
    });

    // Cache the response
    if (typeof window !== 'undefined') {
      cacheGames(cacheKey, response, filters);
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    throw new Error('Failed to fetch games');
  }
}

/**
 * Get games by specific type (optimized for common use cases)
 */
export async function getGamesByType(type: string): Promise<Game[]> {
  try {
    const response = await getGames({ types: [type as any], limit: 50 });
    return response.data.games;
  } catch (error) {
    console.error(`Failed to fetch games for type ${type}:`, error);
    return [];
  }
}

/**
 * Search games with debounced API calls
 */
export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await getGames({ search: query, limit: 20 });
    return response.data.games;
  } catch (error) {
    console.error('Failed to search games:', error);
    return [];
  }
}

/**
 * Get featured games (bonus, exclusive, new releases)
 */
export async function getFeaturedGames(): Promise<{
  bonus: Game[];
  exclusive: Game[];
  newReleases: Game[];
}> {
  try {
    const [bonusResponse, exclusiveResponse, newResponse] = await Promise.all([
      getGames({ types: ['bonus'], limit: 12 }),
      getGames({ types: ['exclusive'], limit: 12 }),
      getGames({ types: ['new_releases'], limit: 12 }),
    ]);

    return {
      bonus: bonusResponse.data.games,
      exclusive: exclusiveResponse.data.games,
      newReleases: newResponse.data.games,
    };
  } catch (error) {
    console.error('Failed to fetch featured games:', error);
    return {
      bonus: [],
      exclusive: [],
      newReleases: [],
    };
  }
}

/**
 * Cache management functions
 */
function getCachedGames(key: string): GameApiResponse | null {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: GameCache = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to read games cache:', error);
    return null;
  }
}

function cacheGames(key: string, data: GameApiResponse, filters: GameFilterParams): void {
  try {
    const cacheData: GameCache = {
      data,
      timestamp: Date.now(),
      filters,
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache games:', error);
  }
}

/**
 * Clear all games cache
 */
export function clearGamesCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear games cache:', error);
  }
}

/**
 * Get game access token for iframe games
 */
export async function getGameToken(): Promise<{ token: string }> {
  try {
    const response = await http<{ data: { token: string } }>('/games/token', {
      method: 'GET',
      cache: 'no-store',
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get game token:', error);
    throw new Error('Failed to get game token');
  }
}

/**
 * Preload games for better performance
 */
export async function preloadGames(): Promise<void> {
  try {
    // Preload featured games
    await getFeaturedGames();
    
    // Preload popular games
    await getGames({ tag: 'popular', limit: 20 });
  } catch (error) {
    console.warn('Failed to preload games:', error);
  }
}
