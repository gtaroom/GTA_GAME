'use client';

import { useGameSearch } from '@/contexts/game-search-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import type { GameDataProps } from '@/types/global.type';
import { Command } from 'cmdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameCard from '../game-card';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { DialogTitle } from '../ui/dialog';
import { getGames } from '@/lib/api/games';
import { convertToLegacyGames } from '@/lib/game-utils';

// Available colors for games
const GAME_COLORS = [
    'red', 'purple', 'cyan', 'orange', 'green', 'yellow', 'blue',
    'emerald', 'violet', 'fuchsia', 'teal', 'sky', 'indigo', 'amber', 'lime'
] as const;

// Get random color from the palette
const getRandomColor = () => {
    return GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
};

export function GameSearchModal() {
    const { md, sm } = useBreakPoint();
    const { isOpen, closeModal, onGameSelect } = useGameSearch();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [searchValue, setSearchValue] = useState('');
    const [filteredGames, setFilteredGames] = useState<GameDataProps[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch games from API with debouncing
    useEffect(() => {
        if (!isOpen) {
            setFilteredGames([]);
            return;
        }

        const query = searchValue.trim();
        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await getGames({ 
                    search: query || undefined, 
                    limit: query ? 24 : 8,
                    sort: 'popularity:desc'
                });
                
                if (response.success) {
                    const legacyGames = convertToLegacyGames(response.data.games);
                    // Convert to GameDataProps from global.type.ts (optimized)
                    const compatibleGames: GameDataProps[] = legacyGames.map(game => ({
                        id: game._id,
                        title: game.title,
                        provider: game.provider,
                        thumbnail: game.thumbnail,
                        badge: game.badge as 'top-pick' | 'bonus-available' | 'free-to-play' | 'new' | 'popular' | 'limited-time' | undefined,
                        // Ensure every game has a color - use API color or assign random
                        color: (game.color || getRandomColor()) as 'red' | 'purple' | 'cyan' | 'orange' | 'green' | 'yellow' | 'blue' | 'emerald' | 'violet' | 'fuchsia' | 'teal' | 'sky' | 'indigo' | 'amber' | 'lime',
                    }));
                    setFilteredGames(compatibleGames);
                } else {
                    setFilteredGames([]);
                }
            } catch (error) {
                console.error('Failed to fetch games:', error);
                setFilteredGames([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchValue, isOpen]);

    // Memoize grid calculations for performance (client-side only)
    const getGridPosition = useCallback((index: number) => {
        if (typeof window === 'undefined') {
            // Default to mobile layout during SSR
            const cols = 2;
            const row = Math.floor(index / cols);
            const col = index % cols;
            return { row, col, cols };
        }
        
        const cols = window.innerWidth >= 768 ? 4 : 2;
        const row = Math.floor(index / cols);
        const col = index % cols;
        return { row, col, cols };
    }, []);

    const getIndexFromPosition = useCallback(
        (row: number, col: number, cols: number) => {
            return row * cols + col;
        },
        []
    );

    // Memoize search results display text
    const resultsText = useMemo(() => {
        if (searchValue) {
            return `Found ${filteredGames.length} games`;
        }
        return 'Popular Games';
    }, [searchValue, filteredGames.length]);

    // Memoize handleGameSelect to prevent unnecessary re-renders
    const handleGameSelect = useCallback(
        (game: GameDataProps) => {
            onGameSelect?.(game);
            closeModal();
        },
        [onGameSelect, closeModal]
    );

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                return;
            }

            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
                return;
            }

            if (filteredGames.length === 0) return;

            const { row, col, cols } = getGridPosition(selectedIndex);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const newRow = row + 1;
                const newIndex = getIndexFromPosition(newRow, col, cols);
                setSelectedIndex(Math.min(newIndex, filteredGames.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const newRow = Math.max(row - 1, 0);
                const newIndex = getIndexFromPosition(newRow, col, cols);
                setSelectedIndex(Math.max(newIndex, 0));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const newCol = Math.min(col + 1, cols - 1);
                const newIndex = getIndexFromPosition(row, newCol, cols);
                setSelectedIndex(Math.min(newIndex, filteredGames.length - 1));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const newCol = Math.max(col - 1, 0);
                const newIndex = getIndexFromPosition(row, newCol, cols);
                setSelectedIndex(Math.max(newIndex, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredGames[selectedIndex]) {
                    handleGameSelect(filteredGames[selectedIndex]);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [
        isOpen,
        selectedIndex,
        filteredGames,
        getGridPosition,
        getIndexFromPosition,
        closeModal,
        handleGameSelect,
    ]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchValue]);

    useEffect(() => {
        if (selectedIndex >= filteredGames.length && filteredGames.length > 0) {
            setSelectedIndex(filteredGames.length - 1);
        }
    }, [filteredGames.length, selectedIndex]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        },
        [closeModal]
    );

    // Reset search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchValue('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Command.Dialog
            ref={modalRef}
            open={isOpen}
            onOpenChange={closeModal}
            label='Global Game Search'
            className='fixed inset-0 z-50'
        >
            <div
                ref={backdropRef}
                className='fixed inset-0 bg-[#310A47]/70 backdrop-blur-xs'
                aria-hidden='true'
                onClick={handleBackdropClick}
            />

            <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl p-4'>
                <NeonBox
                    neonBoxRef={contentRef}
                    glowSpread={1.2}
                    backgroundColor='--color-purple-900'
                    backgroundOpacity={0.6}
                    glowColor='--color-purple-500'
                    className='backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden'
                >
                    <Command>
                        <div className='flex items-center lg:px-6 px-4 lg:py-4 py-3'>
                            <NeonIcon
                                icon='lucide:search'
                                size={sm ? 24 : 20}
                                className='mr-3'
                            />

                            <Command.Input
                                placeholder='Search games...'
                                className='w-full sm:text-base text-sm bg-transparent border-none outline-none text-white placeholder:text-white/60 font-semibold capitalize'
                                autoFocus
                                value={searchValue}
                                onValueChange={setSearchValue}
                            />
                            {searchValue && (
                                <button
                                    onClick={() => setSearchValue('')}
                                    className='leading-0'
                                >
                                    <NeonIcon icon='lucide:x' size={28} />
                                </button>
                            )}
                        </div>

                        <NeonBox
                            neonBoxRef={contentRef}
                            glowSpread={1.2}
                            backgroundColor='--color-purple-900'
                            backgroundOpacity={0.6}
                            glowColor='--color-purple-500'
                            className='border-b-0'
                            borderWidth={1}
                        />

                        <Command.List className='h-fit max-h-[550px] overflow-y-auto lg:p-6 xs:p-5 p-4'>
                            <Command.Empty className='px-4 py-12 text-center'>
                                {loading ? (
                                    <>
                                        <NeonText
                                            as='span'
                                            className='text-white text-xl mb-2 inline-block capitalize font-semibold'
                                        >
                                            Searching...
                                        </NeonText>
                                        <p className='text-white text-sm font-semibold capitalize'>
                                            Please wait while we find the best games for you
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <NeonText
                                            as='span'
                                            className='text-white text-xl mb-2 inline-block capitalize font-semibold'
                                        >
                                            No games found
                                        </NeonText>
                                        <p className='text-white text-sm font-semibold capitalize'>
                                            Try searching with different keywords
                                        </p>
                                    </>
                                )}
                            </Command.Empty>

                            {filteredGames.length > 0 && (
                                <Command.Group>
                                    <DialogTitle className='text-xs font-semibold hidden tracking-wider mb-4 px-2'>
                                        {resultsText}
                                    </DialogTitle>

                                    <div className='grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-5'>
                                        {filteredGames.map((game, index) => {
                                            const gameKey = game.id || `game-${index}`;
                                            const isSelected = selectedIndex === index;
                                            
                                            return (
                                                <Command.Item
                                                    key={gameKey}
                                                    value={`${gameKey}-${game.title}`}
                                                    onSelect={() => handleGameSelect(game)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className='leading-0'
                                                >
                                                    <div className={`
                                                        transition-all duration-200 rounded-xl
                                                        ${isSelected ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-transparent scale-105 shadow-lg shadow-white/20' : ''}
                                                    `}>
                                                        <GameCard
                                                            game={game}
                                                            showBadge={true}
                                                            animation={false}
                                                            playable={false}
                                                            glowColor={`--color-${game.color}-500`}
                                                            glowSpread={isSelected ? 1.6 : 0.8}
                                                        />
                                                    </div>
                                                </Command.Item>
                                            );
                                        })}
                                    </div>
                                </Command.Group>
                            )}
                        </Command.List>

                        {md && (
                            <>
                                <NeonBox
                                    neonBoxRef={contentRef}
                                    glowSpread={1.2}
                                    backgroundColor='--color-purple-900'
                                    backgroundOpacity={0.6}
                                    glowColor='--color-purple-500'
                                    className='border-b-0'
                                    borderWidth={1}
                                />

                                <div className='px-6 py-4'>
                                    <div className='flex flex-wrap items-center justify-between text-xs text-white capitalize gap-4'>
                                        <div className='flex items-center gap-6'>
                                            <div className='flex items-center gap-2'>
                                                <kbd className='px-2 py-1 bg-white/10 rounded border border-white/20 text-xs font-mono'>
                                                    ↑↓←→
                                                </kbd>
                                                <span>Navigate</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <kbd className='px-2 py-1 bg-white/10 rounded border border-white/20 text-xs font-mono'>
                                                    ↵
                                                </kbd>
                                                <span>Select</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <kbd className='px-2 py-1 bg-white/10 rounded border border-white/20 text-xs font-mono'>
                                                    Esc
                                                </kbd>
                                                <span>Close</span>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <kbd className='px-2 py-1 bg-white/10 rounded border border-white/20 text-xs font-mono'>
                                                ⌘ + K
                                            </kbd>
                                            <span>Quick search</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Command>
                </NeonBox>
            </div>
        </Command.Dialog>
    );
}
