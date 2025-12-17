'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { useAuth } from './auth-context';
import { getBalance } from '@/lib/api/wallet';
import type { BalanceResponse } from '@/types/wallet.types';

interface WalletBalanceCache {
    balance: number;
    currency: string;
    timestamp: number;
}

interface WalletBalanceContextType {
    balance: number;
    currency: string;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    clearCache: () => void;
}

const WalletBalanceContext = createContext<WalletBalanceContextType | undefined>(undefined);

// Cache duration: 1 minute
const CACHE_DURATION = 60 * 1000;

// Global cache
let balanceCache: WalletBalanceCache | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export function WalletBalanceProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth();
    const [balance, setBalance] = useState<number>(0);
    const [currency, setCurrency] = useState<string>('USD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch wallet balance with global caching
    const fetchBalance = useCallback(async (forceRefresh = false) => {
        // Prevent multiple simultaneous requests
        if (isFetching && fetchPromise) {
            console.log('🔄 Balance fetch already in progress, waiting...');
            await fetchPromise;
            return;
        }

        // Check cache first
        if (!forceRefresh && balanceCache) {
            const cacheAge = Date.now() - balanceCache.timestamp;
            if (cacheAge < CACHE_DURATION) {
                console.log('✅ Using cached wallet balance');
                setBalance(balanceCache.balance);
                setCurrency(balanceCache.currency);
                setLoading(false);
                setError(null);
                return;
            }
        }

        console.log('🔄 Fetching wallet balance from API');
        isFetching = true;
        setLoading(true);
        setError(null);

        fetchPromise = (async () => {
            try {
                const response = await getBalance() as BalanceResponse;

                if (response.success && response.data) {
                    const { balance: bal, currency: cur } = response.data;

                    // Update cache
                    balanceCache = {
                        balance: bal,
                        currency: cur,
                        timestamp: Date.now(),
                    };

                    setBalance(bal);
                    setCurrency(cur);
                    setError(null);
                } else {
                    setError(response.message || 'Failed to fetch balance');
                }
            } catch (err) {
                console.error('Wallet balance fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch balance');
            } finally {
                setLoading(false);
                isFetching = false;
                fetchPromise = null;
            }
        })();

        await fetchPromise;
    }, []);

    // Fetch on mount only if user is logged in
    useEffect(() => {
        console.log('🔄 WalletBalanceProvider effect triggered, isLoggedIn:', isLoggedIn);
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
            // Clear cache when user logs out
            balanceCache = null;
        }
    }, [fetchBalance, isLoggedIn]);

    // Refresh function (bypass cache)
    const refresh = useCallback(() => {
        console.log('🔄 Force refreshing wallet balance');
        balanceCache = null;
        fetchBalance(true);
    }, [fetchBalance]);

    // Clear cache utility
    const clearCache = useCallback(() => {
        console.log('🗑️ Clearing wallet balance cache');
        balanceCache = null;
    }, []);

    return (
        <WalletBalanceContext.Provider
            value={{
                balance,
                currency,
                loading,
                error,
                refresh,
                clearCache,
            }}
        >
            {children}
        </WalletBalanceContext.Provider>
    );
}

export function useWalletBalance() {
    const context = useContext(WalletBalanceContext);
    if (context === undefined) {
        throw new Error('useWalletBalance must be used within a WalletBalanceProvider');
    }
    return context;
}
