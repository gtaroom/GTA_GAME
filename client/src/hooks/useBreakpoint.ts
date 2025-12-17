'use client';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

const breakpoints = {
    xxs: 360,
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1360,
    is2xl: 1536,
};

export function useBreakPoint() {
    const [breakpoint, setBreakpoint] = useState({
        xxs: false,
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        xxl: false,
        is2xl: false,
    });

    const xxs = useMediaQuery({ minWidth: breakpoints.xxs });
    const xs = useMediaQuery({ minWidth: breakpoints.xs });
    const sm = useMediaQuery({ minWidth: breakpoints.sm });
    const md = useMediaQuery({ minWidth: breakpoints.md });
    const lg = useMediaQuery({ minWidth: breakpoints.lg });
    const xl = useMediaQuery({ minWidth: breakpoints.xl });
    const xxl = useMediaQuery({ minWidth: breakpoints.xxl });
    const is2xl = useMediaQuery({ minWidth: breakpoints.is2xl });

    useEffect(() => {
        setBreakpoint({ xxs, xs, sm, md, lg, xl, xxl, is2xl });
    }, [xxs, xs, sm, md, lg, xl, xxl, is2xl]);

    return breakpoint;
}
