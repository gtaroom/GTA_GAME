/**
 * Game Context - Industrial Level State Management
 * Provides centralized game data management with caching and optimization
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getGames, getFeaturedGames, clearGamesCache, preloadGames } from '@/lib/api/games';
import type { Game, GameFilterParams, GameContextType, GameTag, GameType } from '@/types/game.types';

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameFilterParams>({
    page: 1,
    limit: 50,
    sort: 'name:asc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [availableFilters, setAvailableFilters] = useState({
    tags: [] as GameTag[],
    types: [] as GameType[],
  });
  
  // Track active game type for currency display
  const [activeGameType, setActiveGameType] = useState<GameType | 'all'>('bonus');

  /**
   * Fetch games with current filters
   */
  const fetchGames = useCallback(async (newFilters?: Partial<GameFilterParams>) => {
    const currentFilters = { ...filters, ...newFilters };
    
    setLoading(true);
    setError(null);

    try {
      const response = await getGames(currentFilters);
      
      setGames(response.data.games);
      setPagination(response.data.pagination);
      // setAvailableFilters(response.data.filters);
      setFilters(currentFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Update filters and fetch games
   */
  const updateFilters = useCallback((newFilters: Partial<GameFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchGames(newFilters);
  }, [fetchGames]);

  /**
   * Refresh games data
   */
  const refreshGames = useCallback(async () => {
    clearGamesCache();
    await fetchGames();
  }, [fetchGames]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    clearGamesCache();
  }, []);

  /**
   * Initialize games on mount
   */
  useEffect(() => {
    fetchGames();
    
    // Preload additional data for better UX
    preloadGames().catch(console.warn);
  }, []);

  /**
   * Memoized context value
   */
  const contextValue = useMemo<GameContextType>(() => ({
    games,
    loading,
    error,
    filters,
    pagination,
    availableFilters,
    activeGameType,
    setFilters: updateFilters,
    setActiveGameType,
    refreshGames,
    clearCache,
  }), [
    games,
    loading,
    error,
    filters,
    pagination,
    availableFilters,
    activeGameType,
    updateFilters,
    refreshGames,
    clearCache,
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to use game context
 */
export function useGames(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}

/**
 * Hook for featured games (bonus, exclusive, new releases)
 */
export function useFeaturedGames() {
  const [featuredGames, setFeaturedGames] = useState<{
    bonus: Game[];
    exclusive: Game[];
    newReleases: Game[];
  }>({
    bonus: [],
    exclusive: [],
    newReleases: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const games = await getFeaturedGames();
      setFeaturedGames(games);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedGames();
  }, [fetchFeaturedGames]);

  return {
    featuredGames,
    loading,
    error,
    refetch: fetchFeaturedGames,
  };
}

/**
 * Hook for game search with debouncing
 */
export function useGameSearch() {
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGames = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { getGames } = await import('@/lib/api/games');
      const response = await getGames({ search: query, limit: 20 });
      setSearchResults(response.data.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchGames,
  };
}
