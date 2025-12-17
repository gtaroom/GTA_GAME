/**
 * Buy Coins Module Exports
 * Centralized exports for the buy-coins module
 */

// Types
export type {
    CoinPackage,
    PaymentModalProps,
    GoatPaymentsModalProps,
    CoinCalculatorProps,
    CoinPackagesProps,
    PaymentStatus,
    PaymentResult,
    PaymentSuccessPageProps,
    PaymentFailedPageProps,
} from './types';

// Components
export { default as PaymentModal } from './components/payment-modal';
export { default as GoatPaymentsModal } from './components/goat-payments-modal';
export { default as CoinCalculator } from './components/coin-calculator';
export { default as CoinPackages } from './components/coin-packages';

// Hooks
export { usePaymentModal } from './hooks/usePaymentModal';
export { useGoatPayments } from './hooks/useGoatPayments';

// Services
export { paymentService } from './services/payment-service';
export { goatPaymentsService } from './services/goat-payments-service';

// Config
export { PAYMENT_METHODS, getAvailablePaymentMethods } from './config/payment-methods';
export { GOAT_PAYMENTS_CONFIG } from './config/goat-payments';
