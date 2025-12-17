// types/SpinWheel.ts
export interface SpinWheelOption {
    id: string;
    label: React.ReactNode;
    color?: string;
    value?: any;
}

export interface SpinWheelProps {
    options: SpinWheelOption[];
    onSpin?: (result: SpinWheelOption) => void;
    size?: number;
    spinDuration?: number;
    disabled?: boolean;
    // If provided, the wheel will spin and land on the returned index
    requestWinnerIndex?: () => Promise<number> | number;
    // CSS timing function for the spin transition
    easing?: string;
    // Reveal result slightly before the animation ends (ms)
    revealOffsetMs?: number;
    // If your visual pointer is not exactly at 12 o'clock, calibrate here (degrees)
    pointerOffsetDeg?: number;
}
