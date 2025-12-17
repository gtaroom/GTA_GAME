'use client';
import { useEffect } from 'react';
import { apiErrorHandler, tokenRefreshManager, httpWithErrorHandling } from '@/lib/api-error-handler';

// Initialize API interceptors
export function ApiInterceptor({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize error handler with proper callbacks
        apiErrorHandler.initialize({
            logout: () => {
                // Clear auth state
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-token');
                    sessionStorage.clear();
                    
                    // Dispatch custom event for auth context to listen to
                    window.dispatchEvent(new CustomEvent('auth-logout'));
                }
            },
            navigate: (path: string) => {
                if (typeof window !== 'undefined') {
                    window.location.href = path;
                }
            },
            showToast: (message: string, type: 'error' | 'warning' | 'success', duration = 3000) => {
                // You can integrate with your toast system here
                console.log(`Toast [${type}]: ${message}`);
                
                // Example: If you have a toast system, you can call it here
                // toast[type](message, { duration });
                
                // Dispatch custom event for components to listen to
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message, type, duration }
                    }));
                }
            }
        });

        // Set up global error handling for unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Check if it's an API error
            if (event.reason?.response || event.reason?.status || event.reason?.config) {
                apiErrorHandler.handleApiError(event.reason);
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return <>{children}</>;
}

// Enhanced HTTP client wrapper
export { httpWithErrorHandling as http };

// Export error handler utilities
export { apiErrorHandler, tokenRefreshManager };
