/**
 * Wallet API Module
 * Handles all wallet-related API requests
 */

import { http } from './http';
import type {
  BalanceResponse,
  TransactionListResponse,
  TransactionParams,
  DepositRequest,
  DepositResponse,
  WithdrawalRequest,
  WithdrawalResponse,
  GameRechargeRequest,
  GameRechargeResponse,
} from '@/types/wallet.types';

/**
 * Get user wallet balance
 */
export async function getBalance() {
  return http<BalanceResponse>('/wallet/balance', {
    method: 'GET',
    cache: 'no-store', // Always fetch fresh balance
  });
}

/**
 * Get transaction history with filters
 */
export async function getTransactions(params?: TransactionParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `/wallet/transactions${queryString ? `?${queryString}` : ''}`;

  return http<TransactionListResponse>(url, {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Create a deposit request
 */
export async function createDeposit(payload: DepositRequest) {
  return http<DepositResponse>('/wallet/deposit', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Create a withdrawal request
 */
export async function createWithdrawal(payload: WithdrawalRequest) {
  return http<WithdrawalResponse>('/withdrawal-requests', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Recharge game account (Add Game Loot)
 */
export async function rechargeGame(payload: GameRechargeRequest) {
  return http<GameRechargeResponse>('/recharge-requests', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Redeem coupon code
 */
export async function redeemCoupon(payload: { code: string }) {
  return http<{ success: boolean; message: string; newBalance: number }>('/coupons/redeem', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Process GoatPayments payment
 */
export async function processGoatPayment(payload: { amount: number; paymentToken: string; orderId: string }) {
  return http<{ success: boolean; message?: string; data?: { creditedAmount: number; bonusAmount?: number } }>(
    '/wallet/goat/process',
    {
      method: 'POST',
      body: payload,
    }
  );
}