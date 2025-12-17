'use client';
import GameCard from '@/components/game-card';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { featureGamesData } from '@/data/home-logged-out';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';

const FeatureGames = () => {
    const { md } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <section className='pb-[200px]'>
            <div className='container-xl'>
                {/* Feature Game Title */}
                <div className='home-loggedout-center-title mb-[50px]'>
                    <NeonText
                        as='h2'
                        className='h1-title'
                        glowColor='--color-purple-500'
                    >
                        FEATURED GAMES
                    </NeonText>
                </div>

                {/* All Feature Games */}
                <Tabs
                    defaultValue='tab-1'
                    className="relative mb-14 text-center before:pointer-events-none before:absolute before:bottom-[-20px] before:left-[-20px] before:z-[2] before:h-[260px] before:w-[calc(100%+40px)] before:bg-[linear-gradient(0deg,rgba(49,10,71,1)_8%,rgba(49,10,71,0)_100%)] before:content-['']"
                >
                    <ScrollArea
                        className='max-lg:w-screen max-lg:relative max-lg:transform max-lg:-translate-x-1/2 max-lg:left-1/2'
                        type='always'
                    >
                        <TabsList className='text-foreground mb-2.5 h-auto gap-2 rounded-none px-0 max-lg:px-5'>
                            {featureGamesData.map((game, index) => (
                                <TabsTrigger
                                    key={index}
                                    value={`tab-${index + 1}`}
                                    className=''
                                >
                                    {game.title}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>
                    {featureGamesData.map((game, index) => (
                        <TabsContent key={index} value={`tab-${index + 1}`}>
                            <div className='mt-5 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                                {game.games.map(
                                    (game, index) =>
                                        index < 18 && (
                                            <GameCard
                                                key={index}
                                                game={game}
                                                animation={true}
                                            />
                                        )
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* See More Games */}
                <div className='text-center'>
                    <Button
                        variant='secondary'
                        size={md ? 'xl' : 'lg'}
                        className={`${md ? 'w-[240px]' : 'w-[180px]'}`}
                        onClick={() => router.push('/game-listing')}
                    >
                        See More Games
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeatureGames;
