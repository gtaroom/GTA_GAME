/**
 * Buy Coins Types
 * Shared types for coin packages and payment-related components
 */

export interface CoinPackage {
    totalGC: number;
    bonusGC?: number;
    tag?: string;
    price: string;
    amount: number; // USD amount
    productId?: string; // Optional product identifier
}

export interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPackage: CoinPackage | null;
}

export interface GoatPaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPackage: CoinPackage | null;
}

export interface CoinCalculatorProps {
    onPackageSelect?: (coinPackage: CoinPackage) => void;
}

export interface CoinPackagesProps {
    onPackageSelect?: (coinPackage: CoinPackage) => void;
}

// Payment processing states
export type PaymentStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PaymentResult {
    success: boolean;
    message?: string;
    data?: {
        invoiceUrl?: string;
        creditedAmount?: number;
        bonusAmount?: number;
    };
}

// Success/Failed page props
export interface PaymentSuccessPageProps {
    amount: string;
    totalGC: string;
    bonusGC: string;
    orderId: string;
}

export interface PaymentFailedPageProps {
    reason: string;
}
