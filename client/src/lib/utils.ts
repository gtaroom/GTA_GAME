import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatNumber = (num: number) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '0';
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    // Use compact notation for >= 10,000 (5+ digits only)
    if (abs >= 10_000) {
        const units = [
            { value: 1_000_000_000_000, symbol: 'T' },
            { value: 1_000_000_000, symbol: 'B' },
            { value: 1_000_000, symbol: 'M' },
            { value: 1_000, symbol: 'K' },
        ];

        for (const u of units) {
            if (abs >= u.value) {
                const raw = abs / u.value;
                // One decimal for smaller magnitudes (e.g., 1.2K, 9.5M), none for big (e.g., 120K)
                const withPrecision = raw < 100 ? Number(raw.toFixed(1)) : Math.round(raw);
                const numPart = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(withPrecision);
                return `${sign}${numPart}${u.symbol}`;
            }
        }
    }

    // Fallback: standard locale formatting
    return new Intl.NumberFormat('en-US').format(num);
};