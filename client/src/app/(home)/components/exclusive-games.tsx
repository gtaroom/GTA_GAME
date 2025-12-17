'use client';
import GameCard from '@/components/game-card';
import NeonText from '@/components/neon/neon-text';
import { gamesData } from '@/data/games';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const ExclusiveGames = () => {
    return (
        <section className=' pb-[100px] max-sm:pb-[80px]'>
            <div className='container-xl max-lg:!px-0'>
                <div className='home-loggedout-center-title mb-3 md:mb-4 lg:mb-6 xl:mb-10'>
                    <NeonText
                        as='h2'
                        className='h1-title'
                        glowColor='--color-purple-500'
                    >
                        EXCLUSIVE GAMES
                    </NeonText>
                </div>

                <Swiper
                    className='exclusive-games-slider'
                    loop={true}
                    effect={'coverflow'}
                    centeredSlides={true}
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    grabCursor={true}
                    speed={800}
                    modules={[EffectCoverflow, Autoplay]}
                    breakpoints={{
                        0: {
                            slidesPerView: 3,
                            coverflowEffect: {
                                stretch: 0,
                                modifier: 1.5,
                                slideShadows: false,
                                rotate: 15,
                                depth: 200,
                            },
                        },
                        640: {
                            slidesPerView: 3,
                            coverflowEffect: {
                                stretch: 0,
                                modifier: 1,
                                slideShadows: false,
                                rotate: 15,
                                depth: 250,
                            },
                        },
                        768: {
                            slidesPerView: 4,
                            coverflowEffect: {
                                stretch: 0,
                                modifier: 1,
                                slideShadows: false,
                                rotate: 15,
                                depth: 313,
                            },
                        },
                    }}
                >
                    {gamesData.map((game, index) => (
                        <SwiperSlide key={index}>
                            <GameCard
                                game={game}
                                className='aspect-[1/1.5] md:aspect-[1/1.4]'
                                glowColor={`--color-${game.color}-500`}
                                glowSpread={1}
                                borderWidth={2}
                                glowLayers={4}
                                showBadge={false}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default ExclusiveGames;
