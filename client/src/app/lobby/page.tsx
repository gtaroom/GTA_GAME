import BannerSlider from './components/banner-slider';
import CasinoGames from './components/casino-games';
import LatestWinnersSlider from './components/latest-winners-slider';
import PromotionsSlider from './components/promotions-slidebr';
import VIPSection from './components/vip-section';
import AuthGuard from '@/components/auth-guard';
import AuthDebug from '@/components/auth-debug';
import VerificationChecker from '@/components/verification/verification-checker';

const Lobby = () => {
    return (
        <>
            {/* <AuthDebug /> */}
            <AuthGuard>
                <VerificationChecker />
                <BannerSlider />
                <CasinoGames />
                <PromotionsSlider />
                <VIPSection />
                <LatestWinnersSlider />
            </AuthGuard>
        </>
    );
};

export default Lobby;
