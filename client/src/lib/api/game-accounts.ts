/**
 * Game Account API Module
 * Handles all game account-related API requests
 */

import { http } from './http';
import type {
    GameAccountStatusResponse,
    GameAccountDetailsResponse,
    StoreExistingAccountRequest,
    StoreExistingAccountResponse,
    RequestNewAccountRequest,
    RequestNewAccountResponse,
} from '@/types/game-account.types';

/**
 * Check user's account status for a specific game
 */
export async function getGameAccountStatus(gameId: string) {
    return http<GameAccountStatusResponse>(`/games/${gameId}/user-status`, {
        method: 'GET',
        cache: 'no-store',
    });
}

/**
 * Get user's account details for a specific game
 */
export async function getGameAccountDetails(gameId: string) {
    return http<GameAccountDetailsResponse>(`/game-accounts/my-account/${gameId}`, {
        method: 'GET',
        cache: 'no-store',
    });
}

/**
 * Store existing game account credentials
 */
export async function storeExistingAccount(payload: StoreExistingAccountRequest) {
    return http<StoreExistingAccountResponse>('/game-accounts/store-existing', {
        method: 'POST',
        body: payload,
    });
}

/**
 * Request a new game account
 */
export async function requestNewAccount(payload: RequestNewAccountRequest) {
    return http<RequestNewAccountResponse>('/game-accounts/request-new', {
        method: 'POST',
        body: payload,
    });
}
