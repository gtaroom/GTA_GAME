'use client';
import GameCard from '@/components/game-card';
import GamePagination from '@/components/game-card/game-pagination';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import SecTitle from '@/components/sec-title';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsLoggedIn } from '@/contexts/auth-context';
import { useGames } from '@/contexts/game-context';
import { useUI } from '@/contexts/ui-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { getGames } from '@/lib/api/games';
import { DEFAULT_TAB, GAME_TABS, type GameTab } from '@/lib/game-tabs';
import { convertToLegacyGames } from '@/lib/game-utils';
import { cn } from '@/lib/utils';
import { Icon } from '@/rootnode_modules/@iconify/react/dist/iconify';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth-guard';

interface TabData {
  tab: GameTab;
  games: any[];
  loading: boolean;
  error: string | null;
}

function GameListing() {
    const { sidebarOpen } = useUI();
    const { lg } = useBreakPoint();
    const { isLoggedIn } = useIsLoggedIn();
    const { setActiveGameType } = useGames();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState(DEFAULT_TAB.id);
    const [tabData, setTabData] = useState<Map<string, TabData>>(new Map());
    const [loading, setLoading] = useState(false);

    // Load games for a specific tab
    const loadTabGames = useCallback(async (tab: GameTab) => {
        if (tabData.has(tab.id)) return; // Already loaded

        setLoading(true);
        try {
            const response = await getGames({
                types: tab.types as any,
                limit: 56,
                sort: 'name:asc',
            });

            const games = convertToLegacyGames(response.data.games);
            
            setTabData(prev => new Map(prev).set(tab.id, {
                tab,
                games,
                loading: false,
                error: null,
            }));
        } catch (error) {
            setTabData(prev => new Map(prev).set(tab.id, {
                tab,
                games: [],
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load games',
            }));
        } finally {
            setLoading(false);
        }
    }, [tabData]);

    // Initialize tab from URL (?tab=bonus|signature|exclusive|all), then load it
    useEffect(() => {
        const tabFromQuery = (searchParams.get('tab') || '').toLowerCase();
        const found = GAME_TABS.find(t => t.id === tabFromQuery);
        const initialId = found ? found.id : activeTab;
        setActiveTab(initialId);
        const initialTab = GAME_TABS.find(tab => tab.id === initialId);
        if (initialTab) {
            loadTabGames(initialTab);
            setActiveGameType(initialId as any);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get('tab')]);

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const tab = GAME_TABS.find(t => t.id === tabId);
        if (tab) {
            loadTabGames(tab);
            // Update global game type for currency display
            setActiveGameType(tabId as any);
            // Reflect selection in URL for deep-linking
            const params = new URLSearchParams(Array.from(searchParams.entries()));
            params.set('tab', tabId);
            router.replace(`/game-listing?${params.toString()}`);
        }
    };

    return (
        <AuthGuard>
            <section className='text-center mb-10 mt-2'>
                <div className={cn(isLoggedIn ? 'w-full' : 'container-xxl')}>
                    <NeonText as='h1' className='h1-title'>
                        Games
                    </NeonText>
                </div>
            </section>

            {/* All Feature Games */}
            <section className='lg:mb-16 sm:mb-10 mb-8'>
                <div className={cn(isLoggedIn ? 'w-full' : 'container-xxl')}>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className='relative mb-12 text-center'>
                        <ScrollArea
                            type='always'
                            className='max-xl:w-screen max-xl:relative max-xl:transform max-xl:-translate-x-1/2 max-xl:left-1/2'
                        >
                            <TabsList className='text-foreground mb-2.5 h-auto gap-2 rounded-none px-0 max-xl:px-8'>
                                {GAME_TABS.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                    >
                                        {tab.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollBar orientation='horizontal' />
                        </ScrollArea>

                        {/* <div className='mt-5 mb-3 flex gap-4 max-sm:flex-col items-center justify-between'>
                            <SecTitle
                                icon={
                                    <Image
                                        src='/sections-icon/all-games.png'
                                        height={40}
                                        width={40}
                                        alt='All Games'
                                    />
                                }
                                color='--color-purple-500'
                            >
                                All Games
                            </SecTitle>

                            <div className='flex items-center gap-4 '>
                                <NeonText
                                    className='text-base font-bold text-nowrap'
                                    glowSpread={0.4}
                                >
                                    Filter By
                                </NeonText>

                                <Select>
                                    <SelectTrigger showIcon={false}>
                                        <NeonBox
                                            className='py-3 px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none w-[200px] flex-1 backdrop-blur-2xl'
                                            glowColor='--color-purple-500'
                                            backgroundColor='--color-purple-500'
                                            backgroundOpacity={0.2}
                                            glowSpread={0.8}
                                            enableHover
                                        >
                                            <SelectValue
                                                className='text-base font-bold capitalize'
                                                placeholder='All Games'
                                            />

                                            <Icon
                                                icon='lucide:chevron-down'
                                                fontSize={24}
                                            />
                                        </NeonBox>
                                    </SelectTrigger>
                                    <SelectContent />
                                </Select>
                            </div>
                        </div> */}

                        {GAME_TABS.map((tab) => {
                            const data = tabData.get(tab.id);
                            const games = data?.games || [];
                            const isLoading = data?.loading || (tab.id === activeTab && loading);
                            const error = data?.error;

                            return (
                                <TabsContent key={tab.id} value={tab.id}>
                                    <div className='space-y-4'>
                                        {/* Tab Description */}
                                        <div className='text-center'>
                                            <p className='text-gray-400 text-sm lg:text-base'>
                                                {tab.description}
                                            </p>
                                        </div>

                                        {/* Games Grid */}
                                        <div
                                            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${lg && sidebarOpen ? 'xl:grid-cols-6 2xl:grid-cols-7' : 'xl:grid-cols-7 2xl:grid-cols-8'} gap-2 sm:gap-4 md:gap-6 xl:gap-4 2xl:gap-6`}
                                        >
                                            {isLoading ? (
                                                // Loading skeleton
                                                Array.from({ length: 24 }).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className='aspect-square bg-gray-800/20 rounded-lg animate-pulse'
                                                    />
                                                ))
                                            ) : error ? (
                                                // Error state
                                                <div className='col-span-full text-center py-12'>
                                                    <p className='text-red-400 mb-4'>{error}</p>
                                                    <button
                                                        onClick={() => loadTabGames(tab)}
                                                        className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : games.length === 0 ? (
                                                // Empty state
                                                <div className='col-span-full text-center py-12'>
                                                    <p className='text-gray-400'>Coming soon...</p>
                                                </div>
                                            ) : (
                                                // Games
                                                games.map((game, index) => (
                                                    <GameCard
                                                        key={`${tab.id}-${game._id || index}`}
                                                        game={game}
                                                        animation={true}
                                                    />
                                                ))
                                            )}
                                        </div>

                                        {/* Pagination */}
                                        {!isLoading && !error && games.length > 0 && (
                                            <div className='mt-8'>
                                                <GamePagination />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
            </section>
        </AuthGuard>
    );
}

export default GameListing;