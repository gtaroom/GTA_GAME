/**
 * GoatPayments Hook
 * Custom hook for managing GoatPayments integration
 */

import { useState, useCallback, useEffect } from 'react';
import { goatPaymentsService } from '../services/goat-payments-service';
import { processGoatPayment } from '@/lib/api/wallet';
import type { PaymentMethodType } from '../config/goat-payments';
import type { CoinPackage } from '../types';

interface UseGoatPaymentsReturn {
    isLoading: boolean;
    error: string | null;
    processCardPayment: (packageData: CoinPackage) => Promise<void>;
    processApplePay: (packageData: CoinPackage) => Promise<void>;
    processGooglePay: (packageData: CoinPackage) => Promise<void>;
    clearError: () => void;
}

export const useGoatPayments = (): UseGoatPaymentsReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setIsLoading(false);
        setError(null);
    }, []);

    const processPayment = useCallback(async (
        packageData: CoinPackage,
        paymentMethod: PaymentMethodType
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            // Set up payment success handler
            const handlePaymentSuccess = async (event: any) => {
                const { response } = event.detail;
                const paymentToken: string = response?.token;
                const orderId = `GTO-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

                try {
                    const apiResponse = await processGoatPayment({
                        amount: packageData.amount,
                        paymentToken,
                        orderId,
                    });

                    if (apiResponse.success) {
                        // Redirect to success page with summary params
                        const params = new URLSearchParams({
                            amount: packageData.amount.toString(),
                            totalGC: (packageData.totalGC || 0).toString(),
                            bonusGC: (packageData.bonusGC || 0).toString(),
                            orderId,
                        });
                        window.location.href = `/buy-coins/success?${params.toString()}`;
                    } else {
                        setError(apiResponse.message || 'Payment processing failed');
                        const params = new URLSearchParams({
                            reason: apiResponse.message || 'Payment processing failed',
                        });
                        window.location.href = `/buy-coins/failed?${params.toString()}`;
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Payment processing failed');
                    const params = new URLSearchParams({
                        reason: err instanceof Error ? err.message : 'Payment processing failed',
                    });
                    window.location.href = `/buy-coins/failed?${params.toString()}`;
                } finally {
                    setIsLoading(false);
                    // goatPaymentsService.removePaymentHandler();
                }
            };

            // Set up payment handler
            goatPaymentsService.setupPaymentHandler(handlePaymentSuccess);

            // Handle user closing modal (cancel)
            const handleModalClose = () => {
                setIsLoading(false);
            };
            window.addEventListener('collectjs-modal-closed', handleModalClose);
            window.addEventListener('collectjs-error', handleModalClose as any);

            // Initialize payment based on method
            let result;
            switch (paymentMethod) {
                case 'card':
                    result = await goatPaymentsService.initializeCardPayment({
                        amount: packageData.amount,
                    });
                    break;
                case 'applepay':
                    result = await goatPaymentsService.initializeApplePay({
                        amount: packageData.amount,
                    });
                    break;
                case 'googlepay':
                    result = await goatPaymentsService.initializeGooglePay({
                        amount: packageData.amount,
                    });
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            if (!result.success) {
                const message = result.error || 'Payment initialization failed';
                setError(message);
                setIsLoading(false);
                // Redirect to failure page
                const params = new URLSearchParams({
                    reason: message,
                });
                window.location.href = `/buy-coins/failed?${params.toString()}`;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setIsLoading(false);
            const params = new URLSearchParams({
                reason: err instanceof Error ? err.message : 'Payment failed',
            });
            window.location.href = `/buy-coins/failed?${params.toString()}`;
        }
    }, []);

    const processCardPayment = useCallback((packageData: CoinPackage) => {
        return processPayment(packageData, 'card');
    }, [processPayment]);

    const processApplePay = useCallback((packageData: CoinPackage) => {
        return processPayment(packageData, 'applepay');
    }, [processPayment]);

    const processGooglePay = useCallback((packageData: CoinPackage) => {
        return processPayment(packageData, 'googlepay');
    }, [processPayment]);

    // Cleanup on unmount
    useEffect(() => {
        const cleanup = () => {
            goatPaymentsService.removePaymentHandler();
            window.removeEventListener('collectjs-modal-closed', () => {});
            window.removeEventListener('collectjs-error', () => {});
        };
        return cleanup;
    }, []);

    return {
        isLoading,
        error,
        processCardPayment,
        processApplePay,
        processGooglePay,
        clearError,
    };
};
