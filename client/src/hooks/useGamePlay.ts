import { useState, useEffect, useCallback } from 'react';
import { getGames, getGameToken } from '@/lib/api/games';
import type { Game } from '@/types/game.types';

interface UseGamePlayReturn {
    game: Game | null;
    gameUrl: string;
    loading: boolean;
    error: string | null;
    retry: () => void;
}

/**
 * Custom hook for game play functionality
 * Handles game loading, token fetching, and error states
 */
export function useGamePlay(gameId: string): UseGamePlayReturn {
    const [game, setGame] = useState<Game | null>(null);
    const [gameUrl, setGameUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadGame = useCallback(async () => {
        if (!gameId) {
            setError('Game ID is required');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch game details
            const response = await getGames({ limit: 1000 });
            const foundGame = response.data.games.find(g => g._id === gameId);

            if (!foundGame) {
                throw new Error('Game not found');
            }

            // Validate game type
            const isPlayableGame = !foundGame.types.includes('web_only');
            
            if (!isPlayableGame) {
                throw new Error('This game type is not supported for direct play');
            }

            // Check if game has a link
            if (!foundGame.link) {
                throw new Error('Game URL is not available');
            }

            setGame(foundGame);

            // Get access token
            const { token } = await getGameToken();

            // Construct game URL with token
            const url = `${foundGame.link}?accessToken=${token}&test=false`;
            setGameUrl(url);
        } catch (err) {
            console.error('Failed to load game:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        loadGame();
    }, [loadGame]);

    const retry = useCallback(() => {
        loadGame();
    }, [loadGame]);

    return {
        game,
        gameUrl,
        loading,
        error,
        retry,
    };
}
