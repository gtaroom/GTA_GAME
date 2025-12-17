import Hamburger from 'hamburger-react';
import { Link } from 'next-transition-router';
import Image from 'next/image';

import { useUI } from '@/contexts/ui-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import CurrencySwitch from '../currency-switch';
import {
    Notification,
    NotificationBell,
    NotificationTrigger,
} from '../notification';
import SearchGames from '../search-games';
import SiteLogo from '../site-logo';
import UserProfile from '../user-profile';
const HeaderLoggedIn = ({
    headerRef,
}: {
    headerRef: React.Ref<HTMLDivElement>;
}) => {
    const { toggleSidebar } = useUI();
    const { xl, lg, md, is2xl } = useBreakPoint();

    return (
        <header
            ref={headerRef}
            className='fixed top-0 right-0 z-[4] w-full flex items-center xl:w-[calc(100%-var(--sidebar-width))] border-b border-white/20 sm:px-6 px-4 sm:h-[90px] h-[80px] backdrop-blur-[200px] bg-background/80'
        >
            <div className='flex items-center justify-between w-full'>
                <div className='flex items-center xl:gap-10 lg:gap-8 gap-6'>
                    {md && !xl && (
                        <div className='-ml-1.5'>
                            <Hamburger
                                toggled={false}
                                toggle={toggleSidebar}
                                size={30}
                            />
                        </div>
                    )}
                    <SiteLogo className='max-w-[80px] sm:-ml-2 ml-0 -mt-1' />
                    {md && <SearchGames />}
                </div>

                <div className='flex w-full items-center justify-end lg:gap-6 sm:gap-4 gap-3'>
                    {lg && (
                        <Link
                            href='/buy-coins'
                            className='h-[55px] w-auto'
                            title='Buy Coins'
                        >
                            <Image
                                src='/header/buy-coins.png'
                                height={54}
                                width={100}
                                alt='Buy Coins'
                                className='scale-pulse scale-pulse-xs scale-pulse-fast h-full w-auto object-contain'
                            />
                        </Link>
                    )}
                  
                        <Notification>
                            <div>
                                <NotificationTrigger>
                                    <NotificationBell />
                                </NotificationTrigger>
                            </div>
                        </Notification>
                 
                    <CurrencySwitch className='ml-2' />
                    <UserProfile />
                </div>
            </div>
        </header>
    );
};

export default HeaderLoggedIn;
