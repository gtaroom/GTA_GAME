'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGamePlay } from '@/hooks/useGamePlay';
import { Icon } from '@iconify/react';
import AuthGuard from '@/components/auth-guard';
import { useAuth } from '@/contexts/auth-context';

export default function GamePlayPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params.gameId as string;
    const { refetchUser } = useAuth();

    const { game, gameUrl, loading, error, retry } = useGamePlay(gameId);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isDesktopControlExpanded, setIsDesktopControlExpanded] = useState(false);

    // Detect device type
    useEffect(() => {
        const checkDevice = () => {
            const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            setIsMobile(mobile);
            setIsIOS(ios);
        };
        checkDevice();
    }, []);

    // Monitor fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isInFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement
            );
            setIsFullscreen(isInFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Prevent body scroll when game is active
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleBack = useCallback(() => {
        // Exit fullscreen if active (for desktop)
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        refetchUser();
        router.back();
    }, [router]);

    const handleCloseFullscreen = useCallback(() => {
        // For iOS: Toggle header visibility
        if (isIOS) {
            setShowHeader(true);
            return;
        }

        // For Android/Mobile: Exit fullscreen mode
        if (isMobile && (document.fullscreenElement || (document as any).webkitFullscreenElement)) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
            return;
        }

        // Fallback: go back
        router.back();
    }, [isIOS, isMobile, router]);

    const handleFullscreen = useCallback(() => {
        // iOS doesn't support Fullscreen API, so we just hide the header
        if (isIOS) {
            setShowHeader(!showHeader);
            return;
        }

        const element = document.documentElement;
        
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
            // Enter fullscreen
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.log('Fullscreen request failed:', err);
                });
            } else if ((element as any).webkitRequestFullscreen) {
                (element as any).webkitRequestFullscreen(); // Safari
            } else if ((element as any).mozRequestFullScreen) {
                (element as any).mozRequestFullScreen(); // Firefox
            } else if ((element as any).msRequestFullscreen) {
                (element as any).msRequestFullscreen(); // IE11
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }
    }, [isIOS, showHeader]);

    const handleRetry = useCallback(() => {
        retry();
    }, [retry]);

    // Loading State
    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
                <div className="text-center space-y-6">
                    {/* Animated Loading Spinner */}
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Loading Game...</h2>
                        <p className="text-gray-400">Please wait while we prepare your game</p>
                    </div>

                    {/* Loading Progress Bar */}
                    <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50 p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    {/* Error Icon */}
                    <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                        <Icon 
                            icon="lucide:alert-circle" 
                            className="w-12 h-12 text-red-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
                        <p className="text-gray-400">{error}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <Icon icon="lucide:refresh-cw" className="w-5 h-5" />
                            Try Again
                        </button>
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine if we should show header (iOS uses showHeader state, others use isFullscreen)
    const shouldShowHeader = isIOS ? showHeader : !isFullscreen;
    const isInFullscreenMode = isIOS ? !showHeader : isFullscreen;

    // Game Play State
    return (
        <AuthGuard>
            <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
                {/* Game Header - Hidden in fullscreen/when header is hidden */}
                {shouldShowHeader && (
                    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-300 hover:text-white"
                                aria-label="Go back"
                            >
                                <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                                <span className="hidden sm:inline font-medium">Back</span>
                            </button>
                            
                            {game && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                                    <div>
                                        <h1 className="text-white font-semibold text-sm sm:text-base">
                                            {game.name}
                                        </h1>
                                        {game.provider && (
                                            <p className="text-gray-400 text-xs">
                                                {game.provider}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleFullscreen}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white"
                            aria-label={isInFullscreenMode ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            <Icon 
                                icon={isInFullscreenMode ? "lucide:minimize" : "lucide:maximize"} 
                                className="w-5 h-5"
                            />
                        </button>
                    </div>
                )}

                {/* Floating Close Button - Only for mobile in fullscreen mode */}
                {isInFullscreenMode && isMobile && (
                    <button
                        onClick={handleCloseFullscreen}
                        className="fixed top-4 left-4 z-20 p-3 bg-gray-900/90 hover:bg-gray-800 backdrop-blur-sm rounded-full transition-all duration-200 text-white shadow-lg"
                        aria-label="Exit fullscreen"
                    >
                        <Icon icon="lucide:x" className="w-6 h-6" />
                    </button>
                )}

                {/* Desktop: Collapsible fullscreen control */}
                {isInFullscreenMode && !isMobile && (
                    <div 
                        className="fixed top-4 right-4 z-20"
                        onMouseEnter={() => setIsDesktopControlExpanded(true)}
                        onMouseLeave={() => setIsDesktopControlExpanded(false)}
                    >
                        <button
                            onClick={handleFullscreen}
                            className={`
                                bg-gray-900/90 hover:bg-gray-800 backdrop-blur-sm rounded-lg 
                                transition-all duration-300 text-white shadow-lg flex items-center gap-2
                                ${isDesktopControlExpanded ? 'px-4 py-3' : 'p-2'}
                            `}
                            aria-label="Exit fullscreen"
                        >
                            <Icon 
                                icon="lucide:minimize" 
                                className={`transition-all duration-300 ${isDesktopControlExpanded ? 'w-5 h-5' : 'w-4 h-4'}`}
                            />
                            <span 
                                className={`
                                    text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                                    ${isDesktopControlExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}
                                `}
                            >
                                Exit Fullscreen
                            </span>
                        </button>
                    </div>
                )}

                {/* Game Iframe */}
                <div className="flex-1 relative bg-black">
                    {gameUrl ? (
                        <iframe
                            src={gameUrl}
                            className="w-full h-full border-0"
                            allow="fullscreen; autoplay; encrypted-media; gyroscope; accelerometer; picture-in-picture; clipboard-write"
                            allowFullScreen
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
                            title={game?.name || 'Game'}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Loading game content...</p>
                        </div>
                    )}
                </div>

                {/* Mobile Optimization: Add safe area padding for iOS */}
                <style jsx global>{`
                    @supports (padding: env(safe-area-inset-bottom)) {
                        .game-container {
                            padding-bottom: env(safe-area-inset-bottom);
                        }
                    }
                    
                    /* Hide scrollbars in game page */
                    body:has(.game-page-active) {
                        overflow: hidden;
                    }
                    
                    /* Optimize for mobile devices */
                    @media (max-width: 768px) {
                        .game-iframe {
                            touch-action: manipulation;
                        }
                    }
                `}</style>
            </div>
        </AuthGuard>
    );
}
