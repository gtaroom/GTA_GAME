'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useGameAccount } from '@/hooks/useGameAccount';
import { getGames } from '@/lib/api/games';
import { convertToLegacyGames } from '@/lib/game-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BuyCoinsSuccessPage() {
    const params = useSearchParams();
    const router = useRouter();
    const {
        balance: userBalance,
        loading: balanceLoading,
        refresh: refreshWalletBalance,
    } = useWalletBalance();

    const [selectedGame, setSelectedGame] = useState('');
    const [loadAmount, setLoadAmount] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showAmountError, setShowAmountError] = useState<string | null>(null);
    const [games, setGames] = useState<any[]>([]);
    const [gamesLoading, setGamesLoading] = useState(true);

    // ✅ NEW: Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<{
        game: string;
        amount: number;
    } | null>(null);

    const amount = params.get('amount');
    const bonusGC = params.get('bonusGC');
    const orderId = params.get('orderId');

    const totalGC = userBalance.toString();
    const CONVERSION_RATE = 100;
    const MIN_LOAD_AMOUNT = 10;

    const { requestNewAccount, isLoading, error } = useGameAccount();

    // Fetch exclusive games using getGames API
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setGamesLoading(true);
                console.log('🎮 Fetching all games...');

                // Fetch ALL games
                const response = await getGames({
                    limit: 100,
                    sort: 'name:asc',
                });

                console.log('📦 Raw games from API:', response.data.games);

                // Filter BEFORE converting (while we still have the 'type' field)
                const rawExclusiveGames = response.data.games.filter(
                    (game: any) => {
                        const isExclusive =
                            game.type === 'Web Only' ||
                            game.type === 'Download Required';
                        console.log(
                            `${game.name}: type="${game.type}" -> ${isExclusive ? '✅' : '❌'}`
                        );
                        return isExclusive;
                    }
                );

                console.log(
                    '🎮 Filtered raw exclusive games:',
                    rawExclusiveGames
                );

                const exclusiveGames = convertToLegacyGames(rawExclusiveGames);
                console.log('✅ Converted exclusive games:', exclusiveGames);

                setGames(exclusiveGames);
            } catch (error) {
                console.error('❌ Error fetching games:', error);
                setGames([]);
            } finally {
                setGamesLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handleSubmit = async () => {
        if (!selectedGame) {
            setShowAmountError('Please select a game');
            return;
        }

        const amount = parseFloat(loadAmount);
        if (!loadAmount || isNaN(amount) || amount < MIN_LOAD_AMOUNT) {
            setShowAmountError(`Minimum load amount is $${MIN_LOAD_AMOUNT}`);
            return;
        }

        const requiredGC = amount * CONVERSION_RATE;
        const availableGC = parseInt(totalGC);
        if (requiredGC > availableGC) {
            setShowAmountError(
                `Insufficient balance. You need ${requiredGC.toLocaleString()} GC but only have ${availableGC.toLocaleString()} GC`
            );
            return;
        }

        setShowAmountError(null);

        try {
            await requestNewAccount({
                gameId: selectedGame,
                amount: amount,
            });

            // ✅ Store request details and show modal
            const selectedGameObj = games.find(
                g => (g._id || g.id) === selectedGame
            );

            setSubmittedRequest({
                game:
                    selectedGameObj?.name ||
                    selectedGameObj?.title ||
                    'Selected Game',
                amount: amount,
            });

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error:', error);
            setShowAmountError(
                'There was an error submitting your request. Please contact support.'
            );
        }
    };

    const selectedGameObj = games.find(g => {
        const gameId = g._id || g.id;
        return gameId === selectedGame;
    });
    const loadAmountNum = parseFloat(loadAmount) || 0;
    const requiredGC = loadAmountNum * CONVERSION_RATE;
    const remainingCoins = parseInt(totalGC) - requiredGC;

    return (
        <>
            <div
                className='min-h-screen relative overflow-hidden'
                style={{
                    background:
                        'radial-gradient(ellipse at top, #3d2463 0%, #251447 30%, #180f2e 60%, #0d0818 100%)',
                }}
            >
                <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className='absolute rounded-full'
                            style={{
                                width: Math.random() * 4 + 1 + 'px',
                                height: Math.random() * 4 + 1 + 'px',
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%',
                                background: [
                                    '#ec4899',
                                    '#a855f7',
                                    '#8b5cf6',
                                    '#06b6d4',
                                    '#10b981',
                                ][Math.floor(Math.random() * 5)],
                                opacity: Math.random() * 0.4 + 0.1,
                                animation: `float ${Math.random() * 20 + 10}s linear infinite`,
                                animationDelay: Math.random() * 5 + 's',
                            }}
                        />
                    ))}
                </div>

                <style jsx>{`
                    @keyframes float {
                        0%,
                        100% {
                            transform: translateY(0) translateX(0);
                        }
                        25% {
                            transform: translateY(-30px) translateX(20px);
                        }
                        50% {
                            transform: translateY(-60px) translateX(-20px);
                        }
                        75% {
                            transform: translateY(-30px) translateX(30px);
                        }
                    }
                `}</style>

                <div
                    className='absolute left-0 top-0 bottom-0 w-1'
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(16, 185, 129, 1) 50%, rgba(16, 185, 129, 0.8) 70%, rgba(16, 185, 129, 0) 100%)',
                        boxShadow:
                            '0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.3)',
                    }}
                ></div>
                <div
                    className='absolute right-0 top-0 bottom-0 w-1'
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(16, 185, 129, 1) 50%, rgba(16, 185, 129, 0.8) 70%, rgba(16, 185, 129, 0) 100%)',
                        boxShadow:
                            '0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.3)',
                    }}
                ></div>

                <div className='container mx-auto max-w-2xl px-6 py-12 relative z-10'>
                    <div className='flex justify-center mb-6 md:mb-8 relative'>
                        <div
                            className='absolute w-28 h-28 md:w-36 md:h-36 rounded-full'
                            style={{
                                background:
                                    'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                                animation: 'pulse 3s ease-in-out infinite',
                            }}
                        ></div>
                        <div
                            className='w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative backdrop-blur-sm'
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
                                boxShadow:
                                    '0 0 50px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.2), inset 0 0 30px rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                            }}
                        >
                            <svg
                                className='w-10 h-10 md:w-12 md:h-12 text-emerald-300'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(110, 231, 183, 0.8))',
                                }}
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={3}
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                    </div>

                    <h1
                        className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-3 md:mb-4 tracking-wider px-4'
                        style={{
                            background:
                                'linear-gradient(180deg, #d1fae5 0%, #6ee7b7 30%, #10b981 70%, #047857 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))',
                            letterSpacing: '0.05em',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        PURCHASE COMPLETE!
                    </h1>

                    <p className='text-center text-gray-300 text-base md:text-lg mb-2 font-light px-4'>
                        Your Gold Coins are ready to play.
                    </p>
                    <p className='text-center text-gray-500 text-xs md:text-sm mb-8 md:mb-12 leading-relaxed font-light px-4'>
                        Choose a game below and load your coins to start playing
                        now.
                    </p>

                    <div
                        className='rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 relative overflow-hidden backdrop-blur-md'
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(99, 47, 153, 0.12) 0%, rgba(76, 29, 149, 0.18) 50%, rgba(59, 7, 100, 0.15) 100%)',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            boxShadow:
                                '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                        }}
                    >
                        <div className='absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 border-t border-l border-purple-400/20 rounded-tl-2xl md:rounded-tl-3xl'></div>
                        <div className='absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 border-t border-r border-purple-400/20 rounded-tr-2xl md:rounded-tr-3xl'></div>
                        <div className='absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 border-b border-l border-purple-400/20 rounded-bl-2xl md:rounded-bl-3xl'></div>
                        <div className='absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 border-b border-r border-purple-400/20 rounded-br-2xl md:rounded-br-3xl'></div>

                        <div className='flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-2'>
                            <div
                                className='h-px flex-1 rounded-full'
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.5) 50%, transparent 100%)',
                                }}
                            ></div>
                            <h2
                                className='text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap'
                                style={{
                                    background:
                                        'linear-gradient(180deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.4))',
                                    fontFamily:
                                        'system-ui, -apple-system, sans-serif',
                                }}
                            >
                                Start Playing Now
                            </h2>
                            <div
                                className='h-px flex-1 rounded-full'
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.5) 50%, transparent 100%)',
                                }}
                            ></div>
                        </div>

                        <p className='text-center text-gray-400 mb-8 md:mb-10 text-xs md:text-sm font-light leading-relaxed px-2'>
                            Select a game and enter the amount you want to load
                            into it.
                        </p>

                        <div className='mb-6 md:mb-8'>
                            <label className='block text-white text-base md:text-lg font-semibold mb-3 md:mb-4 tracking-wide px-1'>
                                Choose Your Game
                            </label>

                            <div className='relative'>
                                <button
                                    onClick={() =>
                                        setDropdownOpen(!dropdownOpen)
                                    }
                                    disabled={gamesLoading}
                                    className='w-full px-4 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl text-left flex items-center justify-between transition-all duration-300'
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.15) 100%)',
                                        border: '1.5px solid rgba(251, 191, 36, 0.3)',
                                        boxShadow:
                                            '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                    }}
                                >
                                    <span className='text-gray-300 flex items-center gap-3 md:gap-4 text-sm md:text-base font-light'>
                                        {gamesLoading ? (
                                            <span className='opacity-60 animate-pulse'>
                                                Loading games...
                                            </span>
                                        ) : selectedGameObj ? (
                                            <>
                                                {selectedGameObj.thumbnail ? (
                                                    <img
                                                        src={
                                                            selectedGameObj.thumbnail
                                                        }
                                                        alt={
                                                            selectedGameObj.name ||
                                                            selectedGameObj.title
                                                        }
                                                        className='w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover'
                                                        style={{
                                                            filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        className='text-2xl md:text-3xl'
                                                        style={{
                                                            filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                                                        }}
                                                    >
                                                        🎮
                                                    </span>
                                                )}
                                                <span className='font-medium text-white'>
                                                    {selectedGameObj.name ||
                                                        selectedGameObj.title}
                                                </span>
                                            </>
                                        ) : (
                                            <span className='opacity-60'>
                                                Select a game to jump into
                                                action
                                            </span>
                                        )}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 md:w-5 md:h-5 text-yellow-400 transition-transform duration-300 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                        style={{
                                            filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))',
                                        }}
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M19 9l-7 7-7-7'
                                        />
                                    </svg>
                                </button>

                                {dropdownOpen &&
                                    !gamesLoading &&
                                    games.length > 0 && (
                                        <div
                                            className='absolute z-20 w-full mt-2 md:mt-3 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-xl'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, rgba(59, 7, 100, 0.95) 0%, rgba(30, 1, 67, 0.97) 100%)',
                                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                                boxShadow:
                                                    '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.2)',
                                            }}
                                        >
                                            {games.map((game, index) => (
                                                <button
                                                    key={game._id || index}
                                                    onClick={() => {
                                                        setSelectedGame(
                                                            game._id ||
                                                                game.id ||
                                                                index.toString()
                                                        );
                                                        setDropdownOpen(false);
                                                        setShowAmountError(
                                                            null
                                                        );
                                                    }}
                                                    className='w-full px-4 md:px-6 py-3 md:py-4 text-left flex items-center gap-3 md:gap-4 transition-all duration-200 border-b border-purple-800/20 last:border-b-0'
                                                    style={{
                                                        background:
                                                            selectedGame ===
                                                            (game._id ||
                                                                game.id ||
                                                                index.toString())
                                                                ? 'rgba(168, 85, 247, 0.15)'
                                                                : 'transparent',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background =
                                                            'rgba(168, 85, 247, 0.2)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background =
                                                            selectedGame ===
                                                            (game._id ||
                                                                game.id ||
                                                                index.toString())
                                                                ? 'rgba(168, 85, 247, 0.15)'
                                                                : 'transparent';
                                                    }}
                                                >
                                                    {game.thumbnail ? (
                                                        <img
                                                            src={game.thumbnail}
                                                            alt={
                                                                game.name ||
                                                                game.title
                                                            }
                                                            className='w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover'
                                                            style={{
                                                                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                                                            }}
                                                        />
                                                    ) : (
                                                        <span
                                                            className='text-2xl md:text-3xl'
                                                            style={{
                                                                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                                                            }}
                                                        >
                                                            🎮
                                                        </span>
                                                    )}
                                                    <span className='text-white font-medium text-sm md:text-base'>
                                                        {game.name ||
                                                            game.title}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </div>

                        <p className='text-center text-gray-500 text-xs leading-relaxed font-light mb-6 md:mb-8 px-2'>
                            Our support team will load the coins directly into
                            your selected game.
                        </p>

                        <div className='mb-8 md:mb-10'>
                            <label className='block text-white text-base md:text-lg font-semibold mb-3 md:mb-4 tracking-wide px-1'>
                                Amount to Load into Game
                            </label>

                            <div
                                className='rounded-xl p-4 mb-4'
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.2) 100%)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    boxShadow:
                                        '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className='w-6 h-6 rounded-full flex items-center justify-center'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                boxShadow:
                                                    '0 0 10px rgba(251, 191, 36, 0.5)',
                                            }}
                                        >
                                            <span className='text-xs font-bold text-black'>
                                                GC
                                            </span>
                                        </div>
                                        <span className='text-sm font-semibold text-purple-300'>
                                            Your Wallet Balance
                                        </span>
                                    </div>
                                    {balanceLoading ? (
                                        <span className='text-base font-bold text-purple-200 animate-pulse'>
                                            Loading...
                                        </span>
                                    ) : (
                                        <span className='text-base font-bold text-purple-200'>
                                            {userBalance.toLocaleString()} GC
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className='relative'>
                                <div
                                    className='absolute inset-0 rounded-xl md:rounded-2xl'
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.15) 100%)',
                                        filter: 'blur(20px)',
                                        opacity: loadAmount ? 0.6 : 0,
                                    }}
                                ></div>

                                <span
                                    className='absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-yellow-400 text-xl md:text-2xl font-bold pointer-events-none z-10'
                                    style={{
                                        textShadow: loadAmount
                                            ? '0 0 15px rgba(251, 191, 36, 0.6)'
                                            : 'none',
                                    }}
                                >
                                    $
                                </span>

                                <input
                                    type='number'
                                    placeholder='0'
                                    value={loadAmount}
                                    onChange={e => {
                                        setLoadAmount(e.target.value);
                                        setShowAmountError(null);
                                    }}
                                    min={MIN_LOAD_AMOUNT}
                                    step='1'
                                    className='w-full py-5 md:py-6 pl-16 md:pl-20 pr-6 md:pr-8 rounded-xl md:rounded-2xl font-bold text-2xl md:text-3xl focus:outline-none transition-all duration-300 relative z-10'
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.15) 100%)',
                                        border: loadAmount
                                            ? '2px solid rgba(251, 191, 36, 0.6)'
                                            : '1.5px solid rgba(139, 92, 246, 0.3)',
                                        boxShadow: loadAmount
                                            ? '0 8px 30px rgba(251, 191, 36, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.05)'
                                            : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                        color: '#fbbf24',
                                        textShadow: loadAmount
                                            ? '0 0 20px rgba(251, 191, 36, 0.5)'
                                            : 'none',
                                    }}
                                />
                            </div>

                            {loadAmount && loadAmountNum >= MIN_LOAD_AMOUNT && (
                                <div className='mt-3 md:mt-4 space-y-2 px-2'>
                                    <div className='text-xs text-purple-300 flex items-center gap-2'>
                                        <span>💰</span>
                                        <span>
                                            This will deduct{' '}
                                            {requiredGC.toLocaleString()} GC
                                            from your wallet
                                        </span>
                                    </div>
                                    <div
                                        className={`text-xs md:text-sm font-medium ${remainingCoins < 0 ? 'text-red-400' : 'text-emerald-400'}`}
                                    >
                                        {remainingCoins < 0
                                            ? `⚠️ Insufficient balance (need ${Math.abs(remainingCoins).toLocaleString()} more GC)`
                                            : `✓ Remaining balance: ${remainingCoins.toLocaleString()} GC`}
                                    </div>
                                </div>
                            )}

                            {showAmountError && (
                                <div className='mt-3 flex items-center gap-2 text-red-400 text-sm px-2'>
                                    <span>⚠️</span>
                                    <span>{showAmountError}</span>
                                </div>
                            )}

                            <div
                                className='mt-4 p-3 rounded-lg'
                                style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                }}
                            >
                                <div className='flex items-start gap-2 text-xs text-purple-300'>
                                    <span className='text-base'>💡</span>
                                    <div>
                                        <span className='font-semibold'>
                                            Pro Tip:
                                        </span>{' '}
                                        Our support team will handle the coin
                                        loading process. You'll receive an
                                        email/SMS confirmation once your coins
                                        are loaded and ready to play. Minimum
                                        load amount is ${MIN_LOAD_AMOUNT}.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                !selectedGame ||
                                !loadAmount ||
                                loadAmountNum < MIN_LOAD_AMOUNT ||
                                remainingCoins < 0 ||
                                isLoading
                            }
                            className='w-full py-5 md:py-6 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group'
                            style={{
                                background:
                                    'linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
                                boxShadow:
                                    '0 10px 40px rgba(132, 204, 22, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                color: '#0a0a0a',
                                border: '1px solid rgba(163, 230, 53, 0.3)',
                            }}
                        >
                            <span className='relative z-10'>
                                {isLoading
                                    ? 'PROCESSING...'
                                    : `SUBMIT REQUEST ${loadAmountNum >= MIN_LOAD_AMOUNT ? `($${loadAmountNum.toFixed(2)})` : ''}`}
                            </span>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                        </button>

                        <div className='flex items-center justify-center gap-4 md:gap-6 mt-6 md:mt-8 text-xs md:text-sm font-light flex-wrap'>
                            <button
                                onClick={() => router.push('/game-listing')}
                                className='text-gray-400 hover:text-yellow-400 transition-all duration-200'
                                style={{
                                    textShadow:
                                        '0 0 10px rgba(251, 191, 36, 0)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(251, 191, 36, 0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(251, 191, 36, 0)';
                                }}
                            >
                                Browse All Games
                            </button>
                            <span className='text-purple-500/30'>•</span>
                            <button
                                onClick={() => router.push('/profile')}
                                className='text-gray-400 hover:text-yellow-400 transition-all duration-200'
                                style={{
                                    textShadow:
                                        '0 0 10px rgba(251, 191, 36, 0)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(251, 191, 36, 0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(251, 191, 36, 0)';
                                }}
                            >
                                Go to My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ SUCCESS MODAL */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent
                    className='sm:max-w-md border-none'
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(99, 47, 153, 0.95) 0%, rgba(76, 29, 149, 0.98) 50%, rgba(59, 7, 100, 0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <DialogHeader>
                        {/* Success Icon */}
                        <div className='flex justify-center mb-4'>
                            <div
                                className='w-20 h-20 rounded-full flex items-center justify-center relative'
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
                                    boxShadow:
                                        '0 0 50px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(16, 185, 129, 0.1)',
                                    border: '2px solid rgba(16, 185, 129, 0.5)',
                                }}
                            >
                                <svg
                                    className='w-10 h-10 text-emerald-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                    style={{
                                        filter: 'drop-shadow(0 0 8px rgba(110, 231, 183, 0.8))',
                                    }}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                    />
                                </svg>
                            </div>
                        </div>

                        <DialogTitle
                            className='text-2xl font-bold text-center'
                            style={{
                                background:
                                    'linear-gradient(180deg, #d1fae5 0%, #6ee7b7 50%, #10b981 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Request Submitted Successfully! 🎉
                        </DialogTitle>
                    </DialogHeader>

                    {/* Request Summary */}
                    <div
                        className='my-6 p-4 rounded-lg'
                        style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                        }}
                    >
                        <div className='space-y-3 text-sm'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-400'>Game:</span>
                                <span className='font-semibold text-white'>
                                    {submittedRequest?.game}
                                </span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-400'>Amount:</span>
                                <span className='font-bold text-yellow-400'>
                                    ${submittedRequest?.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-400'>
                                    Coins to Load:
                                </span>
                                <span className='font-semibold text-purple-300'>
                                    {(
                                        (submittedRequest?.amount || 0) *
                                        CONVERSION_RATE
                                    ).toLocaleString()}{' '}
                                    GC
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div
                        className='p-4 rounded-lg mb-4'
                        style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        <div className='flex items-start gap-3'>
                            <div className='text-2xl mt-1'>👥</div>
                            <div className='flex-1'>
                                <p className='text-sm font-semibold text-blue-300 mb-2'>
                                    Our Support Team is Processing Your Request
                                </p>
                                <p className='text-xs text-gray-400 leading-relaxed'>
                                    You'll receive an email/SMS notification
                                    once your coins have been loaded and your
                                    game account is ready to play. This usually
                                    takes just a few minutes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-3'>
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.push('/game-listing');
                            }}
                            className='w-full font-bold text-base py-6'
                            style={{
                                background:
                                    'linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
                                boxShadow: '0 4px 20px rgba(132, 204, 22, 0.4)',
                            }}
                        >
                            🎮 Explore More Games
                        </Button>

                        <Button
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.push('/profile');
                            }}
                            // variant='outline'
                            className='w-full font-semibold text-base py-6'
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderColor: 'rgba(168, 85, 247, 0.4)',
                                color: '#a855f7',
                            }}
                        >
                            Go to My Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
