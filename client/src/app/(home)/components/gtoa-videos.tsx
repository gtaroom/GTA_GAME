import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const VideoSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const videos = [
        {
            id: 'e5ZcdY4GSy0',
            title: 'How to Play',
            thumbnailTitle: 'HOW TO PLAY',
            description:
                'In this video, we walk you through the entire player journey',
            gradient: 'from-purple-600/80 to-pink-600/80',
            thumbnailGradient: 'from-purple-600 to-pink-600',
        },
        {
            id: '4kd7yetMnK4',
            title: 'How It Works GC, Exclusive GC & Sweeps Coins',
            thumbnailTitle: 'HOW IT WORKS: GOLD COINS AND SWEEPS COINS',
            description:
                'We break down exactly how our ecosystem works so you can maximize your gameplay',
            gradient: 'from-blue-600/80 to-cyan-600/80',
            thumbnailGradient: 'from-blue-600 to-cyan-600',
        },
        {
            id: 'WQkfgGu83Ng',
            title: 'How To Purchase Gold Coins',
            thumbnailTitle: 'HOW TO PURCHASE GOLD COINS',
            description:
                'Here is the official guide on how to purchase Gold Coins at GTOA',
            gradient: 'from-orange-600/80 to-red-600/80',
            thumbnailGradient: 'from-yellow-600 to-orange-600',
        },
        {
            id: '5LrxNgFp8Bg',
            title: 'How To Redeem Sweeps Coins',
            thumbnailTitle: 'HOW TO REDEEM',
            description:
                'Here is exactly how to redeem your Sweeps Coins for prizes at GTOA',
            gradient: 'from-green-600/80 to-emerald-600/80',
            thumbnailGradient: 'from-red-600 to-rose-600',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPlaying && !isModalOpen) {
                setProgress(prev => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + 0.5;
                });
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, isModalOpen]);

    const handlePrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? videos.length - 1 : prev - 1));
        setProgress(0);
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === videos.length - 1 ? 0 : prev + 1));
        setProgress(0);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <div className='w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-6 sm:py-10 px-3 sm:px-6 overflow-hidden font-sans mb-8'>
            <div className='w-full max-w-7xl mx-auto relative'>
                <div className='relative aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/50'>
                    <div className='absolute inset-0'>
                        <iframe
                            src={`https://www.youtube.com/embed/${videos[currentIndex].id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${videos[currentIndex].id}`}
                            className='w-full h-full scale-150'
                            allow='autoplay; encrypted-media'
                            style={{ border: 'none', pointerEvents: 'none' }}
                        />
                    </div>

                    <div
                        className={`absolute inset-0 bg-gradient-to-r ${videos[currentIndex].gradient} mix-blend-multiply transition-all duration-1000`}
                    />

                    <div className='relative h-full flex flex-col justify-between p-4 sm:p-6 md:p-12 lg:p-16'>
                        <div className='flex gap-1 sm:gap-2 mb-2 sm:mb-4'>
                            {videos.map((_, idx) => (
                                <div
                                    key={idx}
                                    className='flex-1 h-0.5 sm:h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm'
                                >
                                    <div
                                        className='h-full bg-white rounded-full transition-all duration-300'
                                        style={{
                                            width:
                                                idx === currentIndex
                                                    ? `${progress}%`
                                                    : idx < currentIndex
                                                      ? '100%'
                                                      : '0%',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className='flex-1 flex items-center justify-center'>
                            <div className='max-w-2xl space-y-2 sm:space-y-3 md:space-y-4 text-center sm:text-left px-2'>
                                <h1 className='text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl'>
                                    {videos[currentIndex].title}
                                </h1>
                                <p className='text-xs sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow-lg line-clamp-2'>
                                    {videos[currentIndex].description}
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className='px-5 py-2.5 sm:px-8 sm:py-4 bg-white text-purple-900 rounded-full font-bold text-sm sm:text-lg hover:bg-purple-100 transform hover:scale-105 transition-all duration-300 shadow-2xl mt-2 sm:mt-4'
                                >
                                    Watch Video
                                </button>
                            </div>
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 sm:gap-4'>
                                <button
                                    onClick={togglePlay}
                                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all'
                                >
                                    {isPlaying ? (
                                        <Pause className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    ) : (
                                        <Play className='w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5' />
                                    )}
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all'
                                >
                                    {isMuted ? (
                                        <VolumeX className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    ) : (
                                        <Volume2 className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    )}
                                </button>
                            </div>
                            <div className='text-white/80 text-xs sm:text-sm font-medium backdrop-blur-sm bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full'>
                                {currentIndex + 1} / {videos.length}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePrevious}
                        className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all'
                    >
                        <ChevronLeft className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                    </button>
                    <button
                        onClick={handleNext}
                        className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all'
                    >
                        <ChevronRight className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                    </button>
                </div>

                {/* Enhanced Thumbnail Navigation with Text Labels */}
                <div className='flex gap-3 sm:gap-4 mt-4 sm:mt-8 justify-center overflow-x-auto pb-2 px-2'>
                    {videos.map((video, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setProgress(0);
                            }}
                            className={`group relative w-32 h-20 sm:w-48 sm:h-28 md:w-56 md:h-32 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 ${
                                idx === currentIndex
                                    ? 'ring-3 sm:ring-4 ring-white scale-105 sm:scale-110 shadow-2xl shadow-white/30'
                                    : 'opacity-70 hover:opacity-100 hover:scale-105 shadow-lg'
                            }`}
                        >
                            {/* Background Image with Fallback */}
                            <img
                                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                className='w-full h-full object-cover'
                                alt={video.thumbnailTitle}
                            />

                            {/* Gradient Overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${video.thumbnailGradient} mix-blend-multiply transition-all duration-300 ${
                                    idx === currentIndex
                                        ? 'opacity-70'
                                        : 'opacity-80'
                                }`}
                            />

                            {/* Dark Overlay for Better Text Contrast */}
                            <div className='absolute inset-0 bg-black/40' />

                            {/* Text Label */}
                            <div className='absolute inset-0 flex items-center justify-center p-2'>
                                <div className='text-center'>
                                    <p
                                        className={`font-bold text-white leading-tight transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'text-[10px] sm:text-sm md:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                                                : 'text-[9px] sm:text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                                        }`}
                                    >
                                        {video.thumbnailTitle}
                                    </p>
                                </div>
                            </div>

                            {/* Active Indicator - Bottom Border */}
                            {idx === currentIndex && (
                                <div className='absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white shadow-lg' />
                            )}

                            {/* Hover Effect - Glow */}
                            <div
                                className={`absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 ${
                                    idx === currentIndex ? 'bg-white/5' : ''
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10'>
                    <div
                        className='absolute inset-0 bg-black/90 backdrop-blur-sm'
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className='relative w-full max-w-5xl aspect-video bg-black rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl'>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className='absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors'
                        >
                            <X className='w-5 h-5 sm:w-6 sm:h-6' />
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${videos[currentIndex].id}?autoplay=1&controls=1&rel=0`}
                            className='w-full h-full'
                            allow='autoplay; encrypted-media; fullscreen'
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSlider;
