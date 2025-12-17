'use client';

import { useEffect, useState } from 'react';

export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('matchMedia' in window)) {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = (event: MediaQueryList | MediaQueryListEvent) => {
            setPrefersReducedMotion('matches' in event ? event.matches : mediaQuery.matches);
        };

        setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', updatePreference);

        return () => mediaQuery.removeEventListener('change', updatePreference);
    }, []);

    return prefersReducedMotion;
}