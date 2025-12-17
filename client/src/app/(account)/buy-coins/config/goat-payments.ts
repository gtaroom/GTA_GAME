/**
 * GoatPayments Configuration
 * Centralized configuration for GoatPayments integration
 */

export interface GoatPaymentsConfig {
    tokenizationKey: string;
    primaryColor: string;
    secondaryColor: string;
    buttonText: string;
    instructionText: string;
    paymentType: string;
    fieldCvvDisplay: string;
    currency: string;
    country: string;
    applePaySelector: string;
    googlePaySelector: string;
}

export const GOAT_PAYMENTS_CONFIG: GoatPaymentsConfig = {
    tokenizationKey: "8Zbsgc-3r3c4A-92W7B6-hjM797",
    primaryColor: "#37805B",
    secondaryColor: "#19C687",
    buttonText: "Pay Now",
    instructionText: "Enter your payment information",
    paymentType: "cc",
    fieldCvvDisplay: "show",
    currency: "USD",
    country: "US",
    applePaySelector: ".apple-pay-button",
    googlePaySelector: ".google-pay-button",
};

/**
 * Payment method types supported by GoatPayments
 */
export type PaymentMethodType = 'card' | 'applepay' | 'googlepay';

/**
 * Payment token response interface
 */
export interface PaymentTokenResponse {
    token: string;
    card?: {
        number: string;
        bin: string;
        exp: string;
        hash: string;
        type: string;
    };
    wallet?: {
        cardNetwork: string;
    };
    tokenType?: string;
}

/**
 * Payment result interface
 */
export interface GoatPaymentResult {
    success: boolean;
    token?: string;
    paymentMethod?: PaymentMethodType;
    error?: string;
}
