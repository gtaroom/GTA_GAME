/**
 * Game Types - Industrial Level Type Definitions
 * Supports dynamic game filtering, caching, and optimization
 */

export type GameTag = 
  | "new"
  | "free_to_play"
  | "popular"
  | "top_pick"
  | "trending"
  | "hot"
  | "jackpot"
  | "exclusive"
  | "bonus"
  | "download_only"
  | "web_only"
  | null;

export type GameType = 
  | "bonus"
  | "exclusive"
  | "signature"
  | "new_releases"
  | "slots"
  | "fish"
  | "web_only";

export type GameColor = 
  | "red"
  | "purple"
  | "cyan"
  | "orange"
  | "green"
  | "yellow"
  | "blue"
  | "emerald"
  | "violet"
  | "fuchsia"
  | "teal"
  | "sky"
  | "indigo"
  | "amber"
  | "lime";

export type GameSortOption = 
  | "name:asc"
  | "name:desc"
  | "popularity:asc"
  | "popularity:desc"
  | "newest:asc"
  | "newest:desc";

export interface Game {
  _id: string;
  name: string;
  image: string;
  link: string;
  type: GameType;
  types: GameType[];
  tag: GameTag;
  color: GameColor;
  provider?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameFilterParams {
  tag?: GameTag;
  types?: GameType[];
  search?: string;
  page?: number;
  limit?: number;
  sort?: GameSortOption;
}

export interface GameApiResponse {
  success: boolean;
  data: {
    games: Game[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      availableTags: GameTag[];
      availableTypes: GameType[];
    };
  };
  message?: string;
}

export interface GameCache {
  data: Game[];
  timestamp: number;
  filters: GameFilterParams;
  expiresAt: number;
}

export interface GameContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  filters: GameFilterParams;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableFilters: {
    tags: GameTag[];
    types: GameType[];
  };
  activeGameType: GameType | 'all'; // Current active game tab for currency display
  // Actions
  setFilters: (filters: Partial<GameFilterParams>) => void;
  setActiveGameType: (type: GameType | 'all') => void;
  refreshGames: () => Promise<void>;
  clearCache: () => void;
}

// Legacy compatibility
export interface GameDataProps {
  _id?: string;
  title: string;
  name?: string; // Add name for compatibility
  provider?: string;
  thumbnail: string;
  badge?: string;
  color: GameColor;
  type?: 'exclusive' | 'signature' | 'bonus' | 'featured'; // Add game type
  types?: string[]; // Add types array from API response
  description?: string; // Add description
  link?: string; // Game URL for iframe games (bonus/signature)
}
