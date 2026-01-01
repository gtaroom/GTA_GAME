/**
 * Payment Methods Configuration
 * Centralized configuration for all payment providers
 */

export interface PaymentMethod {
    id: string;
    name: string;
    label: string;
    icon?: string; // Single icon: Iconify icon string (e.g., 'logos:visa') or image path (e.g., '/payment-logos/visa.png')
    icons?: string[]; // Multiple icons: Array of Iconify icon strings or image paths
    iconType?: 'iconify' | 'image'; // Optional: defaults to 'iconify' if not specified
    color: string;
    description: string;
    available: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'goatpayments',
        name: 'goatpayments',
        label: 'Card/Apple Pay/GPay',
        icons: ['logos:visa','logos:mastercard', 'simple-icons:applepay', 'simple-icons:googlepay'],
        color: '--color-blue-500',
        description: 'Credit Card, Apple Pay, Google Pay',
        available: true, // Now enabled
    },
    {
        id: 'plisio',
        name: 'plisio',
        label: 'Crypto',
        icon: 'logos:bitcoin',
        color: '--color-orange-500',
        description: 'Bitcoin, Ethereum, Crypto',
        available: true,
    },
    // {
    //     id: 'soap',
    //     name: 'soap',
    //     label: 'Card/Bank',
    //     icon: 'logos:mastercard',
    //     color: '--color-green-500',
    //     description: 'Debit Card, Bank Transfer',
    //     available: false,
    // },
    {
        id: 'centryos',
        name: 'centryos',
        label: 'CashApp',
        icons: ['/payment-logos/icons8-cash-app.svg'],
        color: '--color-purple-500',
        description: 'CashApp',
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
