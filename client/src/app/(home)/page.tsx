'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import ExclusiveGames from './components/exclusive-games';
import FeatureGames from './components/feature-games';
import FeatureTiels from './components/feature-tiels';
import VideoSlider from './components/gtoa-videos';
import HeroSection from './components/hero-section';
import LatestWinners from './components/latest-winners';
import ReferFriends from './components/refer-friends';
import SignUpBonus from './components/sign-up-bonus';
import SpinWheelSection from './components/spin-wheel';
const Home = () => {
    const router = useRouter();
    const { isLoggedIn, isInitializing } = useAuth();

    const handleRedirect = useCallback(() => {
        if (!isInitializing && isLoggedIn) {
            console.log('Home: User is logged in, redirecting to lobby');
            router.replace('/lobby');
        }
    }, [isLoggedIn, isInitializing, router]);

    useEffect(() => {
        console.log('Home useEffect triggered:', {
            isLoggedIn,
            isInitializing,
        });
        handleRedirect();
    }, [handleRedirect]);

    // Show loading while auth is initializing
    if (isInitializing) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="before:absolute before:top-0 before:left-0 before:block before:h-screen before:w-full before:bg-[url('/home-page-logged-out/hero-sec-bg.avif')] before:bg-cover before:bg-center before:bg-no-repeat before:content-['']">
            {/* <main className="before:absolute before:top-0 before:left-0 before:block before:h-screen before:w-full before:bg-[url('/home-page-logged-out/hero-sec-bg.png')] before:bg-cover before:bg-center before:bg-no-repeat before:content-['']"> */}
            <HeroSection />
            <FeatureGames />
            <ReferFriends />
            <VideoSlider />
            <ExclusiveGames />
            <FeatureTiels />
            <LatestWinners />
            <SpinWheelSection />
            <SignUpBonus />
        </main>
    );
};

export default Home;
