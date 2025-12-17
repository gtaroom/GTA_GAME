export function asCssColor(input?: string): string | undefined {
    if (!input) return undefined;
    const v = input.trim();

    if (
        v.startsWith('var(') ||
        v.startsWith('#') ||
        v.startsWith('rgb(') ||
        v.startsWith('rgba(') ||
        v.startsWith('hsl(') ||
        v.startsWith('hsla(') ||
        v.startsWith('oklch(')
    ) {
        return v;
    }

    if (v.startsWith('--')) return `var(${v})`;

    if (v.startsWith('color-')) return `var(--${v})`;

    return v;
}
