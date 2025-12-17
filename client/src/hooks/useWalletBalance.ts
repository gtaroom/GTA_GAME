/**
 * Custom hook for wallet balance management
 * Fetches and caches wallet balance with smart refresh logic
 */

import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/lib/api/wallet';
import type { BalanceResponse } from '@/types/wallet.types';
import { useAuth } from '@/contexts/auth-context';

interface UseWalletBalanceOptions {
  enableCache?: boolean;
}

interface WalletBalanceCache {
  balance: number;
  currency: string;
  timestamp: number;
}

// Cache duration: 1 minute (wallet balance changes frequently)
const CACHE_DURATION = 60 * 1000;

// In-memory cache
let balanceCache: WalletBalanceCache | null = null;

export function useWalletBalance(options: UseWalletBalanceOptions = {}) {
  const { enableCache = true } = options;
  const { isLoggedIn } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (enableCache && !forceRefresh && balanceCache) {
      const cacheAge = Date.now() - balanceCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('✅ Using cached wallet balance');
        setBalance(balanceCache.balance);
        setCurrency(balanceCache.currency);
        setLoading(false);
        return;
      }
    }

    console.log('🔄 Fetching wallet balance from API');
    setLoading(true);
    setError(null);

    try {
      const response = await getBalance() as BalanceResponse;

      if (response.success && response.data) {
        const { balance: bal, currency: cur } = response.data;

        // Update cache
        if (enableCache) {
          balanceCache = {
            balance: bal,
            currency: cur,
            timestamp: Date.now(),
          };
        }

        setBalance(bal);
        setCurrency(cur);
      } else {
        setError(response.message || 'Failed to fetch balance');
      }
    } catch (err) {
      console.error('Wallet balance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, []); // Remove enableCache from dependencies to prevent infinite loop

  // Fetch on mount only if user is logged in
  useEffect(() => {
    console.log('🔄 useWalletBalance effect triggered, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      console.log('✅ User is logged in, fetching balance');
      fetchBalance();
    } else {
      console.log('❌ User is not logged in, resetting balance state');
      // Reset state when not logged in
      setBalance(0);
      setCurrency('USD');
      setLoading(false);
      setError(null);
    }
  }, [fetchBalance, isLoggedIn]);

  // Refresh function (bypass cache)
  const refresh = useCallback(() => {
    balanceCache = null;
    fetchBalance(true);
  }, [fetchBalance]);

  // Clear cache utility
  const clearCache = useCallback(() => {
    balanceCache = null;
  }, []);

  return {
    balance,
    currency,
    loading,
    error,
    refresh,
    clearCache,
  };
}
