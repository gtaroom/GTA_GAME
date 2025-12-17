'use client';

import GameCard from '@/components/game-card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/contexts/ui-context';
import { useGames } from '@/contexts/game-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import { useEffect, useState, useCallback } from 'react';
import { getGames } from '@/lib/api/games';
import { convertToLegacyGames } from '@/lib/game-utils';
import { GAME_TABS, DEFAULT_TAB, type GameTab } from '@/lib/game-tabs';

interface TabData {
  tab: GameTab;
  games: any[];
  loading: boolean;
  error: string | null;
}

export default function CasinoGames() {
  const { sidebarOpen } = useUI();
  const { lg } = useBreakPoint();
  const router = useTransitionRouter();
  const { setActiveGameType } = useGames();
  
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
        limit: 24,
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

  // Load initial tab
  useEffect(() => {
    const initialTab = GAME_TABS.find(tab => tab.id === activeTab);
    if (initialTab) {
      loadTabGames(initialTab);
    }
  }, [activeTab, loadTabGames]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = GAME_TABS.find(t => t.id === tabId);
    if (tab) {
      loadTabGames(tab);
      // Update global game type for currency display
      setActiveGameType(tabId as any);
    }
  };

  const currentTabData = tabData.get(activeTab);

  return (
    <section className='mb-16'>
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
                className=''
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

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
                  className={`mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${lg && sidebarOpen ? 'xl:grid-cols-6 2xl:grid-cols-7' : 'xl:grid-cols-7 2xl:grid-cols-8'} gap-2 sm:gap-4 md:gap-6 xl:gap-4 2xl:gap-6`}
                >
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className='aspect-square bg-gray-800/20 rounded-lg animate-pulse'
                      />
                    ))
                  ) : error ? (
                    // Error state
                    <div className='col-span-full text-center py-12'>
                      <p className='text-red-400 mb-4'>{error}</p>
                      <Button
                        onClick={() => loadTabGames(tab)}
                        variant='secondary'
                        size='sm'
                      >
                        Retry
                      </Button>
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
                        key={`${tab.id}-${game.id || index}`}
                        game={game}
                        animation={true}
                      />
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className='flex items-center justify-center'>
        <Button size='lg' onClick={() => router.push('/game-listing')}>
          See More Games
        </Button>
      </div>
    </section>
  );
}
