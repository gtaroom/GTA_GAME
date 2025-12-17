/**
 * Payment Service
 * Handles payment-related API calls and business logic
 */

import { createDeposit } from '@/lib/api/wallet';
import type { DepositRequest, DepositResponse } from '@/types/wallet.types';

export interface PaymentService {
    createPayment: (request: DepositRequest) => Promise<DepositResponse>;
    redirectToPayment: (invoiceUrl: string) => Promise<void>;
}

class PaymentServiceImpl implements PaymentService {
    async createPayment(request: DepositRequest): Promise<DepositResponse> {
        try {
            const response = await createDeposit(request);
            return response;
        } catch (error) {
            console.error('Payment creation error:', error);
            throw new Error('Failed to create payment. Please try again.');
        }
    }

    redirectToPayment(invoiceUrl: string): Promise<void> {
        return new Promise((resolve) => {
            // Small delay to ensure UI updates are visible
            setTimeout(() => {
                window.location.href = invoiceUrl;
                resolve();
            }, 500);
        });
    }
}

export const paymentService = new PaymentServiceImpl();
