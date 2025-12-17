/**
 * Game Filter Component
 * Provides tag-based filtering for games
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGames } from '@/contexts/game-context';
import type { GameTag } from '@/types/game.types';

interface GameFilterProps {
  className?: string;
}

const GameFilter: React.FC<GameFilterProps> = ({ className = '' }) => {
  const { filters, setFilters, loading } = useGames();

  // Memoize filter options
  const tagOptions = useMemo(() => {
    const fixedTags: GameTag[] = [
      'new',
      'free_to_play',
      'popular',
      'top_pick',
      'trending',
      'hot',
      'jackpot',
      'exclusive',
      'bonus',
      'download_only',
      'web_only',
    ];
    return [
      { value: 'all', label: 'All Tags' },
      ...fixedTags.map(tag => ({
        value: tag,
        label: (tag as string).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      })),
    ];
  }, []);

  // Handle tag filter
  const handleTagFilter = useCallback((tag: string) => {
    const newFilters = { 
      ...filters, 
      tag: (tag === 'all' ? undefined : (tag as GameTag)) as GameTag | undefined, 
      page: 1 
    };
    setFilters(newFilters);
  }, [filters, setFilters]);

  return (
    <div className={`w-full flex items-center justify-end ${className}`}>
      {/* Tag Filter - aligned to the right */}
      <Select
        value={(filters.tag ?? 'all') as string}
        onValueChange={handleTagFilter}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent align="end">
          {tagOptions.map((option) => (
            <SelectItem key={option.value} value={option.value || 'all'}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GameFilter;
