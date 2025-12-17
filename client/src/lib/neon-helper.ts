import { asCssColor } from '@/lib/css-color';

export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function withOpacity(
    color?: string,
    opacity: number = 1
): string | undefined {
    const c = asCssColor(color);
    if (!c) return undefined;
    const pct = clamp(opacity, 0, 1) * 100;
    if (pct >= 100) return c;
    return `color-mix(in srgb, ${c} ${pct}%, transparent)`;
}
