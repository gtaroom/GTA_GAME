'use client';

import type { GameDataProps } from '@/types/global.type';
import { createContext, useContext, useState } from 'react';

interface GameSearchContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    onGameSelect?: (game: GameDataProps) => void;
    setOnGameSelect: (callback: (game: GameDataProps) => void) => void;
}

const GameSearchContext = createContext<GameSearchContextType | undefined>(
    undefined
);

export const GameSearchProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [onGameSelect, setOnGameSelect] = useState<
        ((game: GameDataProps) => void) | undefined
    >();

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSetOnGameSelect = (callback: (game: GameDataProps) => void) => {
        setOnGameSelect(() => callback);
    };

    return (
        <GameSearchContext.Provider
            value={{
                isOpen,
                openModal,
                closeModal,
                onGameSelect,
                setOnGameSelect: handleSetOnGameSelect,
            }}
        >
            {children}
        </GameSearchContext.Provider>
    );
};

export const useGameSearch = () => {
    const context = useContext(GameSearchContext);
    if (context === undefined) {
        throw new Error(
            'useGameSearch must be used within a GameSearchProvider'
        );
    }
    return context;
};
