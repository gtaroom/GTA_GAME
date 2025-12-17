'use client';

import { memo, useLayoutEffect } from 'react';
import useMeasure from 'react-use-measure';

import HeaderLoggedIn from './logged-in';
import HeaderLoggedOut from './logged-out';

interface HeaderProps {
    isUserLoggedIn?: boolean;
}

const DEFAULT_HEADER_HEIGHT = 111;

const Header: React.FC<HeaderProps> = memo(({ isUserLoggedIn = false }) => {
    const [ref, { height }] = useMeasure();

    useLayoutEffect(() => {
        const h = height || DEFAULT_HEADER_HEIGHT;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
    }, [height]);

    const CommonHeader = isUserLoggedIn ? HeaderLoggedIn : HeaderLoggedOut;

    return <CommonHeader headerRef={ref} />;
});

export default Header;
