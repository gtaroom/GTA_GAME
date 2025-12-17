/**
 * Payment Modal Hook
 * Custom hook for managing payment modal state and logic
 */

import { useState, useCallback } from 'react';
import { paymentService } from '../services/payment-service';
import type { PaymentMethod } from '../config/payment-methods';
import type { CoinPackage } from '../types';

interface UsePaymentModalReturn {
    selectedPaymentMethod: PaymentMethod | null;
    isProcessing: boolean;
    isRedirecting: boolean;
    error: string | null;
    selectPaymentMethod: (method: PaymentMethod) => void;
    processPayment: (packageData: CoinPackage) => Promise<void>;
    clearError: () => void;
}

export const usePaymentModal = (): UsePaymentModalReturn => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectPaymentMethod = useCallback((method: PaymentMethod) => {
        if (!method.available) return;
        setSelectedPaymentMethod(method);
        setError(null); // Clear any previous errors
    }, []);

    const processPayment = useCallback(async (packageData: CoinPackage) => {
        if (!selectedPaymentMethod) {
            setError('Please select a payment method');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await paymentService.createPayment({
                amount: packageData.amount,
                paymentGateway: selectedPaymentMethod.name,
                currency: 'USD',
                productId: packageData.productId || '',
            });

            if (response.success && response.data) {
                setIsProcessing(false);
                setIsRedirecting(true);
                await paymentService.redirectToPayment(response.data.invoiceUrl);
            } else {
                setError(response.message || 'Payment creation failed');
                setIsProcessing(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment processing failed');
            setIsProcessing(false);
        }
    }, [selectedPaymentMethod]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        selectedPaymentMethod,
        isProcessing,
        isRedirecting,
        error,
        selectPaymentMethod,
        processPayment,
        clearError,
    };
};
