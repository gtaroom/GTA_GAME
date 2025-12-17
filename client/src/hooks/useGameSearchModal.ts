// hooks/useGameSearchModal.ts
'use client';

import { useGameSearch } from '@/contexts/game-search-context';
import type { GameDataProps } from '@/types/global.type';
import { useCallback } from 'react';

export const useGameSearchModal = () => {
    const { openModal, setOnGameSelect } = useGameSearch();

    const openGameSearch = useCallback(
        (onSelect?: (game: GameDataProps) => void) => {
            if (onSelect) {
                setOnGameSelect(onSelect);
            }
            openModal();
        },
        [openModal, setOnGameSelect]
    );

    return { openGameSearch };
};
