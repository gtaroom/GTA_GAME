'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { useBreakPoint } from '../../hooks/useBreakpoint';
import { cn } from '../../lib/utils';
import { getGameToken } from '../../lib/api/games';
import type { Game } from '../../types/game-account.types';

interface IframeGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    game: Game;
}

export default function IframeGameModal({
    open,
    onOpenChange,
    game,
}: IframeGameModalProps) {
    const [gameUrl, setGameUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { lg } = useBreakPoint();

    useEffect(() => {
        if (open && game) {
            loadGame();
        }
    }, [open, game]);

    const loadGame = async () => {
        if (!game.link) {
            setError('Game link not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get the access token
            const { token } = await getGameToken();
            
            // Construct the game URL with token
            const url = `${game.link}?accessToken=${token}&test=false`;
            setGameUrl(url);
        } catch (err) {
            console.error('Failed to load game:', err);
            setError(err instanceof Error ? err.message : 'Failed to load game');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            setGameUrl('');
            setError(null);
        }
        onOpenChange(val);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                showScrollBar={false}
                showCloseButton={true}
                className={cn(
                    lg
                        ? 'max-w-[calc(100%-60px)]! max-h-[calc(100%-60px)]!'
                        : 'max-w-[calc(100%-40px)]! max-h-[calc(100%-40px)]!',
                    'lg:h-full p-0!'
                )}
                neonBoxClass={cn(
                    'p-0! overflow-hidden max-h-screen! h-full!'
                )}
            >
                <DialogTitle className='sr-only'>Game Play</DialogTitle>
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white">
                            {game.name}
                        </h3>
                        <button
                            onClick={() => handleOpenChange(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Game Content */}
                    <div className="flex-1 relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    <p className="text-white">Loading game...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                                <div className="text-center p-6">
                                    <div className="text-red-400 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <p className="text-white mb-4">{error}</p>
                                    <button
                                        onClick={loadGame}
                                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {gameUrl && !loading && !error && (
                            <iframe
                                src={gameUrl}
                                className="w-full h-full border-0"
                                allowFullScreen
                                allow="fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
