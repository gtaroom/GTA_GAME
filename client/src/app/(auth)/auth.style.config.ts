// Global Types
export type ElementSize = 'sm' | 'md' | 'lg';

// Auth inputs config
export interface AuthInputConfigProps {
    size: ElementSize;
    glowColor: string;
    glowSpread: number;
    borderColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
}

export const inputSettings: AuthInputConfigProps = {
    size: 'md',
    glowColor: 'var(--color-purple-500)',
    glowSpread: 0.8,
    backgroundColor: 'var(--color-purple-500)',
    backgroundOpacity: 0.08,
    borderColor: 'var(--color-white)',
};

// Auth social button config
export interface SocialButtonConfigProps {
    size: ElementSize;
    glowSpread?: number;
    backgroundOpacity?: number;
    borderColor?: string;
    neon?: boolean;
    variant?: 'primary' | 'secondary' | 'neon';
    neonBoxClass?: string;
    btnInnerClass?: string;
}

export interface ProviderButtonConfigProps {
    glowColor: string;
    backgroundColor: string;
}

export const socialButtonSettings: SocialButtonConfigProps = {
    size: 'md',
    glowSpread: 0.8,
    backgroundOpacity: 0.08,
    borderColor: 'var(--color-white)',
    neon: true,
    variant: 'neon',
    neonBoxClass: 'rounded-[8px]',
    btnInnerClass: 'inline-flex items-center justify-center gap-2',
};

export const googleButtonSettings: ProviderButtonConfigProps = {
    glowColor: 'var(--color-blue-500)',
    backgroundColor: 'var(--color-blue-500)',
};

export const appleButtonSettings: ProviderButtonConfigProps = {
    glowColor: 'var(--color-purple-500)',
    backgroundColor: 'var(--color-purple-500)',
};
