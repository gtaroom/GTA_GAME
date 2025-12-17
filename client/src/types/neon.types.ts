export interface NeonCommonProps {
    glowColor?: string;
    intensity?: number;
    glowLayers?: number;
    glowSpread?: number;
    borderColor?: string;
    borderWidth?: number;
}

export interface NeonBoxOnlyProps {
    insetGlow?: boolean;
    backgroundColor?: string;
    backgroundOpacity?: number;
}

export interface NeonTextOnlyProps {
    color?: string;
}

export interface NeonToggleProp {
    neon?: boolean;
}

export interface NeonTextToggleProp {
    neonText?: boolean;
}

export type NeonBoxPublicProps = NeonToggleProp &
    NeonCommonProps &
    NeonBoxOnlyProps;

export type NeonTextPublicProps = NeonTextToggleProp &
    NeonCommonProps &
    NeonTextOnlyProps;

export const NEON_BOX_DEFAULTS: Required<Omit<NeonBoxPublicProps, 'neon'>> = {
    glowColor: 'color-purple-500',
    intensity: 6,
    glowLayers: 3,
    glowSpread: 1,
    borderColor: 'color-white',
    borderWidth: 2,
    insetGlow: true,
    backgroundColor: 'transparent',
    backgroundOpacity: 1,
};

export const NEON_TEXT_DEFAULTS: Omit<Required<NeonCommonProps>, ''> &
    Partial<NeonTextOnlyProps> = {
    glowColor: 'color-purple-500',
    intensity: 6,
    glowLayers: 3,
    glowSpread: 1,
    borderColor: 'color-white',
    borderWidth: 0,
    // color: undefined  // intentionally unset
};

const BOX_KEYS = new Set<keyof NeonBoxPublicProps>([
    'neon',
    'glowColor',
    'intensity',
    'glowLayers',
    'glowSpread',
    'borderColor',
    'borderWidth',
    'insetGlow',
    'backgroundColor',
    'backgroundOpacity',
]);

const TEXT_KEYS = new Set<keyof NeonTextPublicProps>([
    'neonText',
    'glowColor',
    'intensity',
    'glowLayers',
    'glowSpread',
    'borderColor',
    'borderWidth',
    'color',
]);

export function splitNeonBoxProps<P extends Record<string, any>>(
    props: P
): [NeonBoxPublicProps, Omit<P, keyof NeonBoxPublicProps>] {
    const neon: Partial<NeonBoxPublicProps> = {};
    const rest: Record<string, any> = {};

    for (const key in props) {
        if (BOX_KEYS.has(key as keyof NeonBoxPublicProps)) {
            (neon as any)[key] = props[key];
        } else {
            rest[key] = props[key];
        }
    }

    return [
        neon as NeonBoxPublicProps,
        rest as Omit<P, keyof NeonBoxPublicProps>,
    ];
}

export function splitNeonTextProps<P extends Record<string, any>>(
    props: P
): [NeonTextPublicProps, Omit<P, keyof NeonTextPublicProps>] {
    const neon: Partial<NeonTextPublicProps> = {};
    const rest: Record<string, any> = {};

    for (const key in props) {
        if (TEXT_KEYS.has(key as keyof NeonTextPublicProps)) {
            (neon as any)[key] = props[key];
        } else {
            rest[key] = props[key];
        }
    }

    return [
        neon as NeonTextPublicProps,
        rest as Omit<P, keyof NeonTextPublicProps>,
    ];
}
