'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import AuthWrapper from '@/components/wrappers/auth-wrapper';
import { useIsLoggedIn } from '@/contexts/auth-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import { useTransitionRouter } from 'next-transition-router';
import Footer from '../footer';
import Header from '../header';
import MobileBottomMenu from '../mobile-bottom-menu';
import Sidebar from '../sidebar';

const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/email-verification',
    '/phone-verification',
    '/success',
    '/failed',
];

type Props = {
    children: React.ReactNode;
};

const LayoutWrapper: React.FC<Props> = ({ children }) => {
    const { isLoggedIn } = useIsLoggedIn();
    const { xl, md } = useBreakPoint();
    const pathname = usePathname();
    const router = useTransitionRouter();

    const isAuthPage = AUTH_ROUTES.some(route => pathname.startsWith(route));

    useEffect(() => {
        if (isLoggedIn && pathname === '/') {
            router.replace('/lobby');
        }
    }, [isLoggedIn, pathname, router]);

    const loggedOutHomePage = pathname === '/';

    return (
        <>
            {isAuthPage ? (
                <AuthWrapper>{children}</AuthWrapper>
            ) : (
                <div
                    className={cn(
                        'flex min-h-0 flex-1 flex-col',
                        loggedOutHomePage && 'pt-[var(--header-height)]!'
                    )}
                    style={{
                        paddingTop:
                            isLoggedIn === false
                                ? 'calc(var(--header-height) + clamp(2rem, 1.775rem + 1.125vw, 3.125rem))'
                                : 'var(--header-height)',
                        paddingLeft:
                            xl && isLoggedIn ? 'var(--sidebar-width)' : '0',
                    }}
                >
                    <Header isUserLoggedIn={isLoggedIn} />
                    {!isAuthPage && isLoggedIn && <Sidebar />}
                    <main
                        className={cn(
                            'flex-1',
                            isLoggedIn && 'p-5 lg:p-8',
                            isLoggedIn ? 'user-logged-in' : 'user-logged-out'
                        )}
                    >
                        {children}
                    </main>
                    <Footer />
                    {/* <LiveChatButton /> */}
                </div>
            )}

            {!md && !isAuthPage && <MobileBottomMenu />}
        </>
    );
};

export default LayoutWrapper;
