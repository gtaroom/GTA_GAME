'use client';

import { useEffect } from 'react';

/**
 * Safety component to ensure main element opacity is always correct
 * This prevents the page transition wrapper from leaving elements with low opacity
 */
export default function OpacitySafety() {
    useEffect(() => {
        const checkAndFixOpacity = () => {
            const mainElement = document.querySelector('main');
            if (mainElement) {
                const computedStyle = window.getComputedStyle(mainElement);
                const opacity = parseFloat(computedStyle.opacity);
                
                // If opacity is too low (likely stuck from page transition), fix it
                if (opacity < 0.5) {
                    console.log('OpacitySafety: Detected low opacity, fixing...', opacity);
                    mainElement.style.opacity = '1';
                }
            }
        };

        // Check immediately
        checkAndFixOpacity();

        // Check after a short delay to catch any transition issues
        const timeoutId = setTimeout(checkAndFixOpacity, 1000);

        // Check periodically to catch any stuck states
        const intervalId = setInterval(checkAndFixOpacity, 5000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    return null;
}
