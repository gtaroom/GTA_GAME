'use client';

import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';

import ButtonGroup from '@/components/ui/button-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUI } from '@/contexts/ui-context';
import { sidebarLinks, sidebarLinksBottom } from '@/data/links';

import { useBreakPoint } from '@/hooks/useBreakpoint';
import { toggleBodyScroll } from '@/lib/toggle-body-scroll';
import { useTransitionRouter } from 'next-transition-router';
import { SidebarHeader } from './sidebar-header';
import SidebarLinks from './sidebar-links';
import SidebarSeprator from './sidebar-seprator';
import { SidebarButton } from './sidebar-toggle-btn';
import  FortuneWheelCard from './sidebar-fortune-wheel';
import  VipLevelCard from './sidebar-vip-level';

const SERVER_DEFAULT_WIDTH = 100;
const OPEN_WIDTH = 280;
const COLLAPSED_WIDTH = 100;

const Sidebar: React.FC = () => {
    const { xl } = useBreakPoint();
    const { sidebarOpen, toggleSidebar } = useUI();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const router = useTransitionRouter();

    const [sidebarRef, { width: measuredSidebarWidth }] = useMeasure();
    const [headerRef, { height: headerHeight }] = useMeasure();

    const handleNavigate = () => {
        if (!xl && sidebarOpen) {
            toggleSidebar();
        }
    };

    useEffect(() => {
        if (!xl) {
            toggleBodyScroll(sidebarOpen);
        } else {
            toggleBodyScroll(false);
        }
    }, [sidebarOpen, xl]);

    useEffect(() => {
        if (mounted && xl) {
            const w =
                measuredSidebarWidth ||
                (sidebarOpen ? OPEN_WIDTH : COLLAPSED_WIDTH);
            document.documentElement.style.setProperty(
                '--sidebar-width',
                `${w}px`
            );
        } else if (mounted && !xl) {
            document.documentElement.style.setProperty(
                '--sidebar-width',
                sidebarOpen ? `${OPEN_WIDTH}px` : '0px'
            );
        }

        document.documentElement.style.setProperty(
            '--sidebar-header-height',
            `${headerHeight || 64}px`
        );
    }, [measuredSidebarWidth, headerHeight, sidebarOpen, xl, mounted]);

    const effectiveWidth = mounted
        ? xl
            ? sidebarOpen
                ? OPEN_WIDTH
                : COLLAPSED_WIDTH
            : OPEN_WIDTH
        : SERVER_DEFAULT_WIDTH;

    return (
        <>
            {mounted && !xl && sidebarOpen && (
                <div
                    className='fixed inset-0 bg-[#310A47]/70 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out'
                    onClick={toggleSidebar}
                    aria-label='Close sidebar'
                />
            )}

            <aside
                ref={sidebarRef}
                style={{ width: effectiveWidth }}
                className={`
                    bg-background fixed top-0 h-screen border-r border-white/20 z-40
                    transition-transform duration-300 ease-in-out
                    ${mounted && !xl
                        ? sidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full'
                        : 'translate-x-0'
                    }
                    ${mounted && !xl ? 'left-0' : 'left-0'}
                `}
            >
                <div className='flex h-full flex-col'>
                    <div ref={headerRef} className='px-5'>
                        <SidebarHeader
                            sidebarOpen={sidebarOpen}
                            toggleSidebar={toggleSidebar}
                        />
                        <SidebarSeprator className='mt-5' />
                    </div>

                    <ScrollArea
                        className='h-[calc(100%-var(--sidebar-header-height))]'
                        type='always'
                    >
                        <ButtonGroup className='w-full flex-wrap gap-3 px-5 pt-6'>
                            <SidebarButton
                                label='Get Coins'
                                icon='mingcute:copper-coin-fill'
                                sidebarOpen={sidebarOpen}
                                tooltipColor='#d97706'
                                onClick={() => {
                                    router.push('/buy-coins');
                                    handleNavigate();
                                }}
                            />
                            <SidebarButton
                                label='Redeem'
                                icon='mdi:gift'
                                variant='secondary'
                                sidebarOpen={sidebarOpen}
                                tooltipColor='#10b981'
                                onClick={() => {
                                    router.push('/redeem');
                                    handleNavigate();
                                }}
                            />
                        </ButtonGroup>


                        {

                            sidebarOpen && 
                            <>
                                <div className='px-5'>
                                    <SidebarSeprator className='my-5' />
                                </div>
                                <div className='mb-5'>
                                    <FortuneWheelCard />
                                </div>
                                <VipLevelCard />
                            </>
                        }


                        <div className='px-5'>
                            <SidebarSeprator className='my-5' />
                        </div>

                        <div className='w-full px-5 pt-1 pb-5'>
                            <SidebarLinks
                                links={sidebarLinks}
                                onNavigate={handleNavigate}
                            />
                            <SidebarSeprator className='mt-5 mb-6' />
                            <SidebarLinks
                                links={sidebarLinksBottom}
                                onNavigate={handleNavigate}
                            />
                        </div>
                        {/* <ScrollBar orientation='vertical' /> */}
                    </ScrollArea>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;