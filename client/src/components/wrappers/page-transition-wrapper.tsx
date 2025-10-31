'use client';
import { gsap } from 'gsap';
import { TransitionRouter } from 'next-transition-router';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const CIRCLE_DIAMETER = 64;
const OVERLAY_COLOR = 'oklch(38.1% 0.176 304.987)';
const OVERLAY_SHADOW =
    '0 0 20px rgba(173, 70, 255, 0.6), 0 0 60px rgba(173, 70, 255, 0.35)';

interface PageTransitionWrapperProps {
    children: ReactNode;
}

const formatRouteName = (route?: string | null) => {
    if (!route) return 'HOME';

    // Split route and query parameters
    const [cleanRoute, queryString] = route.split('?');
    const params = new URLSearchParams(queryString || '');

    // Special route mappings
    const routeMap: Record<string, string> = {
        '/buy-redeem': 'Coin Wallet',
        '/game-listing': 'Games',
        '/phone-verification': 'Phone Verification',
        '/email-verification': 'Verification',
        '/kyc-verification': 'KYC Verification',
        '/buy-coins/success': 'Purchase Successful',
        '/buy-coins/failed': 'Purchase Failed',
        '/buy-coins/cancelled': 'Purchase Cancelled',
    };

    // Check for exact matches first
    if (routeMap[cleanRoute]) {
        return routeMap[cleanRoute];
    }

    // Check if route includes certain keywords
    if (cleanRoute.includes('game-listing')) {
        return 'Games';
    }

    // Handle auth success page with query parameters
    if (cleanRoute === '/success') {
        const verified = params.get('verified');
        if (verified === 'phone') {
            return 'Phone Verified';
        }
        if (verified === 'true') {
            return 'Email Verified';
        }
        return 'Success';
    }

    // Handle auth failed page with query parameters
    if (cleanRoute === '/failed') {
        const token = params.get('token');
        if (token === 'invalid') {
            return 'Invalid Link';
        }
        if (token === 'expired') {
            return 'Link Expired';
        }
        return 'Verification Failed';
    }

    // Handle success/failed/cancelled routes (generic)
    if (cleanRoute.includes('/success')) {
        return 'Success';
    }
    if (cleanRoute.includes('/failed')) {
        return 'Failed';
    }
    if (cleanRoute.includes('/cancelled')) {
        return 'Cancelled';
    }

    // Handle verification routes
    if (cleanRoute.includes('verification')) {
        if (cleanRoute.includes('phone')) {
            return 'Phone Verification';
        }
        if (cleanRoute.includes('email')) {
            return 'Verification';
        }
        if (cleanRoute.includes('kyc')) {
            return 'KYC Verification';
        }
        return 'Verification';
    }

    // Default: format route by removing leading slash and replacing hyphens with spaces
    return cleanRoute.replace(/^\//, '').replace(/-/g, ' ').toUpperCase();
};

const computeCircleScale = () => {
    const { innerWidth: vw, innerHeight: vh } = window;
    const diameter = Math.hypot(vw, vh) + 100;
    return diameter / CIRCLE_DIAMETER;
};

export function PageTransitionWrapper({
    children,
}: PageTransitionWrapperProps) {
    const circleRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const overlayStyle = useMemo(
        () => ({
            backgroundColor: OVERLAY_COLOR,
            boxShadow: OVERLAY_SHADOW,
            transform: 'translate3d(0,0,0) scale(0.8)',
        }),
        []
    );

    const handleLeave = useCallback(
        async (next: () => void, _from?: string | null, to?: string | null) => {
            const circle = circleRef.current;
            const label = labelRef.current;
            if (!circle || !label || prefersReducedMotion) {
                next();
                return;
            }

            label.textContent = formatRouteName(to);

            const centerX = window.innerWidth / 2;
            const bottomY = window.innerHeight + 32;

            gsap.set(circle, {
                x: centerX - CIRCLE_DIAMETER / 2,
                y: bottomY - CIRCLE_DIAMETER,
                scale: 0.8,
                opacity: 1,
            });
            gsap.set(label, { opacity: 0, y: 10 });

            const timeline = gsap.timeline({ onComplete: next });

            timeline.to(circle, {
                y: window.innerHeight / 2 - CIRCLE_DIAMETER / 2,
                duration: 0.35,
                ease: 'power3.out',
            });

            timeline.to(
                circle,
                {
                    scale: computeCircleScale(),
                    duration: 0.55,
                    ease: 'power2.inOut',
                },
                '-=0.05'
            );

            timeline.to(
                label,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                },
                '-=0.35'
            );

            timeline.to(
                'main',
                {
                    opacity: 0.2,
                    duration: 0.35,
                    ease: 'power1.inOut',
                },
                '<'
            );
        },
        [prefersReducedMotion]
    );

    const handleEnter = useCallback(
        async (next: () => void) => {
            const circle = circleRef.current;
            const label = labelRef.current;
            if (!circle || !label || prefersReducedMotion) {
                next();
                return;
            }

            gsap.set('main', { opacity: 0 });

            const timeline = gsap.timeline({
                onComplete: () => {
                    gsap.set(circle, { opacity: 0, scale: 0.8, y: -100 });
                    gsap.set(label, { opacity: 0 });
                    // Ensure main opacity is always reset to 1
                    gsap.set('main', { opacity: 1 });
                    next();
                },
                onError: () => {
                    // Fallback: ensure opacity is reset even if animation fails
                    gsap.set('main', { opacity: 1 });
                    gsap.set(circle, { opacity: 0, scale: 0.8, y: -100 });
                    gsap.set(label, { opacity: 0 });
                    next();
                }
            });

            timeline.to('main', {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
            });

            timeline.to(label, { opacity: 0, duration: 0.2 }, '-=0.2');

            timeline.to(circle, {
                y: -120,
                scale: 0.6,
                duration: 0.45,
                ease: 'power3.in',
            });
        },
        [prefersReducedMotion]
    );

    return (
        <TransitionRouter auto leave={handleLeave} enter={handleEnter}>
            <div className='circle-overlay pointer-events-none fixed inset-0 z-[60]'>
                <div
                    ref={circleRef}
                    className='circle size-16 select-none rounded-full opacity-0'
                    style={overlayStyle}
                />
                <div
                    ref={labelRef}
                    className='circle-label fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center'
                />
            </div>

            {children}
        </TransitionRouter>
    );
}
