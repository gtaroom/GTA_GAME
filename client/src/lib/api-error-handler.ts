import { http } from "./api/http";

// Global flag to prevent multiple logout messages
let globalLogoutMessageShown = false;
let refreshingTokenInProgress = false;

// Error types for better handling
export enum ApiErrorType {
    UNAUTHORIZED = 'unauthorized',
    FORBIDDEN = 'forbidden',
    SESSION_EXPIRED = 'session_expired',
    TOKEN_INVALID = 'token_invalid',
    GEO_BLOCKED = 'geo_blocked',
    NETWORK_ERROR = 'network_error',
    SERVER_ERROR = 'server_error',
    VALIDATION_ERROR = 'validation_error',
    UNKNOWN = 'unknown'
}

export interface ApiError {
    type: ApiErrorType;
    message: string;
    status?: number;
    data?: any;
    originalError?: any;
}

// Enhanced error handler class
export class ApiErrorHandler {
    private static instance: ApiErrorHandler;
    private logoutCallback?: () => void;
    private navigateCallback?: (path: string) => void;
    private showToastCallback?: (message: string, type: 'error' | 'warning' | 'success', duration?: number) => void;

    private constructor() {}

    static getInstance(): ApiErrorHandler {
        if (!ApiErrorHandler.instance) {
            ApiErrorHandler.instance = new ApiErrorHandler();
        }
        return ApiErrorHandler.instance;
    }

    // Initialize with callbacks
    initialize(callbacks: {
        logout: () => void;
        navigate: (path: string) => void;
        showToast: (message: string, type: 'error' | 'warning' | 'success', duration?: number) => void;
    }) {
        this.logoutCallback = callbacks.logout;
        this.navigateCallback = callbacks.navigate;
        this.showToastCallback = callbacks.showToast;
    }

    // Parse error and determine type - Updated for fetch-based errors
    private parseError(error: any): ApiError {
        // Handle errors with response object (from our HTTP client)
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.message || 'An error occurred';
            const data = error.response.data || {};
            return this.parseResponseError({ message, data }, status);
        }

        // Handle errors with direct status property
        if (error.status) {
            const message = error.message || 'An error occurred';
            const data = error.data || {};
            return this.parseResponseError({ message, data }, error.status);
        }

        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                type: ApiErrorType.NETWORK_ERROR,
                message: 'Network error. Please check your connection.',
                originalError: error
            };
        }

        // Handle generic errors
        const message = error.message || error.toString() || 'An error occurred';
        return {
            type: ApiErrorType.UNKNOWN,
            message,
            originalError: error
        };
    }

    // Parse response-based errors
    private parseResponseError(response: any, status: number): ApiError {
        const message = response.message || response.statusText || 'An error occurred';
        const data = response.data || {};

        // Check for specific error patterns
        if (status === 401) {
            if (message.includes('jwt expired') || message.includes('token expired')) {
                return {
                    type: ApiErrorType.SESSION_EXPIRED,
                    message: 'Your session has expired. Please log in again.',
                    status,
                    data,
                    originalError: response
                };
            }
            if (message.includes('Unauthorized request') || message.includes('Invalid token')) {
                return {
                    type: ApiErrorType.TOKEN_INVALID,
                    message: 'Authentication failed. Please log in again.',
                    status,
                    data,
                    originalError: response
                };
            }
            return {
                type: ApiErrorType.UNAUTHORIZED,
                message: 'You are not authorized to perform this action.',
                status,
                data,
                originalError: response
            };
        }

        if (status === 403) {
            if (data?.errors?.includes('geo')) {
                return {
                    type: ApiErrorType.GEO_BLOCKED,
                    message: 'This service is not available in your region.',
                    status,
                    data,
                    originalError: response
                };
            }
            return {
                type: ApiErrorType.FORBIDDEN,
                message: 'Access denied. You do not have permission to perform this action.',
                status,
                data,
                originalError: response
            };
        }

        if (status >= 500) {
            return {
                type: ApiErrorType.SERVER_ERROR,
                message: 'Server error. Please try again later.',
                status,
                data,
                originalError: response
            };
        }

        if (status >= 400) {
            return {
                type: ApiErrorType.VALIDATION_ERROR,
                message: message || 'Invalid request. Please check your input.',
                status,
                data,
                originalError: response
            };
        }

        return {
            type: ApiErrorType.UNKNOWN,
            message: message || 'An unexpected error occurred.',
            status,
            data,
            originalError: response
        };
    }

    // Handle different error types
    private async handleError(apiError: ApiError): Promise<void> {
        switch (apiError.type) {
            case ApiErrorType.SESSION_EXPIRED:
                await this.handleSessionExpired();
                break;
            case ApiErrorType.TOKEN_INVALID:
                await this.handleTokenInvalid();
                break;
            case ApiErrorType.GEO_BLOCKED:
                this.handleGeoBlocked();
                break;
            case ApiErrorType.UNAUTHORIZED:
                this.handleUnauthorized();
                break;
            case ApiErrorType.FORBIDDEN:
                this.handleForbidden();
                break;
            case ApiErrorType.SERVER_ERROR:
                this.handleServerError();
                break;
            case ApiErrorType.NETWORK_ERROR:
                this.handleNetworkError();
                break;
            case ApiErrorType.VALIDATION_ERROR:
                this.handleValidationError(apiError.message);
                break;
            default:
                this.handleUnknownError(apiError.message);
        }
    }

    // Session expired handler
    private async handleSessionExpired(): Promise<void> {
        if (globalLogoutMessageShown) {
            console.log('Session expired handler: Already shown, skipping');
            return;
        }
        
        console.log('Session expired handler: Triggering logout and redirect');
        globalLogoutMessageShown = true;
        
        this.showToastCallback?.(
            'Your session has expired. Please log in again.',
            'warning',
            4000
        );

        this.logoutCallback?.();
        
        setTimeout(() => {
            this.navigateCallback?.('/login');
            setTimeout(() => {
                globalLogoutMessageShown = false;
            }, 3000);
        }, 1500);
    }

    // Token invalid handler
    private async handleTokenInvalid(): Promise<void> {
        if (globalLogoutMessageShown) {
            console.log('Token invalid handler: Already shown, skipping');
            return;
        }
        
        console.log('Token invalid handler: Triggering logout and redirect');
        globalLogoutMessageShown = true;
        
        this.showToastCallback?.(
            'Authentication failed. Please log in again.',
            'warning',
            4000
        );

        this.logoutCallback?.();
        
        setTimeout(() => {
            this.navigateCallback?.('/login');
            setTimeout(() => {
                globalLogoutMessageShown = false;
            }, 3000);
        }, 1500);
    }

    // Geo blocked handler
    private handleGeoBlocked(): void {
        this.showToastCallback?.(
            'This service is not available in your region.',
            'error',
            5000
        );
        
        setTimeout(() => {
            this.navigateCallback?.('/not-available');
        }, 2000);
    }

    // Unauthorized handler
    private handleUnauthorized(): void {
        this.showToastCallback?.(
            'You are not authorized to perform this action.',
            'error',
            3000
        );
    }

    // Forbidden handler
    private handleForbidden(): void {
        this.showToastCallback?.(
            'Access denied. You do not have permission to perform this action.',
            'error',
            3000
        );
    }

    // Server error handler
    private handleServerError(): void {
        this.showToastCallback?.(
            'Server error. Please try again later.',
            'error',
            3000
        );
    }

    // Network error handler
    private handleNetworkError(): void {
        this.showToastCallback?.(
            'Network error. Please check your connection.',
            'error',
            3000
        );
    }

    // Validation error handler
    private handleValidationError(message: string): void {
        this.showToastCallback?.(message, 'error', 3000);
    }

    // Unknown error handler
    private handleUnknownError(message: string): void {
        this.showToastCallback?.(message, 'error', 3000);
    }

    // Main error handler method
    async handleApiError(error: any): Promise<ApiError> {
        const apiError = this.parseError(error);
        await this.handleError(apiError);
        return apiError;
    }

    // Check if error should trigger logout
    shouldLogout(error: any): boolean {
        const apiError = this.parseError(error);
        return [
            ApiErrorType.SESSION_EXPIRED,
            ApiErrorType.TOKEN_INVALID
        ].includes(apiError.type);
    }

    // Check if error should redirect to login
    shouldRedirectToLogin(error: any): boolean {
        const apiError = this.parseError(error);
        return [
            ApiErrorType.SESSION_EXPIRED,
            ApiErrorType.TOKEN_INVALID,
            ApiErrorType.UNAUTHORIZED
        ].includes(apiError.type);
    }
}

// Token refresh functionality
export class TokenRefreshManager {
    private static instance: TokenRefreshManager;
    private refreshPromise: Promise<string> | null = null;

    private constructor() {}

    static getInstance(): TokenRefreshManager {
        if (!TokenRefreshManager.instance) {
            TokenRefreshManager.instance = new TokenRefreshManager();
        }
        return TokenRefreshManager.instance;
    }

    // Refresh access token
    async refreshAccessToken(): Promise<string> {
        // If refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performTokenRefresh();
        
        try {
            const newToken = await this.refreshPromise;
            return newToken;
        } finally {
            this.refreshPromise = null;
        }
    }

    private async performTokenRefresh(): Promise<string> {
        try {
            const response = await http<{ success: boolean; data: { accessToken: string } }>('/user/refresh-token', { 
                method: 'POST',
                cache: 'no-store'
            });
            
            if (response.success) {
                return response.data.accessToken;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            // Reset the promise on error
            this.refreshPromise = null;
            throw error;
        }
    }

    // Check if refresh is in progress
    isRefreshing(): boolean {
        return this.refreshPromise !== null;
    }
}

// Enhanced HTTP client with error handling
export async function httpWithErrorHandling<T = unknown>(
    path: string, 
    options: any = {},
    skipErrorHandling = false,
    refreshOnly = false
): Promise<T> {
    const errorHandler = ApiErrorHandler.getInstance();
    
    try {
        return await http<T>(path, options);
    } catch (error) {
        // If error handling is skipped, just throw the error
        if (skipErrorHandling) {
            throw error;
        }

        // Check if this is a refresh token request
        if (path.includes('refresh-token')) {
            throw error; // Let the error handler deal with refresh token errors
        }

        // Check if this is a 401 error and we should try to refresh
        if ((error as any)?.status === 401 && !path.includes('login')) {
            const tokenManager = TokenRefreshManager.getInstance();
            
            // If not already refreshing, try to refresh token
            if (!tokenManager.isRefreshing()) {
                try {
                    await tokenManager.refreshAccessToken();
                    // Retry the original request
                    return await http<T>(path, options);
                } catch (refreshError) {
                    // If refreshOnly mode, just throw the error without handling
                    if (refreshOnly) {
                        throw refreshError;
                    }
                    // If refresh fails, handle the error normally
                    await errorHandler.handleApiError(refreshError);
                    throw refreshError;
                }
            }
        }

        // Handle other errors
        await errorHandler.handleApiError(error);
        throw error;
    }
}

// Export singleton instances
export const apiErrorHandler = ApiErrorHandler.getInstance();
export const tokenRefreshManager = TokenRefreshManager.getInstance();
