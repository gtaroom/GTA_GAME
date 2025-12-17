/**
 * Custom hook for transaction management with server-side filtering and pagination
 * Industrial-level implementation: only fetches what's needed
 * 
 * Cache Strategy:
 * - Cache persists until manual refresh or page reload
 * - No auto-expiration - YOU control when to fetch fresh data
 * - Page refresh always fetches fresh data (cache is in-memory)
 */

import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '@/lib/api/wallet';
import type { Transaction, TransactionParams, TransactionListResponse } from '@/types/wallet.types';

interface UseTransactionsOptions {
  initialLimit?: number;
  enableCache?: boolean;
}

interface CacheEntry {
  data: TransactionListResponse;
}

// In-memory cache map: key = query params, value = response
// Note: Cleared automatically on page refresh
const cacheMap = new Map<string, CacheEntry>();

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { initialLimit = 20, enableCache = true } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<TransactionParams>({
    type: undefined,
    status: undefined,
  });

  // Generate cache key from params
  const getCacheKey = useCallback((params: TransactionParams & { page: number; limit: number }): string => {
    return JSON.stringify({
      page: params.page,
      limit: params.limit,
      type: params.type,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }, []);

  // Fetch transactions from API with server-side filtering and pagination
  const fetchTransactions = useCallback(async () => {
    const params: TransactionParams & { page: number; limit: number } = {
      page: pagination.page,
      limit: pagination.limit,
      type: filters.type,
      status: filters.status,
    };

    const cacheKey = getCacheKey(params);

    // Check cache first (no expiration - persists until manual refresh)
    if (enableCache) {
      const cached = cacheMap.get(cacheKey);
      if (cached) {
        console.log('✅ Using cached transactions');
        const { data } = cached.data;
        setTransactions(data.transactions);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages,
        }));
        setLoading(false);
        return;
      }
    }

    console.log('🔄 Fetching from API:', params);
    setLoading(true);
    setError(null);

    try {
      const response = await getTransactions(params) as TransactionListResponse;

      if (response.success && response.data) {
        const { transactions: txns, total, pages } = response.data;

        // Cache the response (no timestamp - persists until manual clear)
        if (enableCache) {
          cacheMap.set(cacheKey, {
            data: response,
          });
        }

        setTransactions(txns);
        setPagination(prev => ({
          ...prev,
          total,
          pages,
        }));
      } else {
        setError(response.message || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, getCacheKey, enableCache]);

  // Fetch on mount and when filters/pagination change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle type filter change (triggers new API call)
  const handleTypeFilter = useCallback((value: string) => {
    console.log('🔍 Filter changed - fetching from backend');
    setFilters(prev => ({
      ...prev,
      type: value === 'all' ? undefined : (value as 'deposit' | 'withdrawal'),
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  }, []);

  // Handle status filter change (triggers new API call)
  const handleStatusFilter = useCallback((value: string) => {
    console.log('🔍 Filter changed - fetching from backend');
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? undefined : (value as 'completed' | 'pending' | 'failed' | 'cancelled'),
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  }, []);

  // Refresh data (bypass cache) - useful after payment redirect
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh - clearing cache');
    cacheMap.clear();
    fetchTransactions();
  }, [fetchTransactions]);

  // Change page (triggers new API call)
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  return {
    transactions,
    loading,
    error,
    pagination,
    filters,
    handleTypeFilter,
    handleStatusFilter,
    refresh,
    setPage,
  };
}
