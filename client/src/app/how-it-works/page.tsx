'use client';
import PageBanner from '@/components/page-banner';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import ChooseGameTypes from './components/choose-game-types';
import ManageYourProgress from './components/manage-your-progress';
import NoPurchaseNecessary from './components/no-purchase-necessary';
import SweepCoinReward from './components/sweep-coin-reward';
import TwoWallets from './components/two-wallets';
import WaysToPay from './components/ways-to-pay';

export default function HowItsWork() {
    const { lg, xl } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <>
            <PageBanner
                className='mb-14 xl:mb-20 md:mb-16'
                bgImage='/page-banner/how-its-work.jpg'
                title='How Golden Ticket Works'
                description='Two game modes. Three game types. Endless fun.'
                bottomContent={
                    <ButtonGroup className='flex-wrap gap-2 sm:gap-4 lg:gap-6'>
                        <Button
                            size={xl ? 'xl' : `${lg ? 'lg' : 'md'}`}
                            className='xl:w-[240px] md:w-[160px] lg:w-[200px] w-full'
                            onClick={() => router.push('/game-listing')}
                        >
                            Play Now
                        </Button>
                        <Button
                            size={xl ? 'xl' : `${lg ? 'lg' : 'md'}`}
                            variant='secondary'
                            className='xl:w-[240px] md:w-[160px] lg:w-[200px] w-full'
                            onClick={() => router.push('/free-entry-form')}
                        >
                            Claim Free Coins
                        </Button>
                    </ButtonGroup>
                }
            />
            <WaysToPay />
            <TwoWallets />
            <ChooseGameTypes />
            <SweepCoinReward />
            <ManageYourProgress />
            <NoPurchaseNecessary />
        </>
    );
}
