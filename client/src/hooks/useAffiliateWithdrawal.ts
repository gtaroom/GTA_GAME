'use client';

import { useState, useCallback } from 'react';
import {
  getAffiliateBalance,
  getAffiliateBalancePublic,
  createWithdrawalRequest,
  createWithdrawalRequestPublic,
  getWithdrawalHistory,
  getWithdrawalHistoryPublic,
  type AffiliateBalanceResponse,
  type WithdrawalRequestPayload,
  type WithdrawalHistoryItem,
} from '@/lib/api/affiliate';
import { toastSuccess, toastError } from '@/lib/toast';

export interface WithdrawalBalance {
  totalEarnings: number;
  totalPaid: number;
  pendingWithdrawals: number;
  availableBalance: number;
  minimumWithdrawal: number;
}

export interface WithdrawalPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useAffiliateWithdrawal(publicToken?: string) {
  const [balance, setBalance] = useState<WithdrawalBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [pagination, setPagination] = useState<WithdrawalPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = publicToken
        ? await getAffiliateBalancePublic(publicToken)
        : await getAffiliateBalance();

      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        toastError(response.message || 'Failed to load balance');
      }
    } catch (error: any) {
      console.error('Failed to fetch balance:', error);
      toastError(error?.message || 'Failed to load balance');
    } finally {
      setIsLoading(false);
    }
  }, [publicToken]);

  // Fetch withdrawal history
  const fetchHistory = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const response = publicToken
          ? await getWithdrawalHistoryPublic(publicToken, page, pagination.limit)
          : await getWithdrawalHistory(page, pagination.limit);

        if (response.success && response.data) {
          setWithdrawals(response.data.withdrawals);
          setPagination(response.data.pagination);
        } else {
          toastError(response.message || 'Failed to load withdrawal history');
        }
      } catch (error: any) {
        console.error('Failed to fetch history:', error);
        toastError(error?.message || 'Failed to load withdrawal history');
      } finally {
        setIsLoading(false);
      }
    },
    [publicToken, pagination.limit]
  );

  // Submit withdrawal request
  const submitWithdrawal = useCallback(
    async (payload: WithdrawalRequestPayload) => {
      // Validate amount
      if (!balance) {
        toastError('Balance not loaded');
        return { success: false };
      }

      if (payload.amount < balance.minimumWithdrawal) {
        toastError(
          `Minimum withdrawal is $${balance.minimumWithdrawal.toFixed(2)}`
        );
        return { success: false };
      }

      if (payload.amount > balance.availableBalance) {
        toastError(
          `Insufficient balance. Available: $${balance.availableBalance.toFixed(2)}`
        );
        return { success: false };
      }

      setIsSubmitting(true);
      try {
        const response = publicToken
          ? await createWithdrawalRequestPublic({ ...payload, token: publicToken })
          : await createWithdrawalRequest(payload);

        if (response.success) {
          toastSuccess(
            response.message ||
              'Withdrawal request submitted successfully! You will receive an email confirmation.'
          );
          // Refresh balance and history
          await fetchBalance();
          await fetchHistory(1);
          return { success: true };
        } else {
          toastError(response.message || 'Failed to submit withdrawal request');
          return { success: false };
        }
      } catch (error: any) {
        console.error('Failed to submit withdrawal:', error);
        toastError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to submit withdrawal request'
        );
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [balance, publicToken, fetchBalance, fetchHistory]
  );

  // Change page
  const changePage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= pagination.pages) {
        fetchHistory(newPage);
      }
    },
    [pagination.pages, fetchHistory]
  );

  return {
    balance,
    withdrawals,
    pagination,
    isLoading,
    isSubmitting,
    fetchBalance,
    fetchHistory,
    submitWithdrawal,
    changePage,
  };
}

