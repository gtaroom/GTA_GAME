/**
 * Payment Methods Configuration
 * Centralized configuration for all payment providers
 */

export interface PaymentMethod {
    id: string;
    name: string;
    label: string;
    icon: string;
    color: string;
    description: string;
    available: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    // {
    //     id: 'goatpayments',
    //     name: 'goatpayments',
    //     label: 'Card/Apple Pay/GPay',
    //     icon: 'lucide:credit-card',
    //     color: '--color-blue-500',
    //     description: 'Pay with credit card, Apple Pay, or Google Pay',
    //     available: true, // Now enabled
    // },
    {
        id: 'plisio',
        name: 'plisio',
        label: 'Crypto',
        icon: 'tabler:currency-bitcoin',
        color: '--color-orange-500',
        description: ' Pay using Bitcoin, Ethereum, or other supported cryptocurrencies',
        available: true,
    },
    {
        id: 'soap',
        name: 'soap',
        label: 'Card/Bank',
        icon: 'mingcute:bank-line',
        color: '--color-green-500',
        description: 'Pay using debit or or direct bank transfer',
        available: true,
    },
    {
        id: 'centryos',
        name: 'centryos',
        label: 'CashApp/Wallet',
        icon: 'lucide:smartphone',
        color: '--color-purple-500',
        description: 'Pay using CashApp, Apple Pay, or Google Pay',
        available: true,
    },
];

/**
 * Get available payment methods only
 */
export const getAvailablePaymentMethods = (): PaymentMethod[] => {
    return PAYMENT_METHODS.filter(method => method.available);
};

/**
 * Get payment method by ID
 */
export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
    return PAYMENT_METHODS.find(method => method.id === id);
};
