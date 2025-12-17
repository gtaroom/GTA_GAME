'use client';
import React from 'react';

import { getCssText } from '../../stitches.config';

export function StitchesRegistry({ children }: { children: React.ReactNode }) {
    React.useLayoutEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = getCssText();
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return <>{children}</>;
}
