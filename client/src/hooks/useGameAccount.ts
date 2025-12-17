/**
 * Game Account Hook
 * Custom hook for managing game account operations
 */

import { useState, useCallback, useEffect } from 'react';
import {
    getGameAccountStatus,
    getGameAccountDetails,
    storeExistingAccount,
    requestNewAccount,
} from '@/lib/api/game-accounts';
import type {
    GameAccountStatusResponse,
    GameAccountDetailsResponse,
    StoreExistingAccountRequest,
    RequestNewAccountRequest,
    UseGameAccountReturn,
} from '@/types/game-account.types';

export const useGameAccount = (): UseGameAccountReturn => {
    const [accountStatus, setAccountStatus] = useState<GameAccountStatusResponse['data'] | null>(null);
    const [accountDetails, setAccountDetails] = useState<GameAccountDetailsResponse['data'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const checkAccountStatus = useCallback(async (gameId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getGameAccountStatus(gameId);
            
            if (response.data) {
                setAccountStatus(response.data);
            } else {
                setError(response.message || 'Failed to check account status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check account status');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Listen for global refresh events triggered by notifications
    // When we receive 'trigger-check-game-account', refetch status for that gameId
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ gameId: string }>;
            const targetGameId = custom.detail?.gameId;
            if (targetGameId) {
                checkAccountStatus(targetGameId);
            }
        };
        window.addEventListener('trigger-check-game-account', handler as EventListener);
        return () => window.removeEventListener('trigger-check-game-account', handler as EventListener);
    }, [checkAccountStatus]);

    const getAccountDetails = useCallback(async (gameId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getGameAccountDetails(gameId);
            
            if (response.data) {
                setAccountDetails(response.data);
            } else {
                setError(response.message || 'Failed to get account details');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get account details');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const storeExistingAccountData = useCallback(async (data: StoreExistingAccountRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await storeExistingAccount(data);
            
            if (response.data) {
                setAccountDetails(response.data);
                // Refresh account status after storing
                await checkAccountStatus(data.gameId);
            } else {
                setError(response.message || 'Failed to store account');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to store account');
        } finally {
            setIsLoading(false);
        }
    }, [checkAccountStatus]);

    const requestNewAccountData = useCallback(async (data: RequestNewAccountRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await requestNewAccount(data);
            
            if (response.data) {
                // Refresh account status after requesting
                await checkAccountStatus(data.gameId);
            } else {
                setError(response.message || 'Failed to request new account');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request new account');
        } finally {
            setIsLoading(false);
        }
    }, [checkAccountStatus]);

    return {
        accountStatus,
        accountDetails,
        isLoading,
        error,
        checkAccountStatus,
        getAccountDetails,
        storeExistingAccount: storeExistingAccountData,
        requestNewAccount: requestNewAccountData,
        clearError,
    };
};
